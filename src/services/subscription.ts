/**
 * Payment & Subscription Service
 * 
 * This module handles in-app purchases and subscription validation.
 * For production, integrate with:
 * - expo-in-app-purchases (https://docs.expo.dev/versions/latest/sdk/in-app-purchases/)
 * - RevenueCat (https://www.revenuecat.com/) for cross-platform subscription management
 * 
 * Current implementation: stub for trial/development mode
 */

import { storage } from './storage';

export type SubscriptionTier = 'trial' | 'department' | 'site' | 'enterprise';

export type SubscriptionStatus = {
  tier: SubscriptionTier;
  active: boolean;
  expiresAt: number | null; // epoch ms
  trialEndsAt: number | null;
  licenseKey: string | null;
  licensedEmail: string | null;
  activatedAt: number | null;
  features: {
    maxCasesPerMonth: number | null;
    exportEnabled: boolean;
    qualityMetrics: boolean;
    multiUser: boolean;
  };
};

const TRIAL_DURATION_DAYS = 30;

export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  const stored = await storage.get<SubscriptionStatus>('subscriptionStatus');
  
  if (stored) {
    // Check if trial has expired
    if (stored.tier === 'trial' && stored.trialEndsAt && Date.now() > stored.trialEndsAt) {
      return {
        tier: 'trial',
        active: false,
        expiresAt: null,
        trialEndsAt: stored.trialEndsAt,
        licenseKey: null,
        licensedEmail: null,
        activatedAt: null,
        features: {
          maxCasesPerMonth: 5,
          exportEnabled: false,
          qualityMetrics: false,
          multiUser: false,
        },
      };
    }
    return stored;
  }

  // First time: initialize trial
  const trialEndsAt = Date.now() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000;
  const newStatus: SubscriptionStatus = {
    tier: 'trial',
    active: true,
    expiresAt: null,
    trialEndsAt,
    licenseKey: null,
    licensedEmail: null,
    activatedAt: null,
    features: {
      maxCasesPerMonth: null, // unlimited during trial
      exportEnabled: true,
      qualityMetrics: true,
      multiUser: false,
    },
  };
  
  await storage.set('subscriptionStatus', newStatus);
  return newStatus;
}

export async function updateSubscription(tier: SubscriptionTier, expiresAt: number): Promise<void> {
  const features = getFeaturesByTier(tier);
  const status: SubscriptionStatus = {
    tier,
    active: true,
    expiresAt,
    trialEndsAt: null,
    licenseKey: null,
    licensedEmail: null,
    activatedAt: null,
    features,
  };
  await storage.set('subscriptionStatus', status);
}

function getFeaturesByTier(tier: SubscriptionTier) {
  switch (tier) {
    case 'trial':
      return {
        maxCasesPerMonth: null,
        exportEnabled: true,
        qualityMetrics: true,
        multiUser: false,
      };
    case 'department':
      return {
        maxCasesPerMonth: null,
        exportEnabled: true,
        qualityMetrics: true,
        multiUser: true,
      };
    case 'site':
      return {
        maxCasesPerMonth: null,
        exportEnabled: true,
        qualityMetrics: true,
        multiUser: true,
      };
    case 'enterprise':
      return {
        maxCasesPerMonth: null,
        exportEnabled: true,
        qualityMetrics: true,
        multiUser: true,
      };
  }
}

export function getRemainingTrialDays(status: SubscriptionStatus): number {
  if (!status.trialEndsAt) return 0;
  const ms = status.trialEndsAt - Date.now();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

/**
 * Placeholder for actual in-app purchase flow
 * 
 * To implement:
 * 1. Install expo-in-app-purchases or RevenueCat SDK
 * 2. Configure products in App Store Connect / Google Play Console
 * 3. Handle purchase flow, validate receipts
 * 4. Update subscription status on success
 * 
 * Example product IDs:
 * - medresus_department_monthly
 * - medresus_department_annual
 * - medresus_site_annual
 * - medresus_enterprise_annual
 */
export async function initiatePurchase(productId: string): Promise<boolean> {
  // TODO: Implement actual purchase flow
  console.log('Purchase initiated for product:', productId);
  
  // For now, just show a message
  return false;
}

/**
 * Contact sales for enterprise licensing
 */
export function getContactSalesUrl(): string {
  return 'mailto:snmandal1953@gmail.com?subject=MedResus%20Enterprise%20Licensing&body=I%20am%20interested%20in%20enterprise%20licensing%20for%20MedResus.';
}

/**
 * License key validation
 * Format: MEDRESUS-{TIER}-{HASH}-{CHECKSUM}
 * Example: MEDRESUS-DEPT-A1B2C3D4-X9Y8
 */
export async function activateLicense(licenseKey: string, userEmail: string): Promise<{ success: boolean; error?: string }> {
  const key = licenseKey.trim().toUpperCase();
  
  // Basic format validation
  if (!key.startsWith('MEDRESUS-')) {
    return { success: false, error: 'Invalid license key format' };
  }
  
  const parts = key.split('-');
  if (parts.length !== 4) {
    return { success: false, error: 'Invalid license key format' };
  }
  
  const [prefix, tierCode, hash, checksum] = parts;
  
  // Validate tier code
  const tierMap: Record<string, SubscriptionTier> = {
    'TRIAL': 'trial',
    'DEPT': 'department',
    'SITE': 'site',
    'ENT': 'enterprise',
  };
  
  const tier = tierMap[tierCode];
  if (!tier) {
    return { success: false, error: 'Invalid license tier' };
  }
  
  // Simple checksum validation (in production, verify against server)
  const expectedChecksum = simpleChecksum(prefix + tierCode + hash);
  if (checksum !== expectedChecksum) {
    return { success: false, error: 'Invalid license key checksum' };
  }
  
  // In production: verify with server that this key is valid and not already used
  // For now: accept any properly formatted key
  
  // Set 1 year expiration for paid licenses
  const expiresAt = Date.now() + 365 * 24 * 60 * 60 * 1000;
  const features = getFeaturesByTier(tier);
  
  const status: SubscriptionStatus = {
    tier,
    active: true,
    expiresAt,
    trialEndsAt: null,
    licenseKey: key,
    licensedEmail: userEmail.toLowerCase().trim(),
    activatedAt: Date.now(),
    features,
  };
  
  await storage.set('subscriptionStatus', status);
  return { success: true };
}

/**
 * Check if current user email matches the licensed email
 */
export async function isLicenseValidForUser(userEmail: string): Promise<boolean> {
  const email = userEmail.toLowerCase().trim();
  
  // Developer bypass: allow your email unlimited access
  const DEVELOPER_EMAIL = 'snmandal1953@gmail.com';
  if (email === DEVELOPER_EMAIL) {
    return true;
  }
  
  const status = await getSubscriptionStatus();
  
  // Trial is always valid
  if (status.tier === 'trial' && status.active) {
    return true;
  }
  
  // Paid license must match email
  if (status.licenseKey && status.licensedEmail) {
    return status.licensedEmail === email && status.active;
  }
  
  return false;
}

/**
 * Simple checksum for license key validation
 * In production, use a proper server-side validation system
 */
function simpleChecksum(str: string): string {
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    sum += str.charCodeAt(i) * (i + 1);
  }
  const hex = (sum % 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  return hex.slice(0, 4);
}

/**
 * Generate a license key (for admin use / testing)
 * In production, this should be done server-side
 */
export function generateLicenseKey(tier: SubscriptionTier): string {
  const tierCodes: Record<SubscriptionTier, string> = {
    'trial': 'TRIAL',
    'department': 'DEPT',
    'site': 'SITE',
    'enterprise': 'ENT',
  };
  
  const tierCode = tierCodes[tier];
  const hash = Math.random().toString(36).substring(2, 10).toUpperCase();
  const checksum = simpleChecksum('MEDRESUS' + tierCode + hash);
  
  return `MEDRESUS-${tierCode}-${hash}-${checksum}`;
}
