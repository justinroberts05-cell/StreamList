# StreamList — INT499 Part 1

Individual project: Justin Roberts. The actual source folder is `C:\Users\justi\Documents\streamlist`.

## Changes

- Added `public/manifest.webmanifest` with app identity, root scope/start URL, standalone display, theme/background colors, and 192/512 PNG icons plus a maskable icon.
- Added manifest, theme, description, and touch-icon metadata to the existing HTML.
- Added production-only registration in `src/registerServiceWorker.js`.
- Added `pwa-plugin.js` to the existing Vite configuration. Every build writes `dist/sw.js` from `service-worker.template.js`, including a content-based cache version and a list of every built local asset. No new dependency is required.
- Precache includes the compiled React/CSS, HTML, manifest, icons and catalog images. Navigation returns the cached shell for React Router routes. TMDB requests remain online. Existing localStorage watchlist/cart behavior is unchanged.
- Updates wait until existing app windows close. New activation removes only older StreamList caches. Close all app tabs/windows and reopen after a new build.
- Added `pwa.test.mjs` to verify icon dimensions, real served cache resources, offline route/asset responses, and exclusion of TMDB requests.

Existing feature components and styling were preserved. Pre-existing edits to `src/data.js` and `public/images/` were left in place.

## Run and test

Open PowerShell:

```powershell
Set-Location 'C:\Users\justi\Documents\streamlist'
& 'C:\Program Files\nodejs\npm.cmd' run build
& 'C:\Program Files\nodejs\npm.cmd' run lint
node --test cart.test.mjs
& 'C:\Program Files\nodejs\npm.cmd' run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

Leave preview running. In a second terminal in the same project folder:

```powershell
node --test pwa.test.mjs
```

The explicit npm.cmd avoids the broken npm launcher observed in this session. Alternatively, `node node_modules/vite/bin/vite.js build` and `node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4173 --strictPort` use the installed Vite directly. Dependencies are already installed. If setting up a fresh checkout, use `npm.cmd ci` first.

## Desktop installation and offline browser check

1. In a normal Chrome or Edge window, open `http://127.0.0.1:4173/`. Use this same origin throughout; localhost and 127.0.0.1 have separate storage. Do not use a file URL or the development server for this check.
2. In DevTools > Application > Manifest, verify the manifest and icons load without installability errors. In Service Workers, verify `sw.js` is activated and controls this page. Wait for installation to finish, then refresh.
3. Keep "Bypass for network" and "Update on reload" unchecked. In Cache Storage, confirm the `streamlist-shell-…` cache includes index.html, JS, CSS and local images.
4. Add/edit/complete a watchlist title, then refresh to confirm persistence. Add a subscription and accessory, adjust accessory quantity, confirm total, try adding a second subscription, and remove an item. Search Movies while online.
5. Use the address-bar Install icon or browser menu's install command when offered. Confirm the prompt identifies StreamList, then open it in its standalone window. Installation can be suppressed by private browsing, an existing installation, browser policy or a dismissed prompt; try a normal uninstalled profile and inspect the Manifest panel errors. An automatic popup is not guaranteed.
6. Return to the browser, select Offline in DevTools Network, then reload `/`, `/cart`, `/subscriptions`, `/movies`, and `/about`. Verify navigation, saved watchlist/cart and local catalog images. Try an edit offline and refresh. Movie search should report a connection error, not promise fresh results. Restore Online afterward.
7. Record only after the offline and install checks succeed in that browser. Deployment needs HTTPS, hosting at the domain root, and a fallback to index.html for direct React Router URLs. Serve `sw.js` with revalidation/no-cache and the correct JavaScript content type. `vite preview` is for local checking, not production hosting.

The existing Google Material Symbols stylesheet is external; a first-ever offline session may lack those decorative glyphs. Button text remains present. Offline support requires one successful online installation/cache population and browser storage availability.

## Verification recorded in this session

- Production build: passed. Full ESLint: passed.
- Cart tests: passed. Production worker/manifest integration test: passed.
- Browser: add/edit/complete and refreshed watchlist; subscription/accessory cart; quantity and refreshed totals; navigation; live TMDB Inception search returned 12 results.
- Browser offline reload: not verified. With the local server stopped, the available in-app browser showed a blank page after the worker-generation fix. Worker cache/navigation behavior passed the automated integration test, but this does not establish browser offline behavior.
- Desktop Install option: not observed. Chrome/Edge were not available through connected browser tools. Complete the manual checks above before claiming installation/offline results in the recording.

References: https://developer.chrome.com/docs/lighthouse/pwa/installable-manifest and https://vite.dev/guide/static-deploy.html
