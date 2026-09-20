// import { defineConfig } from 'vite'
// import path from "path"
// import fs from "fs"
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'
// import sitemapPlugin from 'vite-plugin-sitemap'

// const outDir = path.resolve(__dirname, 'dist')

// // https://vite.dev/config/
// export default defineConfig({
//     plugins: [
//         react(),
//         tailwindcss(),
//         {
//             name: 'ensure-outdir-exists',
//             closeBundle() {
//                 fs.mkdirSync(outDir, { recursive: true })
//             },
//         },
//         sitemapPlugin({
//             hostname: 'https://upgearbd.com',
//             outDir,
//         }),
//     ],
//     build: {
//         outDir,
//     },
//     resolve: {
//         alias: {
//             "@": path.resolve(__dirname, "./src"),
//         },
//     },
// })


import { defineConfig } from 'vite'
import path from "path"
import fs from "fs"
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import sitemapPlugin from 'vite-plugin-sitemap'

const outDir = path.resolve(__dirname, 'dist')

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        {
            name: 'ensure-outdir-exists',
            closeBundle() {
                fs.mkdirSync(outDir, { recursive: true })
            },
        },
        sitemapPlugin({
            hostname: 'https://upgearbd.com',
            outDir,
        }),
    ],
    build: {
        outDir,
        target: ['es2018', 'safari12', 'chrome70'],
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
})