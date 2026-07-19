RS3 FARM TRACKER — BUILD 10.0 PRODUCTION

GITHUB UPDATE
1. Copy index.html, appconfig.json, and the assets folder into the root of your FarmTracker repository.
2. Replace the existing files.
3. Commit and push origin in GitHub Desktop.
4. Wait for GitHub Pages to deploy.
5. Fully close and reopen the Alt1 app.

LIVE APP
https://mamododarky.github.io/FarmTracker/

ALT1 INSTALL LINK
alt1://addapp/https://mamododarky.github.io/FarmTracker/appconfig.json?build=10.0

NOTES
- Timers are saved in localStorage and catch up when the app is reopened.
- A fully closed Alt1 app cannot actively chime until reopened.
- Skip never starts or resets a patch timer.
- Start Run acknowledges current alarms. Ready locations skipped during a ready route are re-armed.
- Cycle-aligned timing is optional and requires calibration; Safe full time is the default.
