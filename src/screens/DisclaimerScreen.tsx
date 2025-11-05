import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, StyleSheet, Switch } from 'react-native';
import { storage } from '../services/storage';

export default function DisclaimerScreen({ navigation }: any) {
  const [accepted, setAccepted] = useState(false);
  const [hospital, setHospital] = useState<string | null>(null);
  const [unit, setUnit] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const session = await storage.get<{ hospital?: string; unit?: string }>('sessionLocation');
      const profile = await storage.get<{ hospital?: string }>('userProfile');
      setHospital(session?.hospital ?? profile?.hospital ?? null);
      setUnit(session?.unit ?? null);
    })();
  }, []);

  const onProceed = async () => {
    await storage.set('disclaimerAccepted', true);
    navigation.replace('Home');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll}>
        <Text style={styles.title}>MEDRESUS Disclaimer</Text>
        <Text style={styles.text}>
          This application is intended strictly for INTERNAL use
          {hospital || unit ? ' within ' : ' within '}
          {unit ? `${unit} of ` : ''}
          {hospital ? `${hospital}` : 'Apollo Sage Hospital'}
          {' for training, audit, and quality improvement purposes only.'}
        </Text>
        <Text style={styles.text}>
          It does not replace clinical documentation, clinical judgement, or official hospital records.
          Entries should be made in good faith and verified against the patient’s medical chart.
        </Text>
        <Text style={styles.text}>
          The hospital and developers accept no liability for misuse or medical errors arising from
          reliance on this application. By proceeding, you acknowledge and accept these conditions.
        </Text>

        <View style={styles.switchRow}>
          <Switch value={accepted} onValueChange={setAccepted} />
          <Text style={styles.switchLabel}>I have read and agree to the disclaimer.</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Proceed" onPress={onProceed} disabled={!accepted} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  scroll: { flex: 1 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 10, textAlign: 'center' },
  text: { fontSize: 16, marginVertical: 8, textAlign: 'justify', color: '#374151' },
  switchRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, gap: 10 },
  switchLabel: { fontSize: 15, flexShrink: 1 },
  footer: { marginVertical: 20 },
});
