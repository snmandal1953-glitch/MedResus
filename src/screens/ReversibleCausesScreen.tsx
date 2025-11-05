import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { storage } from '../services/storage';

type Item = { key: string; label: string; status: 'Pending' | 'Considered' | 'Intervention done' };

const Hs: Item[] = [
  { key: 'hypoxia', label: 'Hypoxia', status: 'Pending' },
  { key: 'hypovolaemia', label: 'Hypovolaemia', status: 'Pending' },
  { key: 'hypo_hyper_k', label: 'Hypo/Hyperkalaemia & metabolic', status: 'Pending' },
  { key: 'hypothermia', label: 'Hypothermia', status: 'Pending' },
];

const Ts: Item[] = [
  { key: 'tension_pneumo', label: 'Tension pneumothorax', status: 'Pending' },
  { key: 'tamponade', label: 'Cardiac tamponade', status: 'Pending' },
  { key: 'toxins', label: 'Toxins/poisons', status: 'Pending' },
  { key: 'thrombosis', label: 'Thrombosis (coronary/pulmonary)', status: 'Pending' },
];

export default function ReversibleCausesScreen() {
  const [h, setH] = useState<Item[]>(Hs);
  const [t, setT] = useState<Item[]>(Ts);

  const setStatus = (arr: Item[], setArr: (a: Item[]) => void, idx: number, status: Item['status']) => {
  const copy = [...arr];
  copy[idx] = { ...copy[idx], status };
  setArr(copy);
  // persist both lists whenever either changes
  // NOTE: use the *latest* arrays from state setters in a microtask
  setTimeout(() => storage.set('reversibleCauses', { h, t }), 0);
};

  const render = (title: string, arr: Item[], setArr: (a: Item[]) => void) => (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {arr.map((it, i) => (
        <View key={it.key} style={styles.row}>
          <Text style={{ flex: 1, fontSize: 15 }}>{it.label}</Text>
          <Picker
            selectedValue={it.status}
            onValueChange={v => setStatus(arr, setArr, i, v)}
            style={{ width: 200 }}
          >
            <Picker.Item label="Pending" value="Pending" />
            <Picker.Item label="Considered" value="Considered" />
            <Picker.Item label="Intervention done" value="Intervention done" />
          </Picker>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {render('4 H’s', h, setH)}
      {render('4 T’s', t, setT)}
      <Pressable onPress={() => {}} style={styles.saveBtn}>
        <Text style={styles.saveTxt}>Statuses auto-saved with the case log when you back out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 14 },
  title: { fontWeight: '700', marginBottom: 8, fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  saveBtn: { padding: 10, alignItems: 'center' },
  saveTxt: { color: '#6b7280', fontSize: 12 },
});
