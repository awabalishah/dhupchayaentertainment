# Dhupchaya Entertainment — Website

Static business website for Dhupchaya Entertainment (Bangla natoks, YouTube films and music). No build step is needed.

## Run locally
```bash
python3 -m http.server 5173
```
Then open http://localhost:5173

## Structure
- `index.html` — page sections: hero, originals, spotlight, music, about, partner with us, contact
- `css/styles.css` — all styles; brand colours are defined as CSS variables at the top (taken from the logo gradient)
- `js/data.js` — **the catalogue**: titles, cast, directors, view counts, YouTube IDs. Edit this to add new releases.
- `js/main.js` — rendering, hero slideshow, video player modal, filters, animations
- `assets/` — logo (original JPG and a transparent PNG) and the channel banner

## Contact form
The form opens the visitor's email app, addressed to dhupchayaentertainment@gmail.com. To receive submissions directly, point it at Formspree or a backend in `js/main.js`.

## Deploy
The folder can be deployed as is to GitHub Pages, Netlify, Vercel or Cloudflare Pages.
