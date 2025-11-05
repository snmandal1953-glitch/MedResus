import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, Pressable, StyleSheet } from 'react-native';

type RhythmAnalysisModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onSave: (data: {
    rhythm: string;
    analysis: string;
    plan: string;
    timestamp: number;
  }) => void;
};

export function RhythmAnalysisModal({ isVisible, onClose, onSave }: RhythmAnalysisModalProps) {
  const [rhythm, setRhythm] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [plan, setPlan] = useState('');

  const handleSave = () => {
    onSave({
      rhythm,
      analysis,
      plan,
      timestamp: Date.now()
    });
    setRhythm('');
    setAnalysis('');
    setPlan('');
  };

  const rhythms = ['VF', 'VT', 'PEA', 'Asystole', 'Other'];

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Team Leader's Rhythm Analysis</Text>
          
          <Text style={styles.label}>Rhythm identified</Text>
          <View style={styles.rhythmGrid}>
            {rhythms.map(r => (
              <Pressable
                key={r}
                onPress={() => setRhythm(r)}
                style={({pressed}) => [
                  styles.rhythmButton,
                  rhythm === r && styles.rhythmButtonSelected,
                  pressed && styles.pressed
                ]}
              >
                <Text style={[
                  styles.rhythmButtonText,
                  rhythm === r && styles.rhythmButtonTextSelected
                ]}>{r}</Text>
              </Pressable>
            ))}
          </View>

          {rhythm === 'Other' && (
            <TextInput
              value={rhythm}
              onChangeText={setRhythm}
              placeholder="Specify rhythm..."
              style={[styles.input, { marginTop: 8 }]}
            />
          )}

          <Text style={styles.label}>Analysis & findings</Text>
          <TextInput
            value={analysis}
            onChangeText={setAnalysis}
            placeholder="Document your interpretation..."
            style={[styles.input, styles.textArea]}
            multiline
          />

          <Text style={styles.label}>Immediate plan</Text>
          <TextInput
            value={plan}
            onChangeText={setPlan}
            placeholder="Next steps..."
            style={styles.input}
          />

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.saveButton, (!rhythm || !analysis) && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!rhythm || !analysis}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 500
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center'
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6
  },
  rhythmGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8
  },
  rhythmButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8
  },
  rhythmButtonSelected: {
    backgroundColor: '#0ea5e9'
  },
  rhythmButtonText: {
    color: '#374151',
    fontWeight: '600'
  },
  rhythmButtonTextSelected: {
    color: 'white'
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 14
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top'
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8
  },
  cancelButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6'
  },
  saveButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#0ea5e9'
  },
  saveButtonDisabled: {
    backgroundColor: '#93c5fd'
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600'
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600'
  },
  pressed: {
    opacity: 0.7
  }
});