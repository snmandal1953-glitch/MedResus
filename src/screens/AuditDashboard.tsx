import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function AuditDashboard() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Audit Dashboard</Text>
      <Text style={styles.line}>Archive cases from Summary, then export monthly CSVs here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#0b0b0e", padding: 16 },
  title: { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 12 },
  line: { color: "#e5e7eb", fontSize: 12 },
});
