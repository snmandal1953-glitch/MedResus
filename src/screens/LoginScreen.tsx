import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, Button, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { storage } from '../services/storage';

export default function LoginScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [hospital, setHospital] = useState('');
  const [unit, setUnit] = useState(''); // ED / ICU / Ward etc.

  React.useEffect(() => {
    (async () => {
      const profile = await storage.get<{ name?: string; email?: string; hospital?: string }>('userProfile');
      if (profile) {
        setName(profile.name ?? '');
        setEmail(profile.email ?? '');
        setHospital(profile.hospital ?? '');
      }
    })();
  }, []);

  const emailValid = useMemo(() => {
    // simple validation
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
  }, [email]);

  const canProceed = name.trim().length >= 2 && emailValid && hospital.trim().length >= 2 && unit.trim().length >= 2;

  const onSave = async () => {
    await storage.set('userProfile', { name: name.trim(), email: email.trim(), hospital: hospital.trim() });
    // session location is asked each login; store for this session
    await storage.set('sessionLocation', { hospital: hospital.trim(), unit: unit.trim(), savedAt: Date.now() });
    navigation.replace('Disclaimer'); // next step after login
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.container}
    >
      <View style={{ width: '100%' }}>
        <Text style={styles.title}>Staff Login</Text>
        <Text style={styles.subtitle}>Enter your details to proceed</Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g., Dr Sumit Kumar Mandal"
          style={styles.input}
          autoCapitalize="words"
        />

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

        <Text style={styles.label}>Email ID</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="e.g., name@apollosage.com"
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        {!emailValid && email.length > 0 ? (
          <Text style={styles.error}>Please enter a valid email address.</Text>
        ) : null}

        <View style={{ marginTop: 16 }}>
          <Button title="Continue" onPress={onSave} disabled={!canProceed} />
        </View>

        <Text style={styles.note}>
          Your name and email are stored on this device to identify entries for audit & training purposes.
        </Text>

        <Text style={styles.copyright}>© 2025 MedResus. All rights reserved.</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 18, marginTop: 4 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 10 },
  input: {
    borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, marginTop: 6
  },
  error: { color: '#b91c1c', marginTop: 6 },
  note: { fontSize: 12, color: '#6b7280', marginTop: 12, textAlign: 'center' },
  copyright: { fontSize: 11, color: '#9ca3af', marginTop: 16, textAlign: 'center' },
});
