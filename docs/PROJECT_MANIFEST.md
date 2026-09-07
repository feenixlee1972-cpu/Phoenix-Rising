# Phoenix Rises — Project Manifest

This file is the handoff map for future maintenance.

## Core application
- `index.html` — web application UI and local app logic.
- `android/` — Android WebView project.
- `android/app/src/main/assets/enhancements.js` — agent/mining/payout enhancements and timer lifecycle handling.
- `android/app/src/main/assets/payout_currency.js` — CAD/USD display controls and mining market-price placeholders.
- `android/app/src/main/java/com/phoenixrises/app/MainActivity.java` — Android WebView launcher and asset injection.
- `.github/workflows/build-apk.yml` — reproducible Android build and source-backup workflow.

## Visual master
The saved `Neon Phoenix Earnings Dashboard.png` is the visual reference. Preserve its neon cyberpunk Phoenix Rises composition when restoring or improving the UI.

## Payout routing
- Gold Mining → Canadian dollars (CAD).
- Bitcoin Mining → Bitcoin (BTC) directly to a verified wallet/network.
- Other verified earnings → PayPal or Bank.

## Important boundary
The client app can collect and display a payout request, but a real payout requires a secure server-side integration with the actual payment/financial provider. Never put secrets in the APK and never mark a payout successful without provider confirmation.

## Release artifacts
The GitHub Actions workflow is configured to publish both the APK and a complete source backup as artifacts after a successful build.
