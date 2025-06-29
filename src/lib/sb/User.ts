import { jwtDecode } from "jwt-decode";
import Community from "./Community";
import { Mutex } from "async-mutex";

const product = 'serverbench.io'

export default class User {

    public readonly id: string | null
    private accessToken: string | null
    private refreshToken: string | null
    private test: boolean
    private static instance: User | null = null
    public static onLogin?: () => Promise<void>
    public static onLogout?: () => void
    public getAccessToken() {
        return this.accessToken
    }

    private constructor(id: string, accessToken: string | null, refreshToken: string | null, test: boolean) {
        this.id = id
        this.accessToken = accessToken
        this.refreshToken = refreshToken
        this.test = test
    }

    public static fromObject(obj: any) {
        return new User(obj.id, null, null, false)
    }

    public isTest() {
        return this.test
    }

    public static async login(service: string, state: string = (Math.random() + 1).toString(36).substring(7)): Promise<User> {
        const redirect_uri = `https://${product}`
        return new Promise(async (resolve, reject) => {
            let success: boolean = false
            const handleResponse = async (ev: MessageEvent<any>, tab: Window) => {
                if (ev.data.type !== "authorization_response") return
                const response = ev.data.response.response
                if (response.state != state) reject('invalid state')
                const session = await User.exchangeCode(response.code, redirect_uri)
                session.store()
                await User.get()
                try {
                    tab.close()
                } catch (error) {
                    window.focus()
                }
                success = true
                resolve(session)
            }
            const tab = window.open(`https://sso.nominal.es/authorize?method=${service}&response_type=code&redirect_uri=${redirect_uri}&audience=${product}&state=${state}`)
            if (tab == null) {
                reject('error while opening tab')
                return
            }
            tab.addEventListener('message', async (ev) => {
                await handleResponse(ev, tab)
            })
            tab.addEventListener('unload ', () => {
                if (!success) reject('closed')
                return
            })
            const interval = setInterval(() => {
                if (tab.closed) {
                    reject('closed')
                    clearInterval(interval)
                }
            }, 100)
            window.addEventListener('message', async (ev) => {
                await handleResponse(ev, tab)
            })
        })
    }

    private static async exchangeCode(code: string, redirect_uri: string) {
        const res = await fetch('https://sso.nominal.es/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                redirect_uri,
                grant_type: 'authorization_code',
                code
            })
        })
        const data = await res.json()
        return new User("", data.access_token, data.refresh_token, !window.location.origin.includes('serverbench.io'))
    }

    public static async get(): Promise<User | null> {
        if (User.instance != null) {
            return User.instance.renewIfDue()
        }
        const accessToken = localStorage.getItem('accessToken')
        const refreshToken = localStorage.getItem('refreshToken')
        if (accessToken == null || refreshToken == null) {
            console.log('null tokens')
            User.logout()
            return null
        }
        User.instance = new User("", accessToken, refreshToken, !window.location.origin.includes('serverbench.io'))
        if (this.onLogin) await this.onLogin()
        return User.instance.renewIfDue()
    }

    public socket(action: string, callback: (result: any) => void) {
        const url = new URL(`${this.test ? 'ws://localhost:3030' : 'wss://stream.beta.serverbench.io'}/`)
        url.searchParams.append('token', this.accessToken!)
        const ws = new WebSocket(url.toString())
        ws.onopen = () => {
            ws.send(JSON.stringify({
                action,
                rid: this.randomRid()
            }))
        }
        ws.onmessage = (m) => {
            const parsed = JSON.parse(m.data)
            if (parsed.result) {
                callback(parsed.result)
            } else {
                ws.send(JSON.stringify({
                    rid: this.randomRid(),
                    action: [parsed.realm, parsed.action].join('.')
                }))
            }
        }
        return ws
    }

    public pipe(action: string, params: Record<string, any>, callback: (result: any) => void, connect: () => void, disconnect: () => void) {
        const url = new URL(`${this.test ? 'ws://localhost:3030' : 'wss://stream.beta.serverbench.io'}/`)
        url.searchParams.append('token', this.accessToken!)
        const ws = new WebSocket(url.toString())
        const rid = this.randomRid()
        ws.onopen = () => {
            ws.send(JSON.stringify({
                action,
                params,
                rid: rid
            }))
        }
        ws.onmessage = (m) => {
            const parsed = JSON.parse(m.data)
            if (parsed.rid) {
                connect()
            } else if (parsed.data && !parsed.end) {
                callback(parsed.data)
            } else if (parsed.end) {
                ws.close()
            }
        }
        ws.onclose = () => {
            disconnect()
        }
        return ws
    }

    private randomRid() {
        return (Math.random() + 1).toString(36).substring(7)
    }

    private store() {
        localStorage.setItem('accessToken', this.accessToken!)
        localStorage.setItem('refreshToken', this.refreshToken!)
    }

    public static logout() {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        Community.unselect()
        User.instance = null
        if (this.onLogout) this.onLogout()
    }

    private async call(path: string, method: 'GET' | 'POST' | 'PATCH' | 'DELETE', body?: any) {
        if ((method == 'GET' || method == 'DELETE') && body) throw new Error('invalid call')
        const headers = new Headers({
            authorization: `Bearer ${this.accessToken}`,
        })
        let finalBody: any
        if (body) {
            if (body instanceof File) {
                const formData = new FormData();
                formData.append('file', body)
                finalBody = formData
            } else {
                headers.set('content-type', 'application/json')
                finalBody = JSON.stringify(body)
            }
        }
        const req = await fetch(`https://${this.test ? 'dev.serverbench.io' : 'api.beta.serverbench.io'}${path}`, {
            headers,
            body: finalBody,
            method: method
        })
        if (req.status == 204) return
        if (req.status == 200) return req.json()
        throw new Error(req.status.toString())
    }

    public get(path: string) {
        return this.call(path, 'GET')
    }

    public post(path: string, body?: any) {
        return this.call(path, 'POST', body)
    }

    public patch(path: string, body?: any) {
        return this.call(path, 'PATCH', body)
    }

    public delete(path: string) {
        return this.call(path, 'DELETE')
    }

    private static renewMutex = new Mutex();

    private async renewIfDue() {
        const release = await User.renewMutex.acquire();
        try {
            const access = jwtDecode(this.accessToken!)
            const now = Math.trunc(new Date().getTime() / 1000) + 60
            if (access.exp! < now) {
                const refresh = jwtDecode(this.refreshToken!)
                if (refresh.exp! < now) {
                    throw new Error('refresh expired')
                }
                const res = await fetch('https://sso.nominal.es/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        refresh_token: this.refreshToken,
                        grant_type: 'refresh_token',
                    })
                })
                const data = await res.json()
                this.accessToken = data.access_token
                this.refreshToken = data.refresh_token
                this.store()
            }
            return this
        } catch (error) {
            User.logout()
            return null
        } finally {
            release();
        }
    }

}