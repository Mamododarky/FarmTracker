# RS3 Farm Run Tracker — Alt1 app

This folder is a complete static Alt1 application. It includes `appconfig.json`, the compact overlay layout, farming plot alarms, and regular Manor Farm pen timers.

## Install after hosting

Alt1 apps are webpages, so this folder must be served from an HTTP/HTTPS address. Once hosted, install it with:

```text
alt1://addapp/https://YOUR-HOST/PATH/appconfig.json
```

Or open the hosted `index.html` in Alt1's Browser and use the Add App prompt.

## Easiest permanent hosting: GitHub Pages

1. Create a new public GitHub repository.
2. Upload **the contents of this folder** to the repository root.
3. Open **Settings → Pages**.
4. Choose **Deploy from a branch**, branch **main**, folder **/(root)**.
5. After Pages publishes, use:

```text
alt1://addapp/https://YOUR-GITHUB-NAME.github.io/REPOSITORY-NAME/appconfig.json
```

## Alarm behavior

- Keep the installed Alt1 app open or pinned for live sounds.
- Timers use saved absolute timestamps, so closing Alt1 does not erase them.
- When reopened, anything overdue is shown as an alarm immediately.
- Press **Enable sound** once per opened app session because browser audio requires user interaction.
- **Snooze 1h** snoozes every active plot and Manor Farm alarm.
- Active alarms are acknowledged only by **Start Run**, matching the requested workflow.

## Scope

- Farming patches from the 200m route
- Regular Manor Farm only
- Ranch Out of Time is intentionally excluded
- Manual tracker only; it does not read or control the game client
