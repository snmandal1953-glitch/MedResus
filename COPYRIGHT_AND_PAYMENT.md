# MedResus - Copyright & Payment Setup

## Copyright Notices ✅ DONE

Copyright notices have been added to:
- **HomeScreen**: Footer with "© 2025 MedResus. All rights reserved." + link to About
- **LoginScreen**: Bottom copyright notice
- **AboutScreen**: Full legal page with Terms, Privacy, License status
- **CSV Exports**: Header comment with copyright and generation timestamp
- **Debrief Text Exports**: Header with copyright and generation timestamp

## Payment Infrastructure 🚀 READY

### Current Status
- **Trial Mode**: Automatic 30-day trial on first launch
- **Subscription Service**: `/src/services/subscription.ts` with tier management
- **License Display**: About screen shows trial status and days remaining
- **Contact Sales**: Button to reach out for department/site/enterprise licenses

### Subscription Tiers

| Tier | Features | Target Price |
|------|----------|--------------|
| Trial | 30 days, all features, no multi-user | Free |
| Department | Unlimited cases, exports, quality metrics, multi-user | $3k-$10k/year |
| Site | All department features + multiple units | $10k-$30k/year |
| Enterprise | Custom integrations, dedicated support | Custom pricing |

### Next Steps for Payment Integration

#### Option 1: RevenueCat (Recommended - Easiest)
```bash
npm install react-native-purchases
npx pod-install  # iOS only
```

**Setup:**
1. Create account at https://www.revenuecat.com/
2. Configure products in App Store Connect / Google Play Console
3. Add product IDs to RevenueCat dashboard
4. Update `subscription.ts`:

```typescript
import Purchases from 'react-native-purchases';

// In app initialization
await Purchases.configure({ apiKey: 'YOUR_API_KEY' });

// In initiatePurchase()
const offerings = await Purchases.getOfferings();
const purchase = await Purchases.purchasePackage(offerings.current.monthly);
```

**Product IDs to create:**
- `medresus_department_monthly`
- `medresus_department_annual`
- `medresus_site_annual`
- `medresus_enterprise_annual`

#### Option 2: Expo In-App Purchases
```bash
npx expo install expo-in-app-purchases
```

**Setup:**
1. Configure products in stores
2. Update `subscription.ts`:

```typescript
import * as InAppPurchases from 'expo-in-app-purchases';

await InAppPurchases.connectAsync();
const { results } = await InAppPurchases.getProductsAsync(['medresus_department_monthly']);
await InAppPurchases.purchaseItemAsync('medresus_department_monthly');
```

#### Option 3: Enterprise Sales Only (No In-App Payments)
- Keep current "Contact Sales" flow
- Manual license key activation
- Server-side validation (optional)

### Testing the Trial System

```typescript
// Check subscription status
import { getSubscriptionStatus, getRemainingTrialDays } from './src/services/subscription';

const status = await getSubscriptionStatus();
console.log('Trial days remaining:', getRemainingTrialDays(status));

// Manually update subscription (for testing)
import { updateSubscription } from './src/services/subscription';
const oneYear = Date.now() + 365 * 24 * 60 * 60 * 1000;
await updateSubscription('department', oneYear);
```

## Legal Protection Checklist

- [x] Copyright notices in app
- [x] Copyright in exports
- [x] Terms of Use in About screen
- [x] Privacy statement
- [x] License status display
- [ ] Trademark registration for "MedResus" (optional - $300-500 USD)
- [ ] Document your unique algorithms (for trade secret protection)
- [ ] Use NDAs when demoing to hospitals
- [ ] Add End User License Agreement (EULA) if distributing widely

## Distribution Options

### For Pilots/Early Customers
- **TestFlight (iOS)**: Up to 10,000 testers, 90-day builds
- **Google Play Internal Testing**: Unlimited testers

### For Enterprise Customers
- **Apple Business Manager**: Private distribution
- **Managed Google Play**: Enterprise distribution
- **MDM Integration**: Intune, Meraki, AirWatch support

### For Public Launch
- **App Store**: Full review process, 30% cut on subscriptions (15% after year 1)
- **Google Play**: Review process, 30% cut (15% after year 1)

## Revenue Strategy

### Phase 1: Direct Sales (Now)
- Contact hospitals directly
- Run 8-12 week pilots
- Manual invoicing + license keys
- Simple contracts

### Phase 2: In-App Purchases (3-6 months)
- Implement RevenueCat or Expo IAP
- Department/Site tiers available in-app
- Enterprise still via sales team

### Phase 3: Scale (6-12 months)
- Self-service signup for department licenses
- Volume discounts for multi-site
- Partner with medical device companies
- Integration marketplace

## Protecting Your IP

**What you own automatically:**
- Source code (copyright)
- UI design (copyright)
- Documentation (copyright)
- Quality metric algorithms (trade secret)
- Workflow designs (trade secret)

**What to do:**
1. Keep source code private
2. Use obfuscation in production builds
3. Include confidentiality clauses in contracts
4. Document innovations with dated records
5. Consider provisional patent if you develop breakthrough tech

## Contact for Licensing

**Email**: snmandal1953@gmail.com
**Subject**: MedResus Enterprise Licensing
**Response Time**: 24-48 hours

---

Built with ❤️ for healthcare teams worldwide.
© 2025 MedResus. All rights reserved.
