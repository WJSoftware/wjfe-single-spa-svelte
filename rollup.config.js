import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";
import svelte from "rollup-plugin-svelte";

export default defineConfig({
    input: 'src/index.svelte.ts',
    output: {
        file: 'dist/index.js',
        format: 'esm'
    },
    plugins: [
        typescript(),
        svelte({
            include: 'src/**/*.svelte.ts',
        }),
        nodeResolve({
            browser: true,
            exportConditions: ['svelte'],
            extensions: ['svelte.ts']
        })
    ]
});
