# Google Play Store Launch Checklist

## ✅ Completed
- [x] App configuration (app.json)
- [x] Package name set (in.apollosage.medresus)
- [x] Version number (1.0.0)
- [x] Icons and splash screen
- [x] Android permissions configured
- [x] Copyright notices
- [x] License/subscription system

## ❌ Required Before Submission

### 1. Privacy Policy (CRITICAL)
- [ ] **Create privacy policy** covering:
  - Email collection and storage
  - Case data (patient info, logs, timestamps)
  - Local storage (AsyncStorage)
  - No third-party data sharing (currently)
  - Data retention and deletion
  - User rights (GDPR if applicable)
- [ ] **Host privacy policy** at a public URL (GitHub Pages, your website, etc.)
- [ ] **Add privacy policy URL** to app.json:
  ```json
  "android": {
    "privacyPolicy": "https://yoursite.com/privacy"
  }
  ```

### 2. Store Listing Content
Create these in your Google Play Console:

#### App Details
- [ ] **Title**: "MedResus - Resuscitation Logger" (max 50 chars)
- [ ] **Short description** (max 80 chars):
  ```
  Real-time cardiac arrest documentation and quality metrics for healthcare teams
  ```
- [ ] **Full description** (max 4000 chars) - see template below
- [ ] **App category**: Medical
- [ ] **Content rating**: Complete questionnaire (Medical app)
- [ ] **Target audience**: Healthcare professionals
- [ ] **Contact email**: snmandal1953@gmail.com
- [ ] **Privacy policy URL**: [Your URL here]

#### Graphics
- [ ] **App icon**: 512x512 PNG (already have medresus-icon.png - resize if needed)
- [ ] **Feature graphic**: 1024x500 PNG (required for new apps)
- [ ] **Phone screenshots**: Minimum 2, up to 8 (1080x1920 recommended)
  - Screenshot 1: HomeScreen
  - Screenshot 2: CodeBlueScreen active
  - Screenshot 3: SummaryScreen with metrics
  - Screenshot 4: License activation screen
- [ ] **Tablet screenshots**: Optional but recommended (10" tablet - 2048x1536)

### 3. App Content Declarations
In Google Play Console:
- [ ] **Target audience**: Adults (healthcare professionals)
- [ ] **Content rating**: Complete IARC questionnaire
  - Medical content: Yes
  - Graphic medical content: No (unless your app shows this)
  - User-generated content: No
- [ ] **Data safety form**:
  - Collects personal data: Yes (email)
  - Collects health data: Yes (resuscitation logs)
  - Data encrypted in transit: Yes
  - Data encrypted at rest: Yes (device storage)
  - User can request data deletion: Yes (you need to implement this)

### 4. Build Configuration

#### Update app.json for production:
```json
"android": {
  "adaptiveIcon": {
    "foregroundImage": "./assets/medresus-icon.png",
    "backgroundColor": "#0b0b0e"
  },
  "package": "in.apollosage.medresus",
  "versionCode": 1,
  "permissions": ["INTERNET", "VIBRATE"],
  "privacyPolicy": "https://YOUR_PRIVACY_POLICY_URL"
}
```

#### Build the production APK/AAB:
```bash
# Install EAS CLI if not already installed
npm install -g eas-cli

# Login to Expo account
eas login

# Configure build
eas build:configure

# Build production AAB for Google Play
eas build --platform android --profile production
```

### 5. Google Play Console Setup
- [ ] **Create account**: https://play.google.com/console ($25 one-time fee)
- [ ] **Create app** in console
- [ ] **Upload AAB** (Android App Bundle)
- [ ] **Configure signing**: Let Google manage signing keys
- [ ] **Set up internal testing** track first (recommended)
- [ ] **Add test users** (your email)
- [ ] **Test the build** before production release

### 6. Legal & Compliance
- [ ] **Terms of Service**: Create and link in About screen (already done)
- [ ] **Medical disclaimer**: Already implemented in DisclaimerScreen ✓
- [ ] **HIPAA compliance notice**: Add if targeting US healthcare
- [ ] **Data retention policy**: Document how long case data is kept
- [ ] **Export/delete user data**: Implement if required by GDPR/regional laws

### 7. Monetization Setup
- [ ] **Create in-app products** in Google Play Console:
  - `medresus_trial_30days` - Free trial
  - `medresus_department_monthly` - $49.99/month
  - `medresus_department_annual` - $499/year
  - `medresus_site_annual` - $1,999/year
  - `medresus_enterprise_annual` - Contact for pricing
- [ ] **Link products** to expo-in-app-purchases
- [ ] **Test purchase flow** in internal testing track

### 8. Pre-Launch Testing
- [ ] Run on physical Android devices (various manufacturers)
- [ ] Test all screens and navigation
- [ ] Test license activation flow
- [ ] Test trial expiration
- [ ] Test CSV export and email
- [ ] Test with different screen sizes
- [ ] Test offline functionality
- [ ] Check for crashes (use `eas build --profile preview` first)

### 9. Post-Submission
- [ ] **Internal testing**: Release to testers first
- [ ] **Closed testing**: Expand to 20-100 users
- [ ] **Open testing** (optional): Public beta
- [ ] **Production release**: Submit for review
- [ ] **Monitor crashes**: Set up crash reporting (Sentry, Firebase Crashlytics)
- [ ] **User feedback**: Respond to reviews

---

## Full Description Template (for Play Store)

```
📱 MEDRESUS - Real-Time Cardiac Arrest Documentation

MedResus is a professional resuscitation documentation app designed for healthcare teams managing cardiac arrests in hospitals and emergency settings.

✨ KEY FEATURES:

• Real-time Event Logging: CABDE framework (Circulation, Airway, Breathing, Drugs, ECG/Everything else)
• CPR Timer: 2-minute compression intervals with haptic alerts
• Team Role Management: Track compressors, airway, drugs, defib, team lead, recorder
• Quality Metrics: Automatic calculation of time to first shock, IV access, advanced airway
• Debrief Summaries: AI-generated strengths and improvement suggestions
• ROSC Documentation: Capture return of spontaneous circulation with detailed notes
• Reversible Causes Tracking: 4H & 4T checklist
• Rhythm Analysis: Document rhythms and treatment decisions
• CSV Export: Email case logs with quality metrics for audit and research
• Multi-Language Support: English, Hindi, Hinglish

🏥 IDEAL FOR:

• Emergency Departments
• ICU/Critical Care Units
• Code Blue Teams
• Resuscitation Training
• Quality Improvement Programs
• Clinical Audits

💼 SUBSCRIPTION TIERS:

• 30-Day Free Trial (full features)
• Department License: For single ED/ICU
• Site License: Hospital-wide deployment
• Enterprise: Multi-site organizations

🔒 PRIVACY & SECURITY:

• All data stored locally on your device
• No patient identifiable information required
• HIPAA-compliant architecture
• Email-based license activation
• Copyright protected © 2025 MedResus

📊 QUALITY IMPROVEMENT:

Post-resuscitation debriefs with automated quality metrics help teams:
- Reduce time to first shock
- Minimize CPR interruptions
- Improve team coordination
- Meet resuscitation guidelines

⚕️ MEDICAL DISCLAIMER:

This app is for documentation purposes only. Always follow your institution's protocols and current resuscitation guidelines (AHA/ERC). Not a substitute for clinical judgment.

📧 SUPPORT: snmandal1953@gmail.com

---

© 2025 MedResus. All rights reserved.
```

---

## Build Commands Quick Reference

```bash
# Development build (for testing)
eas build --platform android --profile development

# Preview build (for internal testing)
eas build --platform android --profile preview

# Production build (for Play Store)
eas build --platform android --profile production

# Submit to Play Store (after build completes)
eas submit --platform android
```

---

## Estimated Timeline

| Task | Time Estimate |
|------|---------------|
| Privacy policy creation | 2-4 hours |
| Store listing content | 2-3 hours |
| Screenshots/graphics | 3-5 hours |
| Build configuration | 1-2 hours |
| First build & test | 2-4 hours |
| Google Play Console setup | 2-3 hours |
| Internal testing cycle | 1-2 weeks |
| Review & approval | 1-5 days |
| **Total** | **2-4 weeks** |

---

## Next Immediate Steps

1. **Create privacy policy** (host on GitHub Pages or your website)
2. **Take screenshots** of your app on Android device/emulator
3. **Create feature graphic** (1024x500) - can use Canva or Figma
4. **Run first production build**: `eas build --platform android --profile production`
5. **Create Google Play Developer account** ($25 one-time)
6. **Start filling Play Console** while build is compiling

---

## Helpful Resources

- [Google Play Console](https://play.google.com/console)
- [Expo EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Android Launch Checklist](https://developer.android.com/distribute/best-practices/launch/launch-checklist)
- [Privacy Policy Generator](https://www.privacypolicygenerator.info/)
- [Play Store Asset Studio](https://romannurik.github.io/AndroidAssetStudio/)

---

**Ready to start? Begin with creating your privacy policy - it's required before submission.**
