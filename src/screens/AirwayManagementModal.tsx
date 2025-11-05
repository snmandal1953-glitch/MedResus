import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AirwayEvent } from '../data/types';

interface AirwayManagementModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAirwayEvent: (event: Partial<AirwayEvent>) => void;
  currentRatio: "30:2" | "continuous";
  isAdvancedAirway: boolean;
}

export function AirwayManagementModal({ 
  isVisible, 
  onClose, 
  onAirwayEvent,
  currentRatio,
  isAdvancedAirway
}: AirwayManagementModalProps) {
  
  const [selectedStep, setSelectedStep] = useState<number>(0);

  const basicAirwaySteps = [
    { 
      title: 'Initial Airway Assessment',
      actions: [
        { id: 'headTilt', label: 'Head tilt / chin lift', icon: 'head', type: 'basic' },
        { id: 'inspection', label: 'Airway inspection', icon: 'flashlight', type: 'basic' },
        { id: 'suction', label: 'Suction if needed', icon: 'vacuum', type: 'basic' }
      ]
    },
    {
      title: 'Basic Airway Adjuncts',
      actions: [
        { id: 'opa', label: 'Insert OPA', icon: 'medical-bag', type: 'basic' },
        { id: 'npa', label: 'Insert NPA', icon: 'medical-bag', type: 'basic' },
        { id: 'bvm', label: 'Bag-mask ventilation', icon: 'air-filter', type: 'basic' }
      ]
    }
  ];

  const advancedAirwaySteps = [
    {
      title: 'Advanced Airway Options',
      actions: [
        { id: 'igel', label: 'i-gel placement', icon: 'medical-bag', type: 'advanced' },
        { id: 'ett', label: 'ETT intubation', icon: 'medical-bag', type: 'advanced' },
        { id: 'confirm', label: 'Check tube position', icon: 'stethoscope', type: 'advanced' }
      ]
    }
  ];

  const renderStep = (step: any, index: number) => (
    <View key={index} style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{step.title}</Text>
      <View style={styles.actionsGrid}>
        {step.actions.map((action: any, actionIdx: number) => (
          <TouchableOpacity 
            key={actionIdx}
            style={styles.actionButton}
            onPress={() => {
              onAirwayEvent({
                type: 'airway',
                technique: action.type,
                step: action.id,
                section: 'Airway',
                action: action.label,
                details: action.type === 'advanced' ? 
                  'Advanced airway initiated - changing to continuous compressions' : 
                  undefined
              });
            }}
          >
            <MaterialCommunityIcons name={action.icon} size={24} color="#fff" />
            <Text style={styles.actionText}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Airway Management</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.status}>
            Current: {currentRatio} compressions
            {isAdvancedAirway ? ' (Advanced airway placed)' : ''}
          </Text>

          <ScrollView style={styles.scrollContent}>
            {basicAirwaySteps.map(renderStep)}
            
            {/* Only show advanced options if basic steps are done */}
            {!isAdvancedAirway && (
              <View style={styles.divider}>
                <Text style={styles.dividerText}>Advanced Airway Options</Text>
                <Text style={styles.warningText}>
                  Complete basic airway steps first
                </Text>
              </View>
            )}
            {isAdvancedAirway && advancedAirwaySteps.map(renderStep)}
          </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    color: '#666',
    fontSize: 16,
  },
  status: {
    color: '#0ea5e9',
    fontSize: 14,
    marginBottom: 16,
  },
  scrollContent: {
    maxHeight: '80%',
  },
  stepContainer: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#2d2d2d',
    padding: 12,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  divider: {
    marginVertical: 16,
    padding: 12,
    backgroundColor: '#2d2d2d',
    borderRadius: 8,
  },
  dividerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  warningText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
});