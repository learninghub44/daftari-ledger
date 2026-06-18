# Daftari — Publishing Guide (Play Store & App Store)

## ─── STEP 1: PREREQUISITES ─────────────────────────────────

### Accounts you need
| Account | URL | Cost |
|---|---|---|
| Expo (EAS Build) | expo.dev | Free |
| Google Play Console | play.google.com/console | $25 one-time |
| Apple Developer | developer.apple.com | $99/year |

### Install EAS CLI
```bash
npm install -g eas-cli
eas login
```

---

## ─── STEP 2: CONFIGURE EAS BUILD ───────────────────────────

Run inside `artifacts/mobile/`:
```bash
eas build:configure
```

This creates `eas.json`. Verify it looks like this:
```json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": { "buildType": "app-bundle" },
      "ios": { "resourceClass": "m-medium" }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## ─── STEP 3: CONFIGURE app.json ─────────────────────────────

Make sure your `app.json` / `app.config.js` has:
```json
{
  "expo": {
    "name": "Daftari",
    "slug": "daftari",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "daftari",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0D1B3E"
    },
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.yourname.daftari",
      "buildNumber": "1"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0D1B3E"
      },
      "package": "com.yourname.daftari",
      "versionCode": 1,
      "permissions": []
    },
    "extra": {
      "eas": { "projectId": "YOUR-EAS-PROJECT-ID" }
    }
  }
}
```

---

## ─── STEP 4: SET PRODUCTION ENVIRONMENT VARIABLES ──────────

EAS Secrets (run these once — they stay in your EAS account):
```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL    --value "https://your-project.supabase.co"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-anon-key"
eas secret:create --scope project --name EXPO_PUBLIC_GROQ_API_KEY    --value "your-groq-key"
```

---

## ─── STEP 5: BUILD FOR ANDROID ─────────────────────────────

```bash
# AAB (needed for Play Store)
eas build --platform android --profile production

# APK (for direct install / testing)
eas build --platform android --profile preview
```

Build takes ~10-15 minutes. Download the `.aab` from expo.dev when done.

---

## ─── STEP 6: PUBLISH TO GOOGLE PLAY ────────────────────────

1. Go to **play.google.com/console** → Create app
2. Fill in: App name = "Daftari", Category = "Finance", Free
3. **Store listing** tab:
   - Short description (80 chars): "Credit book for Kenyan businesses. Track debts & payments."
   - Full description: explain the app features
   - Upload **2-8 screenshots** (min 1080×1920 for phone)
   - Upload **Feature graphic** (1024×500)
   - Upload **App icon** (512×512 PNG)
4. **Content rating** tab: Complete questionnaire → Finance app, no violence
5. **Production** tab → Create release → Upload your `.aab`
6. **Countries / regions** → Select Kenya (and others)
7. Submit for review — takes 1-7 days

---

## ─── STEP 7: BUILD FOR IOS ──────────────────────────────────

```bash
eas build --platform ios --profile production
```

You need a Mac or EAS cloud build. EAS handles provisioning profiles automatically.

---

## ─── STEP 8: PUBLISH TO APP STORE ──────────────────────────

1. Go to **App Store Connect** (appstoreconnect.apple.com)
2. Create new app → iOS App
3. Fill in bundle ID (must match `app.json`), SKU, name
4. **App Information**: Category = Finance, sub = Personal Finance
5. **Pricing**: Free
6. **App Privacy**: Add data types you collect (email, financial data)
7. **Screenshots**: upload 6.7" iPhone screenshots (1290×2796)
8. Upload build via: `eas submit --platform ios` OR Transporter app
9. Submit for review — takes 1-3 days

---

## ─── STEP 9: REQUIRED ASSETS CHECKLIST ─────────────────────

| Asset | Size | Notes |
|---|---|---|
| App icon | 1024×1024 | No rounded corners — stores add them |
| Android adaptive icon (foreground) | 1024×1024 | Subject area in center 66% |
| Splash screen | 1284×2778 | Navy background #0D1B3E |
| Phone screenshots (Android) | 1080×1920 | Min 2, max 8 |
| Phone screenshots (iOS) | 1290×2796 | Min 3 for App Store |
| Feature graphic (Play) | 1024×500 | Shown in Play Store listing |

---

## ─── STEP 10: PRIVACY POLICY (REQUIRED) ────────────────────

Both stores require a privacy policy URL. Host it on any website.

**Minimum content:**
- What data you collect (email, business/transaction data)
- How you use it (app functionality only)
- Third parties (Supabase for storage, Groq for AI)
- How to delete account/data
- Contact email

Free hosting: GitHub Pages, Notion public page, or Google Sites.
URL example: `https://yourname.github.io/daftari-privacy`

---

## ─── UPDATE CYCLE ───────────────────────────────────────────

For OTA updates (JS-only changes, no native code):
```bash
eas update --branch production --message "Fix: improved AI reminders"
```
No store review needed for OTA updates!

For native changes (new permissions, new packages):
```bash
# Bump versionCode (Android) and buildNumber (iOS) in app.json, then:
eas build --platform all --profile production
eas submit --platform all
```
