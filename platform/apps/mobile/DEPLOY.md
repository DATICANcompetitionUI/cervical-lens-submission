# CervicalLens Mobile — EAS Deployment

Linked EAS project: **`@halleluyaholudele/cervicallens`**
(`https://expo.dev/accounts/halleluyaholudele/projects/cervicallens`, ID
`55d3df5e-5929-4955-bcc8-2635ce716e3e`).

## Build profiles (`eas.json`)

| Profile | Distribution | Use | API target |
|---|---|---|---|
| `development` | internal (dev client) | local dev against Android emulator | `http://10.0.2.2:8000/api/v1` |
| `preview` | internal (APK) | share a build with testers | `https://cervicallens-api.vercel.app/api/v1` ✅ live |
| `production` | store | Play/App Store submission | `https://cervicallens-api.vercel.app/api/v1` ✅ live |

The backend is deployed and verified (auth, genomic risk, and ONNX cytology
screening all respond in production) — see `apps/api` and the root README.

## Commands

```bash
cd platform/apps/mobile

# local dev (Metro + Expo Go / dev client)
bun run dev

# cloud build — internal APK for testers
eas build --profile preview --platform android

# cloud build — dev client (for on-device debugging w/ native modules)
eas build --profile development --platform android

# production build
eas build --profile production --platform all
eas submit --profile production --platform android
```

## Before the first store submission
1. Confirm the Android package (`com.cervicallens.app`) / iOS bundle ID are
   final — changing them after a store submission is painful.
2. Replace the placeholder icon/splash/adaptive-icon assets in `assets/` —
   they haven't been updated for the light "Fintech Command Center" theme.
3. No cloud build has been run yet; `eas build` consumes build quota, so it's
   left as a deliberate manual step.
