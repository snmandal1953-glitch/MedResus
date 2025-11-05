import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { storage } from "../services/storage";
import { useI18n } from "../i18n/I18nContext";

type Nav = any;

export default function HomeScreen({ navigation }: { navigation: Nav }) {
  const { t, toggleLang, lang } = useI18n();
  const [archiveCount, setArchiveCount] = useState<number | null>(null);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const arch = await storage.get<any[]>("MED_RESUS_ARCHIVE");
        setArchiveCount(Array.isArray(arch) ? arch.length : 0);
        const active = await storage.get<string>("activeCaseId");
        setActiveCaseId(active ?? null);
        const profile = await storage.get<{ name?: string }>("userProfile");
        setUserName(profile?.name ?? null);
      } catch (e) {
        setArchiveCount(0);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>MedResus</Text>
          <Text style={styles.subtitle}>{t("subtitle")}</Text>
        </View>
        <View style={styles.profileBubble} accessibilityLabel={userName ? `Hi ${userName}` : 'MedResus'}>
          <Text style={styles.profileInitial}>{userName ? userName.charAt(0).toUpperCase() : 'M'}</Text>
        </View>
      </View>

      <View style={styles.cardsRow}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Active case</Text>
          <Text style={styles.cardValue}>{activeCaseId ? 'Open' : 'None'}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Archive</Text>
          <Text style={styles.cardValue}>{archiveCount ?? '—'}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.cta}
        onPress={() => navigation.navigate("CodeBlue")}
        accessibilityRole="button"
        accessibilityLabel="Start a code blue"
      >
        <Text style={styles.ctaEmoji}>🚨</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.ctaTitle}>{t("start_code_blue")}</Text>
          <Text style={styles.ctaSub}>{t("start_hint")}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.quickRow}>
        <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('CodeBlue')}>
          <Text style={styles.quickEmoji}>⚡</Text>
          <Text style={styles.quickText}>Quick start</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('Summary')}>
          <Text style={styles.quickEmoji}>📄</Text>
          <Text style={styles.quickText}>Summary</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('Audit') }>
          <Text style={styles.quickEmoji}>📊</Text>
          <Text style={styles.quickText}>Audit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footerRow}>
        <TouchableOpacity style={styles.lang} onPress={toggleLang}>
          <Text style={styles.langText}>{lang === 'en' ? 'हिंदी' : lang === 'hi' ? 'Hinglish' : 'English'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.lang, { backgroundColor: '#f3f4f6' }]}
          onPress={async () => {
            await storage.clearAll();
            navigation.replace('Login');
          }}
        >
          <Text style={{ color: '#000', fontWeight: '700' }}>Reset app data</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.copyrightContainer}>
        <Text style={styles.copyrightText}>© 2025 MedResus. All rights reserved.</Text>
        <TouchableOpacity onPress={() => navigation.navigate('About')}>
          <Text style={styles.aboutLink}>About & Legal</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 20,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800' },
  subtitle: { color: '#94a3b8', fontSize: 12 },
  profileBubble: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1f2937', alignItems: 'center', justifyContent: 'center' },
  profileInitial: { color: '#fff', fontWeight: '800' },
  cardsRow: { flexDirection: 'row', gap: 12, marginBottom: 18 },
  card: { flex: 1, backgroundColor: '#0b1220', borderRadius: 12, padding: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width:0, height:2 } },
  cardLabel: { color: '#94a3b8', fontSize: 12 },
  cardValue: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 6 },
  cta: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ef4444', padding: 16, borderRadius: 14, marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.25, shadowOffset: { width:0, height:4 } },
  ctaEmoji: { fontSize: 28, marginRight: 12 },
  ctaTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  ctaSub: { color: '#fdeceb', fontSize: 12 },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 18 },
  quickBtn: { flex: 1, backgroundColor: '#071128', borderRadius: 12, padding: 12, alignItems: 'center' },
  quickEmoji: { fontSize: 20 },
  quickText: { color: '#cbd5e1', marginTop: 6, fontWeight: '700' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lang: { backgroundColor: '#0ea5e9', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 },
  langText: { color: '#000', fontWeight: '700' },
  copyrightContainer: { marginTop: 20, alignItems: 'center' },
  copyrightText: { color: '#64748b', fontSize: 11, marginBottom: 4 },
  aboutLink: { color: '#0ea5e9', fontSize: 12, fontWeight: '600' },
});


