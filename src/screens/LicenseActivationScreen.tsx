import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { activateLicense, getSubscriptionStatus, getRemainingTrialDays } from '../services/subscription';
import { storage } from '../services/storage';

export default function LicenseActivationScreen({ navigation }: any) {
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [trialInfo, setTrialInfo] = useState<{ active: boolean; daysLeft: number } | null>(null);

  React.useEffect(() => {
    (async () => {
      const profile = await storage.get<{ email?: string }>('userProfile');
      setUserEmail(profile?.email ?? '');
      
      const status = await getSubscriptionStatus();
      if (status.tier === 'trial') {
        setTrialInfo({
          active: status.active,
          daysLeft: getRemainingTrialDays(status),
        });
      }
    })();
  }, []);

  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      Alert.alert('Error', 'Please enter a license key');
      return;
    }

    if (!userEmail.trim()) {
      Alert.alert('Error', 'Email not found. Please log in again.');
      return;
    }

    setLoading(true);
    const result = await activateLicense(licenseKey, userEmail);
    setLoading(false);

    if (result.success) {
      Alert.alert(
        'License Activated!',
        'Your license has been successfully activated. You now have full access to all features.',
        [{ text: 'Continue', onPress: () => navigation.replace('Home') }]
      );
    } else {
      Alert.alert('Activation Failed', result.error || 'Invalid license key');
    }
  };

  const handleContinueWithTrial = () => {
    if (trialInfo?.active) {
      navigation.replace('Home');
    } else {
      Alert.alert(
        'Trial Expired',
        'Your trial period has ended. Please enter a license key to continue using MedResus.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="key-variant" size={64} color="#0ea5e9" />
          <Text style={styles.title}>Activate License</Text>
          <Text style={styles.subtitle}>Enter your license key to unlock full access</Text>
        </View>

        {trialInfo && (
          <View style={trialInfo.active ? styles.trialBoxActive : styles.trialBoxExpired}>
            <MaterialCommunityIcons 
              name={trialInfo.active ? "clock-check-outline" : "clock-alert-outline"} 
              size={24} 
              color={trialInfo.active ? "#10b981" : "#ef4444"} 
            />
            <View style={styles.trialText}>
              <Text style={styles.trialLabel}>Trial Status</Text>
              <Text style={trialInfo.active ? styles.trialActive : styles.trialExpired}>
                {trialInfo.active 
                  ? `${trialInfo.daysLeft} days remaining` 
                  : 'Trial expired'}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.form}>
          <Text style={styles.label}>Licensed Email</Text>
          <View style={styles.emailBox}>
            <MaterialCommunityIcons name="email" size={20} color="#6b7280" />
            <Text style={styles.emailText}>{userEmail || 'Not set'}</Text>
          </View>

          <Text style={styles.label}>License Key</Text>
          <TextInput
            value={licenseKey}
            onChangeText={setLicenseKey}
            placeholder="MEDRESUS-XXXX-XXXXXXXX-XXXX"
            style={styles.input}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.activateButton, loading && styles.buttonDisabled]}
            onPress={handleActivate}
            disabled={loading}
          >
            <Text style={styles.activateButtonText}>
              {loading ? 'Activating...' : 'Activate License'}
            </Text>
          </TouchableOpacity>

          {trialInfo?.active && (
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinueWithTrial}
            >
              <Text style={styles.continueButtonText}>Continue with Trial</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.help}>
          <Text style={styles.helpText}>
            Don't have a license key?
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('About')}>
            <Text style={styles.helpLink}>Contact Sales</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.format}>
          <Text style={styles.formatTitle}>License Key Format:</Text>
          <Text style={styles.formatText}>MEDRESUS-TIER-HASH-CHECKSUM</Text>
          <Text style={styles.formatExample}>Example: MEDRESUS-DEPT-A1B2C3D4-X9Y8</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  trialBoxActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#86efac',
    marginBottom: 20,
  },
  trialBoxExpired: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fca5a5',
    marginBottom: 20,
  },
  trialText: {
    marginLeft: 12,
    flex: 1,
  },
  trialLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  trialActive: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
    marginTop: 2,
  },
  trialExpired: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
    marginTop: 2,
  },
  form: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  emailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#111827',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  activateButton: {
    backgroundColor: '#0ea5e9',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  activateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  continueButton: {
    backgroundColor: '#f3f4f6',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  continueButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  help: {
    alignItems: 'center',
    marginBottom: 20,
  },
  helpText: {
    fontSize: 14,
    color: '#6b7280',
  },
  helpLink: {
    fontSize: 14,
    color: '#0ea5e9',
    fontWeight: '600',
    marginTop: 4,
  },
  format: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  formatTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  formatText: {
    fontSize: 11,
    color: '#374151',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  formatExample: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
});
