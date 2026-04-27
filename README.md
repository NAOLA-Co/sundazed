# Party Pay QR

Party Pay QR is a zero-backend static web app for personal house-party reimbursement. The host builds the order, the guest only picks a tip, and the app generates a Venmo QR code and URL that work well on mobile.

## Files

- `index.html`
- `styles.css`
- `app.js`
- `manifest.json`
- `service-worker.js`
- `icon.svg`

## Features

- Static-only HTML, CSS, and JavaScript
- Mobile-first layout designed for iPhone Safari
- PWA support with `manifest.json` and `service-worker.js`
- Host flow, guest flow, and QR confirmation flow
- Local-only settings saved in `localStorage`
- Venmo note locked to allowed drink emojis only
- Tip options including no tip, percentages, and custom dollar amount
- QR generation using `qrcode.js`

## Venmo Format

The app generates URLs in this format:

```text
https://venmo.com/captkamikaze?txn=pay&amount=12.34&note=%F0%9F%8D%BA%F0%9F%8D%B8
```

Example test URL:

```text
https://venmo.com/captkamikaze?txn=pay&amount=12.34&note=%F0%9F%8D%BA%F0%9F%8D%B8
```

## QR Library

This app loads `qrcode.js` from the Cloudflare CDN:

- `https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js`

That keeps the project simple and avoids any build tools or package manager setup. The service worker will cache the script after the first successful load. If you want the app to be fully self-contained with no CDN dependency, download that file and change the script tag in `index.html` plus the cache list in `service-worker.js`.

## Local Settings

The app stores the following in `localStorage` only:

- Venmo username
- Default preset item list
- Default pre-selected note icons
- Current cart

It does not use a backend or database.

## GitHub Pages Deployment

1. Create a new GitHub repository, for example `party-pay-qr`.
2. Upload all files from this folder to the repository root.
3. Open the repository on GitHub.
4. Go to `Settings` -> `Pages`.
5. Under `Source`, choose `Deploy from branch`.
6. Choose branch `main` and folder `/ (root)`.
7. Save, then open the GitHub Pages URL, such as `https://USERNAME.github.io/party-pay-qr/`.
8. On iPhone Safari, tap `Share` -> `Add to Home Screen`.

## Notes

- All asset paths are relative, so the app works on GitHub Pages project URLs.
- The app uses reimbursement wording and is designed for personal party cost-sharing, not a business point-of-sale flow.
- Safari install behavior is best when the site is served over HTTPS, which GitHub Pages provides automatically.
