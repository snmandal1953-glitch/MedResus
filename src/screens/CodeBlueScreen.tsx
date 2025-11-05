import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable,
  TextInput, Button, Alert, Modal, TouchableOpacity
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as MailComposer from 'expo-mail-composer';
import * as Clipboard from 'expo-clipboard';
import { storage } from '../services/storage';
import { saveCsv } from '../services/exportCSV';
import { isLicenseValidForUser } from '../services/subscription';
// removed Linking import as rhythm videos were removed
import { DocumentationButtons } from './codeblue/DocumentationButtons';
import { RoscDetailsModal } from './RoscDetailsModal';
import { RhythmAnalysisModal } from './RhythmAnalysisModal';
import { ReversibleCauseNoteModal } from './ReversibleCauseNoteModal';
import { RescEndedModal } from './RescEndedModal';
import { AirwayManagementModal } from './AirwayManagementModal';
import { useResuscitationEnd, useRoscDetails, useReversibleCauseNote, useRhythmAnalysis } from './codeblue/useModalHooks';

import { 
  CaseState, 
  BaseEvent,
  EventLog,
  RescEndedEvent,
  RoscEvent,
  ReversibleCauseEvent,
  RhythmAnalysisEvent,
  RoleTransitionEvent,
  AirwayEvent
} from '../data/types';

type Section = 'C' | 'A' | 'B' | 'D' | 'E';

// Using CaseState from types.ts

import { now, newId, fmtElapsed, caseKey, capitalize } from './codeblue/helpers';
// Removed duplicate import


async function loadOrCreateCase(): Promise<CaseState> {
  const existingId = await storage.get<string>('activeCaseId');
  if (existingId) {
    const raw = await storage.get<CaseState>(caseKey(existingId));
    if (raw && now() - raw.startedAt < 6 * 60 * 60 * 1000) return raw;
  }
  const fresh: CaseState = { caseId: newId(), startedAt: now(), events: [], shockCount: 0 };
  await storage.set('activeCaseId', fresh.caseId);
  await storage.set(caseKey(fresh.caseId), fresh);
  return fresh;
}
async function persistCase(cs: CaseState) {
  await storage.set('activeCaseId', cs.caseId);
  await storage.set(caseKey(cs.caseId), cs);
}

const PatientInfoModal = ({
  isVisible,
  onClose,
  location,
  uhid,
  onSave,
}: {
  isVisible: boolean;
  onClose: () => void;
  location: string;
  uhid: string;
  onSave: (location: string, uhid: string) => void;
}) => {
  const [localLocation, setLocalLocation] = useState(location);
  const [localUhid, setLocalUhid] = useState(uhid);

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Patient Details</Text>
          <Text style={styles.label}>Location</Text>
          <TextInput 
            value={localLocation}
            onChangeText={setLocalLocation}
            placeholder="e.g., ED Bed 1"
            style={styles.modalInput}
          />
          <Text style={styles.label}>UHID (if known)</Text>
          <TextInput
            value={localUhid}
            onChangeText={setLocalUhid}
            placeholder="UHID"
            style={styles.modalInput}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={() => onSave(localLocation, localUhid)}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const RhythmCheckModal = ({
  isVisible,
  onClose,
  onSelectRhythm,
}: {
  isVisible: boolean;
  onClose: () => void;
  onSelectRhythm: (rhythm: string) => void;
}) => {
  const rhythmOptions = ['VF', 'VT', 'PEA', 'Asystole'];

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Rhythm</Text>
          {rhythmOptions.map(rhythm => (
            <TouchableOpacity
              key={rhythm}
              style={styles.rhythmButton}
              onPress={() => onSelectRhythm(rhythm)}
            >
              <Text style={styles.rhythmButtonText}>{rhythm}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Roles: two compressors, airway, drugs, IV/IO, team lead, recorder (seventh member)
type RoleId = 'compressor1' | 'compressor2' | 'airway' | 'drugs' | 'ivio' | 'defib' | 'lead' | 'recorder';

const AirwayKitModal = ({
  isVisible,
  onClose,
  onSelect,
  suggestHelper,
  onAssignHelper,
}: {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (item: string) => void;
  suggestHelper?: string | null;
  onAssignHelper?: (roleId: RoleId) => void;
}) => {
  const blades = ['Mac 0', 'Mac 1', 'Mac 2', 'Mac 3', 'Mac 4', 'Miller 0', 'Miller 1', 'Miller 2'];
  const lmaSizes = ['LMA 3', 'LMA 4', 'LMA 5'];
  const ettSizes = ['6.0', '6.5', '7.0', '7.5', '8.0', '8.5'];
  const igelSizes = ['i-gel 3', 'i-gel 4', 'i-gel 5'];
  const adjuncts = ['Bougie', 'Stylet', 'Suction', 'Bag-mask', 'OPA/NPA'];

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.bottomModalContainer}>
        <View style={styles.bottomSheet}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.smallTitle}>Airway kit</Text>
            <Pressable onPress={onClose} style={({pressed}) => [{ padding: 6, borderRadius: 6 }, pressed && { opacity: 0.6 }]}>
              <Text style={{ color: '#374151', fontWeight: '700' }}>Close</Text>
            </Pressable>
          </View>

          {suggestHelper ? (
            <View style={{ marginTop: 8, marginBottom: 6 }}>
              <Text style={styles.smallText}>Suggested helper: <Text style={{ fontWeight: '700' }}>{suggestHelper}</Text></Text>
              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                <Pressable onPress={() => onAssignHelper && onAssignHelper('compressor1')} style={styles.smallButton}>
                  <Text style={styles.smallButtonText}>Assign</Text>
                </Pressable>
                <Pressable onPress={onClose} style={[styles.smallButton, { backgroundColor: '#f3f4f6', marginLeft: 8 }] }>
                  <Text style={[styles.smallButtonText, { color: '#374151' }]}>Ignore</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          <View style={styles.grid}>
            {[{ title: 'Blades', items: blades }, { title: 'LMAs', items: lmaSizes }, { title: 'ETT', items: ettSizes.map(s => `ETT ${s}`) }, { title: 'i-gel', items: igelSizes }, { title: 'Adjuncts', items: adjuncts }].map(section => (
              <View key={section.title} style={{ marginBottom: 6, width: '100%' }}>
                <Text style={styles.smallText}>{section.title}</Text>
                <View style={styles.gridRow}>
                  {section.items.map((it: string) => (
                    <Pressable key={it} onPress={() => onSelect(it)} style={styles.gridItem}>
                      <Text style={styles.gridItemText}>{it}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </View>

        </View>
      </View>
    </Modal>
  );
};

const DrugGuidanceModal = ({
  isVisible,
  onClose,
  onSelectDrug,
  onAdminister,
}: {
  isVisible: boolean;
  onClose: () => void;
  onSelectDrug: (drugId: string) => void;
  onAdminister: (drugId: string, dose: string, suppressActor?: boolean) => void;
}) => {
  const dgModule = require('../utils/drugGuidance');
  const allDrugs: any[] = dgModule.allDrugs;
  const paedFunc = dgModule.paediatricDoses;

  const [filter, setFilter] = useState<'All'|'H'|'T'|'RSI'|'Antiarr'|'Haem'>('All');
  const [weight, setWeight] = useState<string>('');
  const [selected, setSelected] = useState<string | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminDose, setAdminDose] = useState('');
  const [suppressActor, setSuppressActor] = useState(false);

  const rsiIds = new Set(['etomidate','ketamine','propofol','succinylcholine','rocuronium','fentanyl','midazolam','atracurium']);
  const antiArrIds = new Set(['amiodarone','lidocaine','magnesium','adrenaline']);
  const haemIds = new Set(['tranexamic_acid','alteplase','streptokinase']);

  const weightNum = parseFloat(weight || '0');
  const paedMap = paedFunc(weightNum > 0 ? weightNum : undefined);

  const matchesFilter = (d: any) => {
    if (filter === 'All') return true;
    if (filter === 'H') return !!d.indications?.some((i: string) => i.includes('(H)'));
    if (filter === 'T') return !!d.indications?.some((i: string) => i.includes('(T)'));
    if (filter === 'RSI') return rsiIds.has(d.id);
    if (filter === 'Antiarr') return antiArrIds.has(d.id);
    if (filter === 'Haem') return haemIds.has(d.id);
    return true;
  };

  const copyReconst = async (text?: string) => {
    if (!text) return Alert.alert('No instructions', 'No reconstitution instructions available for this drug');
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('Copied', 'Reconstitution instructions copied to clipboard');
    } catch (e) {
      Alert.alert('Copy failed', 'Unable to copy to clipboard');
    }
  };

  const openAdmin = (drugId: string, prefill?: string) => {
    setSelected(drugId);
    setAdminDose(prefill ?? '');
    setSuppressActor(false);
    setAdminOpen(true);
  };

  const doAdmin = () => {
    if (!selected) return;
    onAdminister(selected, adminDose || 'Dose not specified', suppressActor);
    setAdminOpen(false);
  };

  const filtered = allDrugs.filter(matchesFilter);

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { maxHeight: '85%' }]}>
          <Text style={styles.modalTitle}>Drugs for resuscitation</Text>

          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            {['All','H','T','RSI','Antiarr','Haem'].map(f => (
              <Pressable key={f} onPress={() => setFilter(f as any)} style={({pressed}) => [{ padding: 6, borderRadius: 6, backgroundColor: filter === f ? '#0ea5e9' : '#f3f4f6', marginRight: 6 }, pressed && { opacity: 0.7 }]}>
                <Text style={{ color: filter === f ? 'white' : '#374151', fontWeight: '700' }}>{f}</Text>
              </Pressable>
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontWeight: '700' }}>Weight (kg)</Text>
            <TextInput keyboardType="numeric" placeholder="e.g., 25" value={weight} onChangeText={setWeight} style={[styles.input, { flex: 1 }]} />
          </View>

          <ScrollView>
            {filtered.map((d: any) => {
              const paedShown = d.paediatricDose || (d.id === 'adrenaline' ? paedMap.adrenaline : d.id === 'amiodarone' ? paedMap.amiodarone : d.id === 'lidocaine' ? paedMap.lidocaine : d.id === 'magnesium' ? paedMap.magnesium : d.id === 'calcium_chloride' ? paedMap.calcium : undefined);
              return (
                <View key={d.id} style={{ marginBottom: 12 }}>
                  <Text style={{ fontWeight: '700' }}>{d.name}</Text>
                  <Text style={{ color: '#374151' }}>{d.adultDose}</Text>
                  {paedShown ? <Text style={{ color: '#6b7280' }}>Paed: {paedShown}</Text> : null}
                  {d.reconstitution ? <Text style={{ marginTop: 6, color: '#374151' }}>Reconstitution: {d.reconstitution}</Text> : null}
                  {d.indications ? <Text style={{ marginTop: 6, color: '#6b7280' }}>Indications: {d.indications.join(', ')}</Text> : null}
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                    <TouchableOpacity style={styles.rhythmButton} onPress={() => onSelectDrug(d.id)}>
                      <Text style={styles.rhythmButtonText}>Select & Log</Text>
                    </TouchableOpacity>
                    {d.reconstitution ? (
                      <TouchableOpacity style={styles.rhythmButton} onPress={() => copyReconst(d.reconstitution)}>
                        <Text style={styles.rhythmButtonText}>Copy reconst.</Text>
                      </TouchableOpacity>
                    ) : null}
                    <TouchableOpacity style={styles.rhythmButton} onPress={() => openAdmin(d.id, paedShown || d.adultDose)}>
                      <Text style={styles.rhythmButtonText}>Drug administered</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <TouchableOpacity style={[styles.closeButton, { marginTop: 8 }]} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>

          {/* Admin modal */}
          <Modal visible={adminOpen} transparent animationType="fade">
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Record drug administration</Text>
                <Text style={{ fontWeight: '700', marginBottom: 6 }}>{selected ? (require('../utils/drugGuidance').getDrugById(selected)?.name ?? selected) : ''}</Text>
                <TextInput value={adminDose} onChangeText={setAdminDose} style={styles.modalInput} placeholder="Dose to record (e.g., 1 mg IV)" />
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Pressable onPress={() => setSuppressActor(s => !s)} style={{ marginRight: 8 }}>
                    <Text style={{ color: suppressActor ? '#ef4444' : '#374151' }}>{suppressActor ? 'Hide operator' : 'Record operator'}</Text>
                  </Pressable>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
                  <Button title="Cancel" onPress={() => setAdminOpen(false)} />
                  <Button title="Log" onPress={doAdmin} />
                </View>
              </View>
            </View>
          </Modal>

        </View>
      </View>
    </Modal>
  );
};

const Pill = React.memo(function Pill({ label, onPress, danger, small }: { label: string; onPress: () => void; danger?: boolean; small?: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
      styles.pill,
      danger && { backgroundColor: '#ef4444' },
      small && { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10 },
      pressed && { opacity: 0.7 }
    ]}>
      <Text style={styles.pillText}>{label}</Text>
    </Pressable>
  );
});

export default function CodeBlueScreen({ navigation }: any) {
  const [profile, setProfile] = useState<{ name?: string; email?: string } | null>(null);
  const [actor, setActor] = useState<string>('');
  const [cs, setCs] = useState<CaseState | null>(null);
  const [activeTab, setActiveTab] = useState<Section>('C');
  const [nowTick, setNowTick] = useState(Date.now());
  const [showAirway, setShowAirway] = useState(false);
  const [licenseValid, setLicenseValid] = useState<boolean>(false);

    // Documentation modal hooks
    const rescEnd = useResuscitationEnd();
    const roscDetails = useRoscDetails();
    const reversibleCause = useReversibleCauseNote();
    const rhythmAnalysis = useRhythmAnalysis();

    // Documentation event handlers
    const handleRoscAchieved = async (data: { cause: string; team: string; notes?: string }) => {
      if (!cs) return;
      const event: RoscEvent = {
        type: 'rosc_achieved',
        id: newId(),
        ts: now(),
        tRelMs: now() - cs.startedAt,
        who: actor,
        section: 'C',
        action: 'ROSC Achieved',
        ...data
      };
      setCs({ ...cs, events: [event, ...cs.events] });
      await persistCase({ ...cs, events: [event, ...cs.events] });
    };

    const handleRhythmAnalysisNote = async (data: { rhythm: string; analysis: string; plan: string }) => {
      if (!cs) return;
      const event: RhythmAnalysisEvent = {
        type: 'rhythm_analysis',
        id: newId(),
        ts: now(),
        tRelMs: now() - cs.startedAt,
        who: actor,
        section: 'C',
        action: 'Rhythm Analysis',
        ...data
      };
      setCs({ ...cs, events: [event, ...cs.events] });
      await persistCase({ ...cs, events: [event, ...cs.events] });
    };

    const handleReversibleCause = async (data: { cause: string; discussion: string; intervention: string }) => {
      if (!cs) return;
      const event: ReversibleCauseEvent = {
        type: 'reversible_cause_note',
        id: newId(),
        ts: now(),
        tRelMs: now() - cs.startedAt,
        who: actor,
        section: 'C',
        action: 'Reversible Cause',
        ...data
      };
      setCs({ ...cs, events: [event, ...cs.events] });
      await persistCase({ ...cs, events: [event, ...cs.events] });
    };

    const handleResuscitationEnd = async (data: { reason: string; cause: string; notes?: string }) => {
      if (!cs) return;
      const event: RescEndedEvent = {
        type: 'resuscitation_ended',
        id: newId(),
        ts: now(),
        tRelMs: now() - cs.startedAt,
        who: actor,
        section: 'C',
        action: 'Resuscitation Ended',
        ...data
      };
      setCs({ ...cs, events: [event, ...cs.events] });
      await persistCase({ ...cs, events: [event, ...cs.events] });
      // TODO: Consider navigating to summary screen
    };

  // Roles: track assignments and history
  const defaultRoleNames: Record<RoleId, string> = {
    compressor1: 'Compressor 1',
    compressor2: 'Compressor 2',
    airway: 'Airway',
    drugs: 'Drugs',
    ivio: 'IV/IO',
    defib: 'Defibrillator',
    lead: 'Team Lead',
    recorder: 'Recorder',
  };

  // Helper to assign a role with documentation
  const assignRole = (roleId: RoleId, name: string, action?: string) => {
    const timestamp = now();
    const prevRole = Object.entries(roles).find(([_, n]) => n === name)?.[0] as RoleId | undefined;
    
    // Update roles map
    setRoles(prev => ({ ...prev, [roleId]: name }));

    // Add event with descriptive text
    const description = action ?? 
      (prevRole 
        ? `${name} transitioned from ${defaultRoleNames[prevRole]} to ${defaultRoleNames[roleId]}`
        : `${name} joined as ${defaultRoleNames[roleId]}`);

    addEvent('C', 'Role Assignment', description, { role: roleId });
  };

  // Helper to render event descriptions (supports enhanced event types)
  const renderEventDescription = (ev: EventLog) => {
    // Get role context if available
    const roleContext = ev.role ? ` [${defaultRoleNames[ev.role] || ev.role}]` : '';
    
    // Handle specific event types
    if ('type' in ev) {
      switch (ev.type) {
        case 'rosc_achieved':
          return `ROSC — ${ev.cause}${ev.team ? ` (${ev.team})` : ''}${ev.notes ? ` — ${ev.notes}` : ''}`;
        case 'reversible_cause_note':
          return `Reversible cause — ${ev.cause}: ${ev.discussion}${ev.intervention ? ` — Action: ${ev.intervention}` : ''}`;
        case 'rhythm_analysis':
          return `Rhythm analysis — ${ev.rhythm}: ${ev.analysis}${ev.plan ? ` — Plan: ${ev.plan}` : ''}`;
        case 'resuscitation_ended':
          return `End resuscitation — ${ev.reason}${ev.cause ? ` — Cause: ${ev.cause}` : ''}${ev.notes ? ` — ${ev.notes}` : ''}`;
        case 'role_transition':
          return `Role change: ${ev.name} ${ev.fromRole ? `from ${defaultRoleNames[ev.fromRole]} to` : 'assigned to'} ${defaultRoleNames[ev.toRole]}${ev.action ? ` — ${ev.action}` : ''}`;
      }
    }
    
    // Basic event format with role context
    return `${ev.who ? `${ev.who}${roleContext}: ` : ''}${capitalize(ev.action)}${ev.details ? ` — ${ev.details}` : ''}`;
  };
  const [roles, setRoles] = useState<Record<RoleId, string>>(defaultRoleNames);
  const [activeRole, setActiveRole] = useState<RoleId>('lead');
  const [roleEditOpen, setRoleEditOpen] = useState(false);
  const [roleEditKey, setRoleEditKey] = useState<RoleId | null>(null);
  const [roleEditName, setRoleEditName] = useState('');

  // timers & counters
  const [cprRemaining, setCprRemaining] = useState(0); // ms
  const cprIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // quick inputs
  const [etco2, setEtco2] = useState('');
  const [rhythm, setRhythm] = useState('');
  const [tubeSize, setTubeSize] = useState('');
  const [note, setNote] = useState('');

  const handleRhythmCheck = () => {
    if (activeRole !== 'lead') {
      Alert.alert('Action not allowed', 'Only the Team Lead can initiate a rhythm check.');
      return;
    }
    setRhythmModalOpen(true);
  };

  const handleRhythmSelect = async (selectedRhythm: string) => {
    setRhythmModalOpen(false);
    setRhythm(selectedRhythm);
    
    if (!cs) return;

    const event: EventLog = {
      id: newId(),
      ts: now(),
      tRelMs: now() - cs.startedAt,
      section: 'D',
      action: 'Rhythm check',
      details: selectedRhythm,
      who: actor
    };

    const nextCs: CaseState = { 
      ...cs, 
      events: [event, ...cs.events]
    };
    setCs(nextCs);
    await persistCase(nextCs);

    // Handle shock-related actions
    if (selectedRhythm === 'VF' || selectedRhythm === 'VT') {
      if (activeRole === 'defib') {
        Alert.alert('Action Required', 'Prepare for defibrillation');
      } else {
        Alert.alert('Action Required', 'Notify defibrillator operator to prepare for shock');
      }
    } else if (selectedRhythm === 'PEA') {
      Alert.alert('Action Required', 'Check pulse');
    }
  };

  // airway kit state & handlers
  const [airwayKitModalOpen, setAirwayKitModalOpen] = useState(false);
  const [drugGuideModalOpen, setDrugGuideModalOpen] = useState(false);
  // Using showAirway state instead of airwayManagementOpen

  const handleAirwayEvent = (event: Partial<AirwayEvent>) => {
    if (!cs) return;
    const airwayEvent: AirwayEvent = {
      id: newId(),
      ts: now(),
      tRelMs: now() - cs.startedAt,
      who: actor,
      section: 'A',
      type: 'airway',
      technique: event.technique ?? 'basic',
      step: event.step ?? '',
      action: event.action ?? '',
      details: event.details
    };
    
    // Update advanced airway state if needed
    if (event.technique === 'advanced') {
      setCs(prev => prev ? ({ ...prev, airwayAdvanced: true, events: [airwayEvent, ...prev.events] }) : prev);
      persistCase({ ...cs, airwayAdvanced: true, events: [airwayEvent, ...cs.events] });
    } else {
      setCs(prev => prev ? ({ ...prev, events: [airwayEvent, ...prev.events] }) : prev);
      persistCase({ ...cs, events: [airwayEvent, ...cs.events] });
    }

    if (event.technique === 'advanced') {
      Alert.alert('Advanced Airway', 'Switching to continuous compressions');
    }
  };

  const handleAirwaySelect = async (item: string) => {
    // Determine if this is an advanced airway item
    const isAdvanced = item.toLowerCase().includes('i-gel') || item.toLowerCase().includes('ett');
    
    // Create airway event
    handleAirwayEvent({
      type: 'airway',
      technique: isAdvanced ? 'advanced' : 'basic',
      step: item,
      action: `Selected ${item}`,
      details: isAdvanced ? 'Advanced airway equipment selected' : undefined
    });

    // Close modal
    setAirwayKitModalOpen(false);
    Alert.alert('Airway', `${item} selected and logged`);
  };

  const handleDrugSelect = (drugId: string) => {
    const dg = require('../utils/drugGuidance').getDrugById(drugId);
    const name = dg ? dg.name : drugId;
    addEvent('E', 'Drug guidance selected', name);
    setDrugGuideModalOpen(false);
    Alert.alert('Drug guidance', `${name} selected and logged`);
  };

  const handleDrugAdminister = (drugId: string, dose: string, suppressActor?: boolean) => {
    const dg = require('../utils/drugGuidance').getDrugById(drugId);
    const name = dg ? dg.name : drugId;
    addEvent('E', 'Drug administered', `${name} — ${dose}`, { suppressActor: !!suppressActor });
    setDrugGuideModalOpen(false);
    Alert.alert('Drug administered', `${name} recorded: ${dose}`);
  };

  const assignHelperToAirway = (roleId: string) => {
    // log helper assignment
    const name = roles[roleId as RoleId] ?? roleId;
    // do not record the current actor as the 'who' when allocating a compressor to airway
    addEvent('A', 'Airway helper assigned', name, { suppressActor: true });
    Alert.alert('Helper', `${name} assigned to assist airway`);
  };

  // patient info
  const [location, setLocation] = useState<string>('');
  const [uhid, setUhid] = useState<string>('');
  const [patientInfoModalOpen, setPatientInfoModalOpen] = useState(false);

  // edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [rhythmModalOpen, setRhythmModalOpen] = useState(false);
  const [selectedRhythm, setSelectedRhythm] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const p = await storage.get<{ name?: string; email?: string }>('userProfile');
      setProfile(p ?? {});
      setActor(p?.name ?? '');
      
      // Check license before loading case
      const hasValidLicense = await isLicenseValidForUser(p?.email ?? '');
      setLicenseValid(hasValidLicense);
      
      if (!hasValidLicense) {
        Alert.alert(
          'License Required',
          'Your trial has expired or you need to activate a license to access case data.',
          [
            { text: 'Activate License', onPress: () => navigation.replace('LicenseActivation') },
            { text: 'Go Back', onPress: () => navigation.replace('Home') }
          ]
        );
        return;
      }
      
      const loaded = await loadOrCreateCase();
      setCs(loaded);
      // populate patient info from loaded case if present
      if (loaded.location) setLocation(loaded.location);
      if (loaded.uhid) setUhid(loaded.uhid);
      // load saved role names if any
      const saved = await storage.get<Record<string,string>>('roles');
      if (saved) {
        // merge saved names with defaults
        setRoles(r => ({ ...r, ...(saved as any) }));
      }
    })();
    return () => stopCPRTimer();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { if (cs) { const id = setTimeout(() => persistCase(cs), 350); return () => clearTimeout(id); } }, [cs]);

  const elapsed = useMemo(() => cs ? fmtElapsed(nowTick - cs.startedAt) : '00:00', [cs, nowTick]);

  const suggestedHelper = useMemo(() => {
    // If CPR is running, suggest a compressor who is not the active role
    if (!cprRemaining || cprRemaining === 0) return null;
    const compressors: RoleId[] = ['compressor1', 'compressor2'];
    for (const rid of compressors) {
      if (rid !== activeRole) return roles[rid] ?? rid;
    }
    return null;
  }, [cprRemaining, activeRole, roles]);

  const addEvent = React.useCallback((section: Section, action: string, details?: string, opts?: { suppressActor?: boolean; role?: RoleId }) => {
    setCs(prev => {
      if (!prev) return prev;
      // If opts.suppressActor is true OR the active role is the recorder, omit the actor name
      const shouldSuppress = !!opts?.suppressActor || activeRole === 'recorder';
      const who = shouldSuppress ? undefined : (actor || profile?.name);
      const ev: EventLog = { 
        id: newId(), 
        ts: now(), 
        tRelMs: now() - prev.startedAt, 
        who,
        role: opts?.role || activeRole,
        section, 
        action,
        details: details ? `${details}${who ? ` (by ${roles[activeRole] || activeRole})` : ''}` : undefined
      };
      return { ...prev, events: [ev, ...prev.events] };
    });
  }, [actor, profile?.name, activeRole, roles]);

  const startCPRTimer = React.useCallback(() => {
    setCprRemaining(120000); // 2 minutes
    if (cprIntervalRef.current) clearInterval(cprIntervalRef.current as any);
    cprIntervalRef.current = setInterval(() => {
      setCprRemaining(prev => {
        const next = Math.max(prev - 1000, 0);
        if (next === 0) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          Alert.alert('CPR cycle', '2 minutes complete — Rhythm check now.');
          if (cprIntervalRef.current) clearInterval(cprIntervalRef.current as any);
        }
        return next;
      });
    }, 1000) as unknown as NodeJS.Timeout;
  }, []);
  const stopCPRTimer = React.useCallback(() => { if (cprIntervalRef.current) clearInterval(cprIntervalRef.current as any); cprIntervalRef.current = null; setCprRemaining(0); }, []);

  const onShock = React.useCallback((energy: string) => {
    addEvent('D', 'Shock delivered', energy);
    setCs(prev => prev ? ({ ...prev, shockCount: (prev.shockCount ?? 0) + 1 }) : prev);
  }, [addEvent]);

  const onAdrenaline = React.useCallback((dose: string) => {
    addEvent('E', 'Adrenaline', dose);
    setCs(prev => prev ? ({ ...prev, lastAdrenalineTs: now() }) : prev);
  }, [addEvent]);
  const markROSC = React.useCallback(() => {
    setCs(prev => {
      if (!prev) return prev;
      stopCPRTimer(); // stop the 2-min cycle
      const tRel = now() - prev.startedAt;
      addEvent('C', 'ROSC achieved', `at ${fmtElapsed(tRel)}`);
      Alert.alert('ROSC', `ROSC achieved at ${fmtElapsed(tRel)}`);
      return prev;
    });
  }, [addEvent, stopCPRTimer]);

  const adrenalineElapsed = useMemo(() => {
    if (!cs?.lastAdrenalineTs) return null;
    return nowTick - cs.lastAdrenalineTs;
  }, [cs?.lastAdrenalineTs, nowTick]);

  const undoLast = React.useCallback(() => { setCs(prev => { if (!prev || prev.events.length === 0) return prev; return { ...prev, events: prev.events.slice(1) }; }); }, []);

  const openEdit = React.useCallback((id: string, current: string) => { setEditId(id); setEditText(current); setEditOpen(true); }, []);
  const saveEdit = React.useCallback(() => {
    setCs(prev => {
      if (!prev || !editId) return prev;
      const updated = prev.events.map(e => e.id === editId ? { ...e, details: editText } : e);
      return { ...prev, events: updated };
    });
    setEditOpen(false);
  }, [editId, editText]);
  const deleteEvent = React.useCallback((id: string) => { setCs(prev => prev ? ({ ...prev, events: prev.events.filter(e => e.id !== id) }) : prev); }, []);

  const exportAndEmail = async () => {
  if (!cs) return;

  // 1) Build rows from the log (oldest → newest for chronological CSV)
  const rows: any[] = [...cs.events].reverse().map(e => ({
    time_absolute: new Date(e.ts).toISOString(),
    time_since_start: fmtElapsed(e.tRelMs),
    section: e.section,
    action: e.action,
    details: e.details ?? '',
    user: e.who ?? '',
    case_id: cs.caseId,
  }));

  // 2) Append a block for 4H/4T, if available
  const hts = await storage.get<{ h?: { label: string; status: string }[]; t?: { label: string; status: string }[] }>('reversibleCauses');

  if (hts && ((hts.h && hts.h.length) || (hts.t && hts.t.length))) {
    rows.push({});                                        // blank line
    rows.push({ section: '4H/4T Checklist' } as any);     // heading
    const all = [...(hts.h ?? []), ...(hts.t ?? [])];
    all.forEach(x => rows.push({ section: x.label, action: x.status }));
  }

  // 3) Save CSV file
  const uri = await saveCsv(`codeblue_${cs.caseId}.csv`, rows);

  // 4) Email it (to the logged-in staff email) or just save
  if (profile?.email) {
    await MailComposer.composeAsync({
      recipients: [profile.email],
      subject: `Code Blue Log – ${cs.caseId}`,
      body: `Dear Team,

Please find attached the Code Blue action log for case ${cs.caseId}.

Regards,
${profile?.name ?? 'ED Staff'}`,
      attachments: [uri],
    });
  } else {
    Alert.alert('CSV saved', 'No email set in Login. CSV saved locally in app storage.');
  }
};

  const savePatientInfo = async (loc: string, id: string) => {
    setLocation(loc);
    setUhid(id);
    setPatientInfoModalOpen(false);
    setCs(prev => {
      if (!prev) return prev;
      const next = { ...prev, location: loc || prev.location, uhid: id || prev.uhid } as CaseState;
      // log as an event
      const ev: EventLog = { id: newId(), ts: now(), tRelMs: now() - prev.startedAt, who: actor || profile?.name, section: 'C', action: 'Patient info', details: `${loc}${id ? ` — UHID: ${id}` : ''}` };
      next.events = [ev, ...next.events];
      persistCase(next).catch(() => {});
      return next;
    });
  };

  const SectionTabs = React.memo(function SectionTabs({ active, onChange }: { active: Section; onChange: (s: Section) => void }) {
    return (
      <View style={styles.tabs}>
        {(['C','A','B','D','E'] as Section[]).map(s => (
          <Pressable key={s} onPress={() => onChange(s)} style={[styles.tab, active === s && styles.tabActive]}>
            <Text style={[styles.tabText, active === s && styles.tabTextActive]}>{s}</Text>
          </Pressable>
        ))}
        <Pressable onPress={() => navigation.navigate('ReversibleCauses')} style={[styles.tab, { minWidth: 110 }]}>
          <Text style={styles.tabText}>4H/4T</Text>
        </Pressable>
      </View>
    );
  });

  return (
    <View style={styles.container}>
      {/* Header strip */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Code Blue</Text>
          {location ? <Text style={styles.user}>{location}</Text> : null}
          {!!profile?.name && <Text style={styles.user}>Logged in: {profile.name}</Text>}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.elapsed}>⏱ {elapsed}</Text>
          <Text style={styles.user}>Case ID: {cs?.caseId}</Text>
          <Pressable onPress={() => setPatientInfoModalOpen(true)} style={{ marginTop: 6 }}>
            <Text style={{ color: '#2563eb', fontWeight: '700' }}>{uhid ? `UHID: ${uhid}` : 'Set patient'}</Text>
          </Pressable>
        </View>
      </View>

      {/* Actor input - who is currently logging actions */}
      <View style={{ paddingHorizontal: 4, marginBottom: 8 }}>
        <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Logging as (team member)</Text>
        <TextInput value={actor} onChangeText={setActor} placeholder="e.g., Dr Singh" style={[styles.input, { paddingVertical: 8 }]} />
      </View>

      {/* Role shortcuts: tap to select, long-press to rename */}
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 4, marginBottom: 8, flexWrap: 'wrap' }}>
  {(['compressor1','compressor2','airway','drugs','ivio','defib','lead','recorder'] as RoleId[]).map((rid: RoleId) => (
          <Pressable
            key={rid}
            onPress={() => { setActiveRole(rid); setActor(roles[rid] ?? ''); }}
            onLongPress={() => { setRoleEditKey(rid); setRoleEditName(roles[rid] ?? ''); setRoleEditOpen(true); }}
            style={({ pressed }) => [styles.pill, { backgroundColor: activeRole === rid ? '#0369a1' : '#0ea5e9', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, marginRight: 6 }, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.pillText}>{roles[rid] ?? rid}</Text>
          </Pressable>
        ))}
      </View>

      {/* Timers/Counters */}
      <View style={styles.infoRow}>
        <View style={styles.badgeRow}>
          <Text style={styles.badgeLbl}>CPR</Text>
          <Text style={[styles.badgeVal, cprRemaining === 0 && { color: '#b91c1c' }]}>
            {fmtElapsed(Math.max(cprRemaining,0))}
          </Text>
          <Pill small label="Start 2:00" onPress={() => { addEvent('C','CPR started'); startCPRTimer(); }} />
          <Pill small label="Stop" onPress={() => { addEvent('C','CPR stopped'); stopCPRTimer(); }} />
        </View>

        <View style={styles.badgeRow}>
          <Text style={styles.badgeLbl}>Shocks</Text>
          <Text style={styles.badgeVal}>{cs?.shockCount ?? 0}</Text>
        </View>

        <View style={styles.badgeRow}>
          <Text style={styles.badgeLbl}>Adrenaline</Text>
          <Text style={[
            styles.badgeVal,
            adrenalineElapsed && adrenalineElapsed >= 180000 ? { color: '#b45309' } : null
          ]}>
            {adrenalineElapsed == null ? '--:--' : fmtElapsed(adrenalineElapsed)}
          </Text>
          <Pill small label="1 mg" onPress={() => onAdrenaline('1 mg IV/IO')} />
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
  <SectionTabs active={activeTab} onChange={setActiveTab} />

        {/* Rhythm modal removed per request - logs will show a short sentence when rhythm checked */}

        {/* CAB-DE panes */}
        <View style={styles.card}>
          {activeTab === 'C' && (
            <>
              <View style={styles.row}>
                <Pill label="Rhythm check" onPress={handleRhythmCheck} />
                <Pill label="Pulse check" onPress={() => addEvent('C','Pulse check')} />
                <Pill label="IV/IO access" onPress={() => addEvent('C','IV/IO access obtained')} />
                <Pill label="Femoral arterial (ABG)" onPress={() => {
                  // include CPR status in the details when logging
                  const duringCpr = cprRemaining > 0;
                  const details = `${duringCpr ? 'During CPR — ' : ''}Femoral arterial sample (ABG) — Porter notified`;
                  addEvent('C', 'Blood sample', details);
                  Alert.alert('Blood Sample', 'Porter notified for ABG/lab sample collection');
                }} />
              </View>
              <View style={styles.noteRow}>
                <TextInput placeholder="Circulation note" value={note} onChangeText={setNote} style={styles.input} />
                <Pill small label="Add" onPress={() => { if (note.trim()) { addEvent('C','Note', note.trim()); setNote(''); }}} />
              </View>
            </>
          )}

          {activeTab === 'A' && (
            <>
              <View style={styles.row}>
                <Pill 
                  label="Airway Management" 
                  onPress={() => setShowAirway(true)} 
                />
                <Pill 
                  label="Airway Kit"
                  onPress={() => setAirwayKitModalOpen(true)}
                />
                <Pill 
                  label={cs?.airwayAdvanced ? "Continuous CPR" : "30:2 Ratio"} 
                  onPress={() => {
                    if (!cs?.airwayAdvanced) {
                      Alert.alert(
                        'Change CPR Ratio',
                        'Switch to continuous compressions? Only do this after advanced airway placement.',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { 
                            text: 'Confirm', 
                            onPress: () => {
                              setCs(prev => prev ? ({ ...prev, airwayAdvanced: true }) : prev);
                              handleAirwayEvent({
                                type: 'airway',
                                technique: 'advanced',
                                step: 'ratio-change',
                                action: 'Changed CPR Ratio',
                                details: 'Switched to continuous compressions after advanced airway'
                              });
                            }
                          }
                        ]
                      );
                    } else {
                      Alert.alert(
                        'Current Status',
                        'Advanced airway in place - maintaining continuous compressions'
                      );
                    }
                  }} 
                />
                <Pill 
                  label="Equipment" 
                  onPress={() => setAirwayKitModalOpen(true)} 
                />
              </View>
            </>
          )}

          {activeTab === 'B' && (
            <>
              <View style={styles.row}>
                <Pill label="O₂ started" onPress={() => addEvent('B','Oxygen started')} />
                <Pill label="Bag-mask vent" onPress={() => addEvent('B','Bag-mask ventilation')} />
              </View>
              <View style={styles.noteRow}>
                <TextInput placeholder="ETCO₂ (mmHg)" keyboardType="numeric" value={etco2} onChangeText={setEtco2} style={[styles.input, { flex: 0.6 }]} />
                <Pill small label="Log ETCO₂" onPress={() => { if (etco2.trim()) { addEvent('B','ETCO₂', `${etco2} mmHg`); setEtco2(''); }}} />
              </View>
            </>
          )}

          {activeTab === 'D' && (
            <>
              <View style={styles.row}>
                <Pill danger label="Shock 120 J" onPress={() => onShock('120 J biphasic')} />
                <Pill danger label="Shock 150 J" onPress={() => onShock('150 J biphasic')} />
                <Pill danger label="Shock 200 J" onPress={() => onShock('200 J biphasic')} />
              </View>
              <View style={styles.noteRow}>
                <TextInput placeholder="Rhythm (VF/pVT/PEA/Asystole)" value={rhythm} onChangeText={setRhythm} style={styles.input} />
                <Pill small label="Log rhythm" onPress={() => { if (rhythm.trim()) { addEvent('D','Rhythm', rhythm.trim()); setRhythm(''); }}} />
              </View>
            </>
          )}

          {activeTab === 'E' && (
            <>
              <View style={styles.row}>
                <Pill label="Amiodarone 300 mg" onPress={() => addEvent('E','Amiodarone','300 mg IV/IO')} />
                <Pill label="Amiodarone 150 mg" onPress={() => addEvent('E','Amiodarone','150 mg IV/IO')} />
                <Pill label="Magnesium 2 g" onPress={() => addEvent('E','Magnesium','2 g IV')} />
                <Pill label="Drugs guide" onPress={() => setDrugGuideModalOpen(true)} />
              </View>
            </>
          )}
        </View>

        {/* Documentation controls */}
        <DocumentationButtons
          onRoscDetails={() => roscDetails.openModal()}
          onRhythmAnalysis={() => rhythmAnalysis.openModal()}
          onReversibleCause={() => reversibleCause.openModal()}
          onEndResuscitation={() => rescEnd.openModal()}
        />

        <RoscDetailsModal
          isVisible={roscDetails.isModalOpen}
          onClose={() => { roscDetails.closeModal(); roscDetails.reset(); }}
          onSave={async (data) => { await handleRoscAchieved({ cause: data.cause, team: data.team, notes: data.notes }); roscDetails.closeModal(); roscDetails.reset(); }}
        />

        <RhythmAnalysisModal
          isVisible={rhythmAnalysis.isModalOpen}
          onClose={() => { rhythmAnalysis.closeModal(); rhythmAnalysis.reset(); }}
          onSave={async (data) => { await handleRhythmAnalysisNote({ rhythm: data.rhythm, analysis: data.analysis, plan: data.plan }); rhythmAnalysis.closeModal(); rhythmAnalysis.reset(); }}
        />

        <ReversibleCauseNoteModal
          isVisible={reversibleCause.isModalOpen}
          onClose={() => { reversibleCause.closeModal(); reversibleCause.reset(); }}
          onSave={async (data) => { await handleReversibleCause({ cause: data.cause, discussion: data.discussion, intervention: (data as any).intervention }); reversibleCause.closeModal(); reversibleCause.reset(); }}
        />

        <RescEndedModal
          isVisible={rescEnd.isModalOpen}
          onClose={() => { rescEnd.closeModal(); rescEnd.reset(); }}
          onSave={async (data) => { await handleResuscitationEnd({ reason: data.reason, cause: data.cause, notes: data.notes }); rescEnd.closeModal(); rescEnd.reset(); navigation.navigate('Summary', { caseId: cs?.caseId }); }}
        />

        {/* Running Log */}
        <View style={styles.logHeaderRow}>
         <Text style={styles.sectionTitle}>Running log</Text>
         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ marginRight: 8 }}>
              <Pill small label="Undo" onPress={undoLast} />
            </View>
            <View style={{ marginRight: 8 }}>
              <Pill small label="Export" onPress={exportAndEmail} />
            </View>
            <View>
              <Pill small label="ROSC" onPress={markROSC} />
            </View>
         </View>
       </View>


        {!cs || cs.events.length === 0 ? (
          <Text style={{ color: '#6b7280' }}>No actions recorded yet.</Text>
        ) : cs.events.map(ev => (
          <Pressable
            key={ev.id}
            onLongPress={() =>
              Alert.alert('Log entry', 'Edit or delete this entry?', [
                { text: 'Edit', onPress: () => openEdit(ev.id, ev.details ?? '') },
                { text: 'Delete', style: 'destructive', onPress: () => deleteEvent(ev.id) },
                { text: 'Cancel', style: 'cancel' },
              ])
            }
            style={styles.logRow}
          >
            <Text style={styles.logTime}>{fmtElapsed(ev.tRelMs)}</Text>
            <View style={{ flex: 1 }}>
            <Text style={styles.logText}>{renderEventDescription(ev)}.</Text>
            {!!ev.who && <Text style={styles.logMeta}>{ev.who}</Text>}
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Rhythm check modal */}
      <RhythmCheckModal
        isVisible={rhythmModalOpen}
        onClose={() => setRhythmModalOpen(false)}
        onSelectRhythm={handleRhythmSelect}
      />
      {/* Airway kit modal */}
      <AirwayKitModal
        isVisible={airwayKitModalOpen}
        onClose={() => setAirwayKitModalOpen(false)}
        onSelect={handleAirwaySelect}
        suggestHelper={suggestedHelper}
        onAssignHelper={(rid) => assignHelperToAirway(rid)}
      />
      {/* Airway management modal */}
      <AirwayManagementModal
        isVisible={showAirway}
        onClose={() => setShowAirway(false)}
        onAirwayEvent={handleAirwayEvent}
        currentRatio={cs?.airwayAdvanced ? "continuous" : "30:2"}
        isAdvancedAirway={cs?.airwayAdvanced ?? false}
      />

      {/* Drug guidance modal */}
      <DrugGuidanceModal
        isVisible={drugGuideModalOpen}
        onClose={() => setDrugGuideModalOpen(false)}
        onSelectDrug={handleDrugSelect}
        onAdminister={handleDrugAdminister}
      />
      {/* Patient info modal */}
      <PatientInfoModal
        isVisible={patientInfoModalOpen}
        onClose={() => setPatientInfoModalOpen(false)}
        location={location}
        uhid={uhid}
        onSave={savePatientInfo}
      />

      {/* Role edit modal */}
      <Modal visible={roleEditOpen} transparent animationType="fade">
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={{ fontWeight: '700', marginBottom: 8 }}>Rename role</Text>
            <Text style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>Role key: {roleEditKey ?? ''}</Text>
            <TextInput value={roleEditName} onChangeText={setRoleEditName} placeholder="Role display name" style={styles.input} />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
              <Button title="Cancel" onPress={() => setRoleEditOpen(false)} />
              <Button title="Save" onPress={async () => {
                if (!roleEditKey) return setRoleEditOpen(false);
                const next = { ...roles, [roleEditKey]: roleEditName || defaultRoleNames[roleEditKey] } as any;
                setRoles(next);
                await storage.set('roles', next);
                setRoleEditOpen(false);
              }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit modal */}
      <Modal visible={editOpen} transparent animationType="fade">
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={{ fontWeight: '700', marginBottom: 8 }}>Edit details</Text>
            <TextInput value={editText} onChangeText={setEditText} placeholder="Details…" style={styles.input} />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
              <Button title="Cancel" onPress={() => setEditOpen(false)} />
              <Button title="Save" onPress={saveEdit} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700' },
  elapsed: { fontSize: 16, fontWeight: '600', color: '#111827' },
  user: { fontSize: 12, color: '#6b7280' },

  infoRow: { flexDirection: 'row', gap: 14, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingVertical: 6, paddingHorizontal: 8 },
  badgeLbl: { fontWeight: '700' },
  badgeVal: { fontWeight: '900', fontVariant: ['tabular-nums'], minWidth: 54, textAlign: 'right' },

  modalContainer: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', borderRadius: 10, padding: 20, width: '80%', maxWidth: 400 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  rhythmButton: { backgroundColor: '#3b82f6', borderRadius: 8, padding: 12, marginBottom: 10 },
  rhythmButtonText: { color: 'white', fontSize: 16, textAlign: 'center', fontWeight: '600' },
  closeButton: { marginTop: 10, padding: 12, borderRadius: 8, backgroundColor: '#f3f4f6' },
  closeButtonText: { color: '#374151', fontSize: 16, textAlign: 'center', fontWeight: '600' },
  label: { fontSize: 14, color: '#374151', marginBottom: 4, fontWeight: '600' },
  modalInput: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 6, padding: 8, marginBottom: 16 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 10 },
  cancelButton: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#f3f4f6' },
  saveButton: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#3b82f6' },
  buttonText: { color: '#374151', fontSize: 16, textAlign: 'center', fontWeight: '600' },
  saveButtonText: { color: 'white', fontSize: 16, textAlign: 'center', fontWeight: '600' },

  tabs: { flexDirection: 'row', marginTop: 8, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb' },
  tab: { paddingVertical: 10, paddingHorizontal: 16, backgroundColor: '#f9fafb' },
  tabActive: { backgroundColor: '#e0f2fe' },
  tabText: { fontWeight: '600', color: '#6b7280' },
  tabTextActive: { color: '#0369a1' },

  card: { marginTop: 12, padding: 12, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, backgroundColor: '#ffffff' },

  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  noteRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginVertical: 6, flexWrap: 'wrap' },

  pill: { backgroundColor: '#0ea5e9', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14 },
  pillText: { color: '#fff', fontWeight: '700' },

  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 10, flex: 1, minWidth: 160 },

  logHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  logRow: { flexDirection: 'row', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  logTime: { width: 60, fontVariant: ['tabular-nums'], fontWeight: '700', color: '#334155' },
  logText: { fontSize: 15 },
  logMeta: { fontSize: 12, color: '#6b7280' },

  badge: { fontWeight: '900', color: '#111827' },

  modalWrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '88%', backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  // compact bottom-sheet styles for airway kit
  bottomModalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: '#fff', borderTopLeftRadius: 12, borderTopRightRadius: 12, padding: 12, maxHeight: '55%' },
  smallTitle: { fontSize: 16, fontWeight: '800' },
  smallText: { fontSize: 13, color: '#374151', marginBottom: 6 },
  smallButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#0ea5e9' },
  smallButtonText: { color: 'white', fontWeight: '700' },
  grid: { marginTop: 6 },
  gridRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
  gridItem: { width: '48%', backgroundColor: '#f8fafc', paddingVertical: 8, paddingHorizontal: 8, borderRadius: 8, marginBottom: 6 },
  gridItemText: { color: '#111827', fontWeight: '600', fontSize: 13 },
});
