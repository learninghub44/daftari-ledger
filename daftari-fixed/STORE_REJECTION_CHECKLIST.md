# Daftari — Store Rejection Checklist
## What Gets Apps Rejected (and how to avoid it)

---

## 🔴 CRITICAL — Will Always Reject

### 1. No Privacy Policy
**Both stores require this.** Must be a real URL, not "coming soon."
- ✅ Fix: Host one on GitHub Pages before submitting

### 2. App Crashes on Launch
**#1 rejection reason for both stores.**
- ✅ Fix: Test on a real device AND on Android 10+ / iOS 15+ before submitting
- ✅ Fix: Test with airplane mode on (offline state)
- ✅ Fix: Test with no account (empty state) and with data

### 3. Login Required for Full Review
Apple reviewers must be able to access all features.
- ✅ Fix: Add reviewer credentials in App Review Information:
  - Demo email: reviewer@daftari.app (create this in Supabase Auth)
  - Demo password: DaftariReview2024!
  - Add note: "Pre-populated with sample customers and transactions"

### 4. Broken Core Feature During Review
If the AI doesn't respond, or transactions fail to save — instant reject.
- ✅ Fix: Test Groq API key validity. Test adding/editing/deleting a customer.

### 5. Missing Required App Permissions Justification
If you request any permission (camera, contacts, notifications), you must explain why.
- ✅ Fix: Daftari currently uses NO special permissions — keep it this way as long as possible.
  - If you add camera for receipts, add: "Used to photograph receipts for transaction records"

---

## 🟡 COMMON — Frequent Rejection Reasons

### 6. Missing App Store Screenshots
- Play Store: minimum 2 phone screenshots
- App Store: minimum 3 screenshots for 6.7" iPhone display
- ✅ Fix: Take screenshots on a real device or simulator showing:
  - Login screen
  - Dashboard with data
  - Customer list
  - AI chat with a response
  - Reports screen

### 7. Incomplete Metadata
- Category mismatch (use "Finance")
- Vague description
- Keywords that don't match app content
- ✅ Fix: Use "credit book", "duka", "debt tracker", "mkopo", "Kenya" as keywords

### 8. Placeholder Content / "Beta" / "Coming Soon"
- Any screen that says "Feature coming soon" must be removed or be unavailable
- ✅ Fix: The export buttons in Reports say "Export will be available in the next update" via Alert — this is fine. Remove any "beta" labels from UI.

### 9. Non-Responsive UI / Tiny Touch Targets
- Buttons must be at least 44×44 points
- Text must be readable without zooming
- ✅ Fix: All Daftari buttons are 44px+ height — you're good

### 10. No Graceful Error States
- If the internet is off, app must not crash — show a message
- ✅ Fix: DataContext returns cached data and transactions show an Alert on error

---

## 🟢 APPLE-SPECIFIC REJECTIONS

### 11. Using Non-Apple Payment APIs for Digital Goods (iOS)
If you ever charge users for features inside the app, you MUST use Apple's In-App Purchase.
- ✅ Fix: Daftari is free with no in-app purchases — no issue. If you add subscriptions later, use RevenueCat.

### 12. Requesting Too Many Permissions at Once
Apple rejects apps that ask for permissions before explaining why.
- ✅ Fix: Only request permissions when the user triggers the feature that needs it.

### 13. Guideline 2.1 — App Completeness
Apple rejects apps that feel like demos or have limited functionality.
- ✅ Fix: All 5 tabs are functional. AI chat works. Ensure all CRUD operations work before submitting.

### 14. Sign In with Apple Required
If you offer Google/Facebook login, you MUST also offer Sign in with Apple.
- ✅ Fix: Daftari uses email/password only (Supabase Auth) — no third-party social login — so this rule doesn't apply.

### 15. App Name Already Taken
"Daftari" may conflict with existing apps.
- ✅ Fix: Check App Store Connect when creating the app. Have 2-3 backup names:
  - "Daftari - Credit Book"
  - "Duka Daftari"
  - "Mkopo Tracker"

---

## 🟢 GOOGLE PLAY-SPECIFIC REJECTIONS

### 16. Finance App Policy — Loan App Rules
Play Store has STRICT rules for financial apps in Kenya/Africa.
**Critical:** Daftari is a credit TRACKER (ledger), NOT a lending app. Make this clear.
- ✅ Fix: Description must say: "Daftari helps businesses TRACK existing credit given to customers. We do not provide loans or financial services."
- ✅ Fix: Do NOT use words like "loan", "lend", "borrow" anywhere in your store listing

### 17. Sensitive Permissions for Finance Apps
Play Store may require a financial regulatory declaration for apps handling financial data.
- ✅ Fix: Fill in the "Financial Features" declaration in Play Console accurately. Daftari is a bookkeeping tool, not a payment processor.

### 18. Target API Level
Play Store requires apps to target Android API 34+ (Android 14).
- ✅ Fix: This is handled automatically by Expo SDK 52+. No action needed.

### 19. 64-bit Support
- ✅ Fix: Expo/React Native builds are already 64-bit compatible.

### 20. No "Spyware" Signals
Accessing contacts, location, SMS without clear user need = instant ban.
- ✅ Fix: Daftari requests ZERO sensitive permissions. ✓

---

## PRE-SUBMISSION FINAL CHECKLIST

Before you press "Submit for Review":

**Functionality**
- [ ] Sign up with new email works
- [ ] Sign in / sign out works
- [ ] Add a customer works
- [ ] Add credit transaction works
- [ ] Add payment works
- [ ] AI chat returns a response
- [ ] AI reminder generates and can be copied
- [ ] Reports show correct totals
- [ ] Settings save business name/phone/location
- [ ] App works with no internet (shows cached data)
- [ ] App works on an empty account (no customers yet)

**Store Requirements**
- [ ] Privacy Policy URL is live
- [ ] App icon is 1024×1024, no transparency, no rounded corners
- [ ] At least 3 screenshots uploaded
- [ ] App description doesn't mention loans or lending
- [ ] Reviewer demo account created and noted in submission
- [ ] Version number is 1.0.0, build number is 1
- [ ] No "beta", "test", "demo", "coming soon" text in UI

**Legal**
- [ ] Privacy Policy mentions: email, transaction data, Supabase, Groq AI
- [ ] Terms of Service drafted (optional but recommended)
- [ ] You own all images/icons (no copyrighted assets)
