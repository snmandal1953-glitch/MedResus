import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { RoleId } from '../data/roleTypes';

interface RoleModalProps {
  visible: boolean;
  onClose: () => void;
  onAssign: (roleId: RoleId, name: string, action?: string) => void;
  currentRoles: Record<RoleId, string>;
}

export function RoleAssignmentModal({ visible, onClose, onAssign, currentRoles }: RoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<RoleId | null>(null);
  const [name, setName] = useState('');
  const [action, setAction] = useState('');

  const handleAssign = () => {
    if (selectedRole && name.trim()) {
      onAssign(selectedRole, name.trim(), action.trim() || undefined);
      setSelectedRole(null);
      setName('');
      setAction('');
      onClose();
    }
  };

  const roles: { id: RoleId; label: string }[] = [
    { id: 'lead', label: 'Team Lead' },
    { id: 'airway', label: 'Airway' },
    { id: 'compressor1', label: 'Compressor 1' },
    { id: 'compressor2', label: 'Compressor 2' },
    { id: 'drugs', label: 'Drugs' },
    { id: 'ivio', label: 'IV/IO Access' },
    { id: 'defib', label: 'Defibrillator' },
    { id: 'recorder', label: 'Recorder' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Assign Team Role</Text>
          
          <ScrollView style={styles.rolesScroll}>
            <Text style={styles.label}>Select Role:</Text>
            <View style={styles.roleGrid}>
              {roles.map(role => (
                <TouchableOpacity
                  key={role.id}
                  style={[
                    styles.roleButton,
                    selectedRole === role.id && styles.selectedRole,
                    currentRoles[role.id] ? styles.assignedRole : null
                  ]}
                  onPress={() => setSelectedRole(role.id)}
                >
                  <Text style={[
                    styles.roleText,
                    selectedRole === role.id && styles.selectedRoleText
                  ]}>
                    {role.label}
                    {currentRoles[role.id] ? `\n(${currentRoles[role.id]})` : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Team Member Name:</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Dr. Smith"
              placeholderTextColor="#666"
            />

            <Text style={styles.label}>Current Action (optional):</Text>
            <TextInput
              style={[styles.input, styles.actionInput]}
              value={action}
              onChangeText={setAction}
              placeholder="e.g., Started chest compressions"
              placeholderTextColor="#666"
              multiline
            />
          </ScrollView>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.assignButton, (!selectedRole || !name.trim()) && styles.buttonDisabled]}
              onPress={handleAssign}
              disabled={!selectedRole || !name.trim()}
            >
              <Text style={styles.buttonText}>Assign Role</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  rolesScroll: {
    maxHeight: '80%',
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginTop: 12,
    marginBottom: 8,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  roleButton: {
    backgroundColor: '#2d2d2d',
    padding: 12,
    borderRadius: 8,
    width: '48%',
    marginBottom: 8,
  },
  selectedRole: {
    backgroundColor: '#0369a1',
  },
  assignedRole: {
    borderColor: '#666',
    borderWidth: 1,
  },
  roleText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  selectedRoleText: {
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#2d2d2d',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
  },
  actionInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  assignButton: {
    backgroundColor: '#0369a1',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});