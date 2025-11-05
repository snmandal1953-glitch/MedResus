import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Alert } from "react-native";
import { loadCases, storage } from "../services/storage";
import { saveCsv, saveText } from "../services/exportCSV";
import { computeQualityMetrics, buildDebrief, metricsToRows, QualityMetrics, DebriefSummary } from "../services/quality";
import { isLicenseValidForUser } from "../services/subscription";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as MailComposer from "expo-mail-composer";

export default function SummaryScreen() {
  const [log, setLog] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null);
  const [debrief, setDebrief] = useState<DebriefSummary | null>(null);
  const [licenseValid, setLicenseValid] = useState<boolean>(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    (async () => {
      const profile = await storage.get<{ email?: string }>('userProfile');
      const hasValidLicense = await isLicenseValidForUser(profile?.email ?? '');
      setLicenseValid(hasValidLicense);
      
      if (!hasValidLicense) {
        Alert.alert('License Required', 'You need an active license to view case summaries.');
        return;
      }
      
      const cases = await loadCases();
      // Assuming you want the latest case; adjust as needed
      const latest = cases.length > 0 ? cases[0] : null;
      const events = (latest?.events ?? []) as any[];
      setLog(events);
      if (events.length) {
        const qm = computeQualityMetrics(events as any);
        setMetrics(qm);
        setDebrief(buildDebrief(qm));
      } else {
        setMetrics(null);
        setDebrief(null);
      }
    })();
  }, []);

  const handleExportLatest = async () => {
    if (!licenseValid) {
      Alert.alert('License Required', 'You need an active license to export case data.');
      return;
    }
    
    try {
      const cases = await loadCases();
      const latest = cases.length > 0 ? cases[0] : null;
      if (!latest) {
        Alert.alert('No cases', 'No saved cases to export.');
        return;
      }

      const eventRows = (latest.events ?? []).slice().reverse().map((e: any, i: number) => ({
        time_absolute: new Date(e.ts).toISOString(),
        time_since_start: e.tRelMs ?? e.tSec ?? '',
        section: e.section ?? '',
        action: e.action ?? e.label ?? '',
        details: e.details ?? '',
        user: e.who ?? '',
        case_id: latest.caseId ?? ''
      }));
      const qualityRows = metrics ? metricsToRows(metrics).map(r => ({ metric: r.key, value: r.value })) : [];
      const rows = qualityRows.length ? [...qualityRows as any[], { metric: '---', value: '---' } as any, ...eventRows] : eventRows;

      const uri = await saveCsv(`case_${latest.caseId ?? 'export'}.csv`, rows);

      // Optional: save debrief text as a separate attachment
      let attachments = [uri];
      if (debrief) {
        const text = renderDebriefText(latest.caseId ?? '', metrics!, debrief);
        const debUri = await saveText(`case_${latest.caseId ?? 'export'}_debrief.txt`, text);
        attachments = [uri, debUri];
      }

      const available = await MailComposer.isAvailableAsync();
      if (available) {
        await MailComposer.composeAsync({
          subject: `Case export – ${latest.caseId ?? ''}`,
          body: `CSV export for case ${latest.caseId ?? ''}${debrief ? '\n\nIncludes debrief summary attachment.' : ''}`,
          attachments,
        });
      } else {
        Alert.alert('CSV saved', 'CSV saved locally. No mail client configured to send it.');
      }
    } catch (err) {
      console.warn('Export failed', err);
      Alert.alert('Error', 'Unable to export CSV');
    }
  };

  const handleSendFeedback = async () => {
    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      const recipients = ["snmandal1953@gmail.com"];
      const subject = "Feedback: MedResus App";
      const body = `Hi,

I would like to share some feedback about the MedResus app:\n\n- What I like:\n- What could be improved:\n- Device / platform: macOS / Expo (add details)\n\nThanks!`;

      if (!isAvailable) {
        Alert.alert("Mail not available", "No mail client is configured on this device.");
        return;
      }

      await MailComposer.composeAsync({ recipients, subject, body });
    } catch (err) {
      console.warn("Failed to open mail composer", err);
      Alert.alert("Error", "Unable to open mail composer. You can email snmandal1953@gmail.com directly.");
    }
  };

  return (
    <View style={styles.wrap}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Case Summary</Text>

        {metrics && debrief && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Debrief Summary</Text>
            <Text style={styles.headline}>{debrief.headline}</Text>
            <Text style={styles.subheading}>Strengths</Text>
            {debrief.strengths.map((s, i) => (
              <Text key={`s-${i}`} style={styles.line}>• {s}</Text>
            ))}
            <Text style={[styles.subheading, { marginTop: 10 }]}>Suggestions</Text>
            {debrief.suggestions.map((s, i) => (
              <Text key={`sg-${i}`} style={styles.line}>• {s}</Text>
            ))}
          </View>
        )}

        {metrics && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Quality Metrics</Text>
            {metricsToRows(metrics).map((r, i) => (
              <Text key={`m-${i}`} style={styles.line}>{r.key}: {r.value}</Text>
            ))}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          {(log ?? []).map((e: any, i: number) => (
            <Text key={i} style={styles.line}>{new Date(e.ts).toLocaleTimeString()} — {e.section ?? ''} {e.action ?? e.label ?? ''} {e.details ? '— ' + e.details : ''}</Text>
          ))}
        </View>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0]
        })}] }}>
          <TouchableOpacity style={styles.btn} onPress={handleExportLatest}>
            <Text style={styles.btnText}>Export CSV</Text>
            <MaterialCommunityIcons name="export" size={20} color="#fff" style={styles.btnIcon} />
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [28, 0] }) }], marginTop: 10 }}>
          <TouchableOpacity style={styles.feedbackBtn} onPress={handleSendFeedback}>
            <MaterialCommunityIcons name="email-outline" size={18} color="#0b0b0e" style={{ marginRight: 8 }} />
            <Text style={styles.feedbackText}>Send feedback</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function renderDebriefText(caseId: string, m: QualityMetrics, d: DebriefSummary): string {
  const lines: string[] = [];
  lines.push(`Case ${caseId} — Debrief Summary`);
  lines.push('');
  lines.push('Quality Metrics:');
  for (const r of metricsToRows(m)) lines.push(`- ${r.key}: ${r.value}`);
  lines.push('');
  lines.push('Strengths:');
  for (const s of d.strengths) lines.push(`- ${s}`);
  lines.push('');
  lines.push('Suggestions:');
  for (const s of d.suggestions) lines.push(`- ${s}`);
  lines.push('');
  lines.push(d.headline);
  return lines.join('\n');
}

const styles = StyleSheet.create({
  wrap: { 
    flex: 1, 
    backgroundColor: "#0b0b0e" 
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32
  },
  title: { 
    color: "#fff", 
    fontSize: 20, 
    fontWeight: "800", 
    marginBottom: 16 
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8
  },
  subheading: {
    color: '#d1d5db',
    fontWeight: '700',
    marginTop: 6
  },
  headline: {
    color: '#e5e7eb',
    marginBottom: 8
  },
  line: { 
    color: "#e5e7eb", 
    fontSize: 13, 
    marginBottom: 6,
    lineHeight: 18 
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12
  },
  btn: { 
    backgroundColor: "#1f2937", 
    padding: 16, 
    borderRadius: 12, 
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  btnText: { 
    color: "#fff", 
    fontSize: 15,
    fontWeight: "800"
  },
  btnIcon: {
    marginLeft: 6
  }
  ,
  feedbackBtn: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  feedbackText: {
    color: '#0b0b0e',
    fontWeight: '700'
  }
});