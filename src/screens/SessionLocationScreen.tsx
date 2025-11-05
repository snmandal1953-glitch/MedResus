import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button } from 'react-native';
import { storage } from '../services/storage';
import { isLicenseValidForUser } from '../services/subscription';

export default function SessionLocationScreen({ navigation }: any) {
  const [hospital, setHospital] = useState('');
  const [unit, setUnit] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const profile = await storage.get<{ hospital?: string }>('userProfile');
      const session = await storage.get<{ hospital?: string; unit?: string }>('sessionLocation');
      setHospital(session?.hospital ?? profile?.hospital ?? '');
      setUnit(session?.unit ?? '');
      setLoading(false);
    })();
  }, []);

  const onConfirm = async () => {
    await storage.set('sessionLocation', { hospital: hospital.trim(), unit: unit.trim(), savedAt: Date.now() });
    
    // Check if user has valid license
    const profile = await storage.get<{ email?: string }>('userProfile');
    const hasValidLicense = await isLicenseValidForUser(profile?.email ?? '');
    
    if (!hasValidLicense) {
      navigation.replace('LicenseActivation');
      return;
    }
    
    const disclaimer = await storage.get('disclaimerAccepted');
    if (!disclaimer) navigation.replace('Disclaimer');
    else navigation.replace('Home');
  };

  if (loading) return null;

  const canProceed = hospital.trim().length >= 2 && unit.trim().length >= 2;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Where are you using the app?</Text>
      <Text style={styles.subtitle}>This helps customize the disclaimer and audit trail for your session.</Text>

      <Text style={styles.label}>Hospital / Facility</Text>
      <TextInput
        value={hospital}
        onChangeText={setHospital}
        placeholder="e.g., Apollo Sage Hospital"
        style={styles.input}
        autoCapitalize="words"
      />

      <Text style={styles.label}>Unit / Location (ED / ICU / Ward)</Text>
      <TextInput
        value={unit}
        onChangeText={setUnit}
        placeholder="e.g., ED, ICU, Ward 3"
        style={styles.input}
        autoCapitalize="characters"
      />

      <View style={{ marginTop: 16 }}>
        <Button title="Confirm" onPress={onConfirm} disabled={!canProceed} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 18, marginTop: 4 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 10 },
  input: {
    borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, marginTop: 6
  },
});
