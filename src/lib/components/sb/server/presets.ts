export type Preset = {
    name: string;
    image: string;
    logo: string;
    ports: Record<string, number>;
    envs: Record<string,string>;
    mount: string
}

export const presets: Preset[] = [
    {
        name: 'Nginx',
        image: 'nginx',
        logo: 'https://static.cdnlogo.com/logos/n/68/nginx.svg',
        envs: {
            NGINX_HOST: 'example.com',
            NGINX_PORT: '${PORT_HTTP}',
        },
        ports: {
            HTTP: 80,
            HTTPS: 443
        },
        mount: '/usr/share/nginx/html'
    },
    {
        name: 'PostgreSQL',
        image: 'postgres',
        logo: 'https://static.cdnlogo.com/logos/p/93/postgresql.svg',
        envs: {
            POSTGRES_PASSWORD: 'your_password',
            POSTGRES_USER: 'your_user',
            POSTGRES_DB: 'your_database',
            PGPORT: '${PORT_PG}'
        },
        ports: {
            PG: 5432,
        },
        mount: '/var/lib/postgresql/data'
    },
    {
        name: 'Minecraft',
        image: 'itzg/minecraft-server',
        logo: 'https://static.cdnlogo.com/logos/m/26/minecraft.svg',
        envs: {
            EULA: 'TRUE',
            VERSION: 'LATEST',
            TYPE: 'PAPER',
            SERVER_PORT: '${PORT_MC}',
            SERVERBENCH_SK: '${SERVERBENCH_SK}',
            SERVERBENCH_SERVER: '${SERVERBENCH_SERVER}',
            SERVERBENCH_INSTANCE: '${SERVERBENCH_INSTANCE}',
            MOTD: 'a Minecraft Server hosted by serverbench',
            PLUGINS: 'https://github.com/serverbench/minecraft-plugin/releases/download/pre-25-jun-1/serverbench-beta.jar'
        },
        ports: {
            MC: 25565,
        },
        mount: '/data'
    }
]