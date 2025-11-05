import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

type RoscDetailsModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onSave: (data: {
    cause: string;
    team: string;
    notes: string;
    timestamp: number;
  }) => void;
};

export function RoscDetailsModal({ isVisible, onClose, onSave }: RoscDetailsModalProps) {
  const [cause, setCause] = useState('');
  const [team, setTeam] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    onSave({
      cause,
      team,
      notes,
      timestamp: Date.now()
    });
    setCause('');
    setTeam('');
    setNotes('');
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>ROSC Achieved</Text>
          
          <Text style={styles.label}>Suspected cause of arrest</Text>
          <TextInput
            value={cause}
            onChangeText={setCause}
            placeholder="e.g., VF arrest - likely ACS"
            style={styles.input}
          />

          <Text style={styles.label}>Identified by team</Text>
          <TextInput
            value={team}
            onChangeText={setTeam}
            placeholder="e.g., ED Team A"
            style={styles.input}
          />

          <Text style={styles.label}>Notes & next steps</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Document findings, immediate post-ROSC care plan..."
            style={[styles.input, styles.textArea]}
            multiline
          />

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Continue</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.saveButton, (!cause && !team && !notes) && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!cause && !team && !notes}
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
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 14
  },
  textArea: {
    height: 100,
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
  }
});