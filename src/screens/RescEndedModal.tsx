import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, Pressable, StyleSheet } from 'react-native';

type RescEndedModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onSave: (data: {
    reason: string;
    cause: string;
    notes: string;
    timestamp: number;
  }) => void;
};

export function RescEndedModal({ isVisible, onClose, onSave }: RescEndedModalProps) {
  const [reason, setReason] = useState('');
  const [cause, setCause] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    onSave({
      reason,
      cause,
      notes,
      timestamp: Date.now()
    });
    setReason('');
    setCause('');
    setNotes('');
  };

  const reasons = [
    'Futility - no response to ALS',
    'Valid DNAR found',
    'Family wishes',
    'Underlying terminal condition',
    'Other'
  ];

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>End of Resuscitation</Text>
          
          <Text style={styles.label}>Reason for withdrawal of efforts</Text>
          <View style={styles.reasonGrid}>
            {reasons.map(r => (
              <Pressable
                key={r}
                onPress={() => setReason(r)}
                style={({pressed}) => [
                  styles.reasonButton,
                  reason === r && styles.reasonButtonSelected,
                  pressed && styles.pressed
                ]}
              >
                <Text style={[
                  styles.reasonButtonText,
                  reason === r && styles.reasonButtonTextSelected
                ]}>{r}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Likely cause of death (if known)</Text>
          <TextInput
            value={cause}
            onChangeText={setCause}
            placeholder="e.g., Massive MI, refractory shock..."
            style={styles.input}
            multiline
          />

          <Text style={styles.label}>Team consensus / notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Document team discussion, family interactions..."
            style={[styles.input, styles.textArea]}
            multiline
          />

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.saveButton, (!reason && !cause && !notes) && styles.saveButtonDisabled]} 
              onPress={handleSave}
              disabled={!reason && !cause && !notes}
            >
              <Text style={styles.saveButtonText}>Record & Close Case</Text>
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
  reasonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16
  },
  reasonButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8
  },
  reasonButtonSelected: {
    backgroundColor: '#0ea5e9'
  },
  reasonButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 13
  },
  reasonButtonTextSelected: {
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
  },
  pressed: {
    opacity: 0.7
  }
});