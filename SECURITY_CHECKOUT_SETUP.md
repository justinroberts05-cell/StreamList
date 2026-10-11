# StreamList Google Sign In and Checkout

Justin Roberts — individual INT499 work.

## Google configuration

1. Open https://console.cloud.google.com/ and select or create a project.
2. In Google Auth platform, configure Branding (StreamList and contact email), Audience, and the consent configuration. If the app remains in Testing, add your Google account as a test user when required.
3. In Clients, create a **Web application** client. Add `http://localhost:5173` as an Authorized JavaScript origin. Add `http://localhost:3001` if you will demonstrate the production build. Use the exact hostname and port used in the browser; `127.0.0.1` is a different origin. Add it separately if using it.
4. Copy the client ID ending in `.apps.googleusercontent.com`. This integration uses the Google Identity Services button with a callback, so an application redirect URI is not used. Do not add or disclose a client secret.
5. Keep the existing TMDB setting in the private `.env` file. Append these lines, replacing the placeholder:

```dotenv
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
APP_ORIGIN=http://localhost:5173
PORT=3001
```

6. Restart both the authentication server and Vite after configuring the values. Allow popups as necessary for Google's account selection. Do not enter a Google password anywhere other than Google's own sign-in interface.

Google setup reference: https://developers.google.com/workspace/guides/create-credentials
Button integration: https://developers.google.com/identity/gsi/web/guides/display-button

## Development run

In a terminal in `C:\Users\justi\Documents\streamlist`:

```powershell
npm.cmd run auth
```

Leave it running. In a second terminal in the same folder:

```powershell
npm.cmd run dev
```

Open **http://localhost:5173/**. If the old dev process is still running, stop it with Ctrl+C before restarting. All application paths redirect to `/login` unless the backend confirms a session. Once Google verifies the user, the system interface opens. Sign out deletes the server session. Sessions expire with the Google ID token and disappear when the server restarts.

## Production and PWA demonstration

Stop any development authentication server already using port 3001. Build and start in PowerShell:

```powershell
npm.cmd run build
$env:APP_ORIGIN='http://localhost:3001'
npm.cmd start
```

Open **http://localhost:3001/**. Authorize this origin in Google. HTTPS is required for public hosting; run the Node service behind an HTTPS reverse proxy and set APP_ORIGIN to that exact public origin. This localhost server listens on loopback. Do not publish a Vite preview as the operational authentication service.

The service worker caches the local interface only; `/api/` requests bypass its cache. Authentication requires an online server session. Cached pages do not grant offline sign-in. Google script loading and sign-in also require a network connection. This supersedes the earlier unrestricted offline demonstration instructions.

## Checkout demonstration

1. Sign in using Google.
2. Open Subscriptions and add a subscription or accessory.
3. Open Cart, review its total, and choose Checkout.
4. Enter fictional name `Demo User`, card `1234567890123456`, and expiry `12/2030`. The form displays `1234 5678 9012 3456` automatically.
5. Save the demo card, refresh, and show that it remains. Delete saved card to remove it.
6. Sign out. Open `/checkout` directly to show the login-only restriction.

The form requires 16 digits and a current MM/YYYY expiration. It saves name, formatted card number, and expiration in localStorage under the signed-in Google subject. It intentionally does not collect or store a CVV, and does not validate a real card with a payment processor or charge it. This meets the classroom storage demonstration. Do not enter real financial data. For operational payments, replace it with provider-hosted/tokenized checkout; localStorage is readable by JavaScript and is not an appropriate real-card vault.

Watchlist and cart records are now scoped to the signed-in account. Existing shared browser selections migrate to the first signed-in account only. Browser storage remains local, editable, and unsynced; this is not backend record authorization.

## Verification

```powershell
npm.cmd run build
npm.cmd run lint
npm.cmd run test:security
node --test cart.test.mjs
```

With production preview on port 4173, `node --test pwa.test.mjs` checks the generated worker and manifest. The API server must also run, and its APP_ORIGIN must match the preview origin for sign-in.

Recorded checks: production build, ESLint, existing cart tests, worker tests, signed-token validation (signature, issuer, audience, nonce, expiry, email verification), card validation, anonymous session, and cross-origin rejection. Browser tests use a mocked session to exercise checkout independently of Google configuration; they are not proof of live Google sign-in. Real Google login and the complete identity-provider flow remain pending your client configuration.

## Submission

Repository: https://github.com/justinroberts05-cell/StreamList

These changes have not been committed or pushed. Include this setup document with the assignment files. Keep `.env`, credentials, node_modules, and dist out of uploads; they are ignored by Git. Do not delete your local dependencies just to commit code. When making a ZIP for upload, exclude node_modules.

Record the running application in Zoom. Describe implementation, then demonstrate the actual Google sign-in, protected route, cart-to-checkout flow, formatted fictional card, persistence, deletion, and sign out. Submit your own recording for this individual assignment. Do not claim live Google verification until your configured account flow succeeds.
