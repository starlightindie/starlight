declare module '*.css';
declare module 'vite' { export function defineConfig(config: unknown): unknown; }
declare module 'node:path' { export function resolve(...paths: string[]): string; }
declare const __dirname: string;
declare namespace chrome { namespace storage { const sync: { get<T extends object>(defaults?: T): Promise<T>; set(values: object): Promise<void>; }; } namespace runtime { const onInstalled: { addListener(callback: () => void): void; }; } }
