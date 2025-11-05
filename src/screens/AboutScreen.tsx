import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getSubscriptionStatus, getRemainingTrialDays, getContactSalesUrl } from '../services/subscription';

export default function AboutScreen({ navigation }: any) {
  const version = '1.0.0';
  const buildDate = '2025-11-05';
  const [subscriptionStatus, setSubscriptionStatus] = React.useState<any>(null);

  React.useEffect(() => {
    (async () => {
      const status = await getSubscriptionStatus();
      setSubscriptionStatus(status);
    })();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="medical-bag" size={48} color="#ef4444" />
        <Text style={styles.appName}>MedResus</Text>
        <Text style={styles.tagline}>Real-time resuscitation documentation</Text>
        <Text style={styles.version}>Version {version} ({buildDate})</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Copyright & License</Text>
        <Text style={styles.bodyText}>
          © 2025 MedResus. All rights reserved.
        </Text>
        <Text style={styles.bodyText}>
          This application and all associated documentation, designs, workflows, algorithms, and quality metrics are proprietary and confidential.
        </Text>
        <Text style={styles.bodyText}>
          Unauthorized copying, distribution, reverse engineering, or commercial use is strictly prohibited.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Terms of Use</Text>
        <Text style={styles.bodyText}>
          MedResus is intended for internal hospital use for training, audit, and quality improvement purposes only.
        </Text>
        <Text style={styles.bodyText}>
          This app does not replace clinical documentation, clinical judgment, or official hospital records. Users are responsible for verifying all entries against patient charts.
        </Text>
        <Text style={styles.bodyText}>
          By using this application, you agree to these terms and acknowledge that the developers accept no liability for medical errors or misuse.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy & Data</Text>
        <Text style={styles.bodyText}>
          All data is stored locally on your device. No patient identifiable information is transmitted to external servers unless you choose to export and email reports.
        </Text>
        <Text style={styles.bodyText}>
          Users are responsible for compliance with local data protection regulations (HIPAA, GDPR, DPDP Act, etc.).
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact & Support</Text>
        <TouchableOpacity 
          onPress={() => Linking.openURL('mailto:snmandal1953@gmail.com?subject=MedResus%20Support')}
          style={styles.linkRow}
        >
          <MaterialCommunityIcons name="email" size={20} color="#0ea5e9" />
          <Text style={styles.linkText}>snmandal1953@gmail.com</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>License Status</Text>
        <View style={styles.licenseBox}>
          <Text style={styles.licenseLabel}>Current Plan:</Text>
          <Text style={styles.licenseValue}>
            {subscriptionStatus?.tier === 'trial' ? 'Trial' : 
             subscriptionStatus?.tier === 'department' ? 'Department License' :
             subscriptionStatus?.tier === 'site' ? 'Site License' :
             subscriptionStatus?.tier === 'enterprise' ? 'Enterprise License' : 'Unknown'}
          </Text>
          {subscriptionStatus?.tier === 'trial' && subscriptionStatus?.active && (
            <Text style={styles.licenseNote}>
              {getRemainingTrialDays(subscriptionStatus)} days remaining in trial
            </Text>
          )}
          {!subscriptionStatus?.active && (
            <Text style={[styles.licenseNote, { color: '#ef4444' }]}>
              Trial expired. Contact us for licensing.
            </Text>
          )}
          <TouchableOpacity 
            style={styles.upgradeButton}
            onPress={() => {
              Alert.alert(
                'Enterprise Licensing',
                'For department, site, or enterprise licenses, please contact our sales team.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Contact Sales', onPress: () => Linking.openURL(getContactSalesUrl()) }
                ]
              );
            }}
          >
            <Text style={styles.upgradeButtonText}>Contact Sales</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Built with care for healthcare teams worldwide.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
    marginTop: 12,
  },
  tagline: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  version: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  linkText: {
    fontSize: 14,
    color: '#0ea5e9',
    marginLeft: 8,
    fontWeight: '600',
  },
  licenseBox: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  licenseLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  licenseValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  licenseNote: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  },
  upgradeButton: {
    backgroundColor: '#0ea5e9',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  footer: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
});
