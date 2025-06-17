// place files you want to import through the `$lib` alias in this folder.

import { writable } from "svelte/store"

export type state = "unknown" | "offline" | "online" | "partially-online"
export const dark = writable(false)