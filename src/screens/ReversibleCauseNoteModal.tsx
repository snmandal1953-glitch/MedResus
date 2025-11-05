import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

type ReversibleCauseNoteModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onSave: (data: {
    cause: string;
    discussion: string;
    intervention: string;
    timestamp: number;
  }) => void;
};

export function ReversibleCauseNoteModal({ isVisible, onClose, onSave }: ReversibleCauseNoteModalProps) {
  const [cause, setCause] = useState('');
  const [discussion, setDiscussion] = useState('');
  const [action, setAction] = useState('');

  const handleSave = () => {
    onSave({
      cause,
      discussion,
      intervention: action,
      timestamp: Date.now()
    });
    setCause('');
    setDiscussion('');
    setAction('');
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Reversible Cause Discussion</Text>
          
          <Text style={styles.label}>Cause being addressed</Text>
          <TextInput
            value={cause}
            onChangeText={setCause}
            placeholder="e.g., Hypoxia, Hypovolemia..."
            style={styles.input}
          />

          <Text style={styles.label}>Team discussion</Text>
          <TextInput
            value={discussion}
            onChangeText={setDiscussion}
            placeholder="Document team's findings and reasoning..."
            style={[styles.input, styles.textArea]}
            multiline
          />

          <Text style={styles.label}>Action taken</Text>
          <TextInput
            value={action}
            onChangeText={setAction}
            placeholder="Document interventions..."
            style={styles.input}
          />

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.saveButton, (!cause || !discussion) && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!cause || !discussion}
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
  }
});