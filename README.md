# Styled by Sunny

Landing page and house-call booking flow for Sunny, an LA hairstylist and colorist based in Torrance (Instagram: [@styledby.sunny](https://www.instagram.com/styledby.sunny/)).

Plain HTML, CSS and JavaScript. No build step, no dependencies.

| File | What it is |
| --- | --- |
| `index.html` | Landing page with the scissors intro |
| `book.html` + `book.js` | Four-step booking request: service, address, day, details |
| `styles.css` | All styles. Color and type tokens are at the top |
| `scripts/preflight.mjs` | Launch check |

Run it locally with `npm start`, then open http://localhost:8080.

## Before it goes live

`npm run preflight` lists exactly what is left. Right now that is:

1. **Prices.** Replace every `[PRICE]` in `index.html` and `book.html`, and `[TRAVEL FEE]` in `index.html`.
2. **Service area.** Replace `[SERVICE AREA]` in `index.html`.
3. **Photos.** Each `data-placeholder` arch takes one photo. Swap the label for an `<img>` and remove the attribute:
   `<div class="arch"><img src="assets/sunny.jpg" alt="Sunny, hairstylist and colorist"></div>`
   Portrait crops near 4:5 fit best. One of Sunny, three of her work.
4. **Form endpoint.** Set `FORM_ENDPOINT` at the top of `book.js`. Formspree works with no backend. A Make.com webhook works too and can text or email Sunny on each request. Until it is set, the flow runs in preview mode and sends nothing.

Confirm with Sunny before launch, because these were written without her:

- The four services and their descriptions
- "You need a chair near an outlet and a sink close by"
- "Your address is used only to plan this visit"
- Morning, afternoon and evening as the time options

After the domain is known, add `og:url`, an `og:image` (1200x630), and `"url"` in the JSON-LD block in `index.html`.

## Deploy

It is a static site, so any host works. Upload the repo root as the web root (SiteGround: `public_html`). On GitHub Pages: Settings, Pages, deploy from `main`, root folder.

Put the booking page in the Instagram bio link (`/book.html`) so clients land straight in the flow.

## Built for the Instagram in-app browser

Most clients will open this from Instagram, so it is built for that WebView first:

- One column at phone width, 44px or larger tap targets, no hover-only controls
- Inputs are 16px or larger, so iOS does not zoom on focus
- No fixed bottom bars, which collide with Instagram's toolbar and the keyboard
- No file upload, which is unreliable in the WebView. Clients DM inspo photos instead
- Nothing opens in a new tab or popup
- Each booking step is a history entry, so the back gesture goes back one step and keeps the form
- The intro runs once per session in about 3 seconds, skips on tap, and is off for reduced-motion users. It never blocks the page: CSS ends it, and a timer removes it as a fallback
