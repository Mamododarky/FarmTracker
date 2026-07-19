# FarmTracker v8.1.1 Hotfix

This package fixes the inert-button issue caused by a v8 `app.js` being deployed with a v7 `index.html`.

## Replace these files

Copy **everything in this folder** into the root of your local `FarmTracker` repository and choose **Replace**. Commit and push all changes.

The app is now self-contained inside `index.html`; old `app.js`, `styles.css`, `alt1-bridge.js`, and `alt1-overlay.css` files may remain in the repository, but this build does not load them.

After GitHub Pages deploys, close and reopen the Alt1 app. If Alt1 keeps an old page, remove and reinstall using:

`alt1://addapp/https://mamododarky.github.io/FarmTracker/appconfig.json?build=8.1.1`

Open the menu and confirm it displays **Build 8.1.1**.
