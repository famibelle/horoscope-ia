2:51:06 PM: Netlify Build                                                 
2:51:06 PM: ────────────────────────────────────────────────────────────────
2:51:06 PM: ​
2:51:06 PM: ❯ Version
2:51:06 PM:   @netlify/build 35.13.4
2:51:06 PM: ​
2:51:06 PM: ❯ Flags
2:51:06 PM:   accountId: 6a007a4d871b3a41176cf79b
2:51:06 PM:   baseRelDir: true
2:51:06 PM:   buildId: 6a12f41c85be2a00082f06b5
2:51:06 PM:   deployId: 6a12f41c85be2a00082f06b7
2:51:07 PM: ​
2:51:07 PM: ❯ Current directory
2:51:07 PM:   /opt/build/repo
2:51:07 PM: ​
2:51:07 PM: ❯ Config file
2:51:07 PM:   /opt/build/repo/netlify.toml
2:51:07 PM: ​
2:51:07 PM: ❯ Context
2:51:07 PM:   production
2:51:07 PM: ​
2:51:07 PM: ❯ Using Next.js Runtime - v5.15.11
2:51:08 PM: Next.js cache restored
2:51:08 PM: ​
2:51:08 PM: build.command from netlify.toml                               
2:51:08 PM: ────────────────────────────────────────────────────────────────
2:51:08 PM: ​
2:51:08 PM: $ next build
2:51:09 PM:   ▲ Next.js 14.2.0
2:51:09 PM:    Creating an optimized production build ...
2:51:12 PM: Failed to compile.
2:51:12 PM: 
2:51:12 PM: app/layout.tsx
2:51:12 PM: An error occurred in `next/font`.
2:51:12 PM: Error: Cannot find module 'tailwindcss'
2:51:12 PM: Require stack:
2:51:12 PM: - /opt/build/repo/node_modules/next/dist/build/webpack/config/blocks/css/plugins.js
2:51:12 PM: - /opt/build/repo/node_modules/next/dist/build/webpack/config/blocks/css/index.js
2:51:12 PM: - /opt/build/repo/node_modules/next/dist/build/webpack/config/index.js
2:51:12 PM: - /opt/build/repo/node_modules/next/dist/build/webpack-config.js
2:51:12 PM: - /opt/build/repo/node_modules/next/dist/build/webpack-build/impl.js
2:51:12 PM: - /opt/build/repo/node_modules/next/dist/compiled/jest-worker/processChild.js
2:51:12 PM:     at Module._resolveFilename (node:internal/modules/cjs/loader:1207:15)
2:51:12 PM:     at /opt/build/repo/node_modules/next/dist/server/require-hook.js:55:36
2:51:12 PM:     at Function.resolve (node:internal/modules/helpers:193:19)
2:51:12 PM:     at loadPlugin (/opt/build/repo/node_modules/next/dist/build/webpack/config/blocks/css/plugins.js:49:32)
2:51:12 PM:     at /opt/build/repo/node_modules/next/dist/build/webpack/config/blocks/css/plugins.js:157:56
2:51:12 PM:     at Array.map (<anonymous>)
2:51:12 PM:     at getPostCssPlugins (/opt/build/repo/node_modules/next/dist/build/webpack/config/blocks/css/plugins.js:157:47)
2:51:12 PM:     at async /opt/build/repo/node_modules/next/dist/build/webpack/config/blocks/css/index.js:124:36
2:51:12 PM: app/layout.tsx
2:51:12 PM: An error occurred in `next/font`.
2:51:12 PM: Error: Cannot find module 'tailwindcss'
2:51:12 PM: Require stack:
2:51:12 PM: - /opt/build/repo/node_modules/next/dist/build/webpack/config/blocks/css/plugins.js
2:51:12 PM: - /opt/build/repo/node_modules/next/dist/build/webpack/config/blocks/css/index.js
2:51:12 PM: - /opt/build/repo/node_modules/next/dist/build/webpack/config/index.js
2:51:12 PM: - /opt/build/repo/node_modules/next/dist/build/webpack-config.js
2:51:12 PM: - /opt/build/repo/node_modules/next/dist/build/webpack-build/impl.js
2:51:12 PM: - /opt/build/repo/node_modules/next/dist/compiled/jest-worker/processChild.js
2:51:12 PM:     at Module._resolveFilename (node:internal/modules/cjs/loader:1207:15)
2:51:12 PM:     at /opt/build/repo/node_modules/next/dist/server/require-hook.js:55:36
2:51:12 PM:     at Function.resolve (node:internal/modules/helpers:193:19)
2:51:12 PM:     at loadPlugin (/opt/build/repo/node_modules/next/dist/build/webpack/config/blocks/css/plugins.js:49:32)
2:51:12 PM:     at /opt/build/repo/node_modules/next/dist/build/webpack/config/blocks/css/plugins.js:157:56
2:51:12 PM:     at Array.map (<anonymous>)
2:51:12 PM:     at getPostCssPlugins (/opt/build/repo/node_modules/next/dist/build/webpack/config/blocks/css/plugins.js:157:47)
2:51:12 PM:     at async /opt/build/repo/node_modules/next/dist/build/webpack/config/blocks/css/index.js:124:36
2:51:12 PM: ./app/horoscope/[sign]/page.tsx
2:51:12 PM: Module not found: Can't resolve '@/lib/signs-data'
2:51:12 PM: https://nextjs.org/docs/messages/module-not-found
2:51:12 PM: ./app/horoscope/[sign]/page.tsx
2:51:12 PM: Module not found: Can't resolve '@/lib/edition'
2:51:12 PM: https://nextjs.org/docs/messages/module-not-found
2:51:12 PM: ./app/horoscope/[sign]/page.tsx
2:51:12 PM: Module not found: Can't resolve '@/components/AudioPlayer'
2:51:12 PM: https://nextjs.org/docs/messages/module-not-found
2:51:12 PM: > Build failed because of webpack errors
2:51:12 PM: ​
2:51:12 PM: "build.command" failed                                        
2:51:12 PM: ────────────────────────────────────────────────────────────────
2:51:12 PM: ​
2:51:12 PM:   Error message
2:51:12 PM:   Command failed with exit code 1: next build (https://ntl.fyi/exit-code-1)
2:51:12 PM: ​
2:51:12 PM:   Error location
2:51:12 PM:   In build.command from netlify.toml:
2:51:12 PM:   next build
2:51:12 PM: ​
2:51:12 PM:   Resolved config
2:51:12 PM:   build:
2:51:12 PM:     command: next build
2:51:12 PM:     commandOrigin: config
2:51:12 PM:     environment:
2:51:12 PM:       - GITHUB_PAT
2:51:12 PM:       - MISTRAL_API_KEY
2:51:12 PM:       - NODE_VERSION
2:51:12 PM:       - ENABLE_ON_DEMAND_GENERATION
2:51:12 PM:       - ENABLE_BACKGROUND_GENERATION
2:51:12 PM:       - SKIP_PREBUILD
2:51:12 PM:       - NETLIFY_URL
2:51:12 PM:       - NODE_ENV
2:51:12 PM:     processing:
2:51:12 PM:       skip_processing: false
2:51:12 PM:     publish: /opt/build/repo/.next
2:51:12 PM:     publishOrigin: config
2:51:12 PM:   functionsDirectory: /opt/build/repo/.next
2:51:12 PM:   headers:
2:51:13 PM: Failed during stage 'building site': Build script returned non-zero exit code: 2 (https://ntl.fyi/exit-code-2)
2:51:13 PM:     - for: /data/horoscopes/*.json
      values:
        Access-Control-Allow-Methods: GET, OPTIONS
        Access-Control-Allow-Origin: "*"
        Cache-Control: no-store, max-age=0, must-revalidate
    - for: /data/signe-du-jour/*.json
      values:
        Access-Control-Allow-Origin: "*"
        Cache-Control: no-store, max-age=0, must-revalidate
    - for: /data/ambiance/*.json
      values:
        Access-Control-Allow-Origin: "*"
        Cache-Control: no-store, max-age=0, must-revalidate
    - for: /*.css
      values:
        Cache-Control: public, max-age=31536000, immutable
    - for: /*.js
      values:
        Cache-Control: public, max-age=31536000, immutable
    - for: /*.png
      values:
        Cache-Control: public, max-age=31536000, immutable
    - for: /*.jpg
      values:
        Cache-Control: public, max-age=31536000, immutable
    - for: /*.svg
      values:
        Cache-Control: public, max-age=31536000, immutable
  headersOrigin: config
  plugins:
    - inputs: {}
      origin: ui
      package: "@netlify/plugin-nextjs"
  redirects:
    - from: /health
      status: 307
      to: /api/horoscope/_health
    - from: /health/*
      status: 307
      to: /api/horoscope/_health/:splat
  redirectsOrigin: config
2:51:13 PM: Build failed due to a user error: Build script returned non-zero exit code: 2
2:51:13 PM: Failing build: Failed to build site
2:51:13 PM: Finished processing build request in 35.803s
