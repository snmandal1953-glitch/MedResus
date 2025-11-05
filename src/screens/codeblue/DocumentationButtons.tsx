import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

type DocButtonProps = {
  label: string;
  onPress: () => void;
  color?: string;
};

export const DocButton = ({ label, onPress, color = '#2196F3' }: DocButtonProps) => (
  <TouchableOpacity 
    style={[styles.button, { backgroundColor: color }]}
    onPress={onPress}
  >
    <Text style={styles.buttonText}>{label}</Text>
  </TouchableOpacity>
);

export const DocumentationButtons = ({
  onRoscDetails,
  onRhythmAnalysis,
  onReversibleCause,
  onEndResuscitation,
}: {
  onRoscDetails: () => void;
  onRhythmAnalysis: () => void;
  onReversibleCause: () => void;
  onEndResuscitation: () => void;
}) => (
  <View style={styles.container}>
    <View style={styles.row}>
      <DocButton 
        label="ROSC Details" 
        onPress={onRoscDetails}
        color="#4CAF50"  // Green
      />
      <DocButton 
        label="Rhythm Analysis" 
        onPress={onRhythmAnalysis}
        color="#2196F3"  // Blue
      />
    </View>
    <View style={styles.row}>
      <DocButton 
        label="Reversible Cause" 
        onPress={onReversibleCause}
        color="#FF9800"  // Orange
      />
      <DocButton 
        label="End Resuscitation" 
        onPress={onEndResuscitation}
        color="#f44336"  // Red
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 10,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});