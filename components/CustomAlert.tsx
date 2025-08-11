import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';

const CustomAlert = ({ visible, type, message, onDismiss }: { visible: boolean, type: 'success' | 'error', message: string, onDismiss: () => void }) => {
  if (!visible) return null;
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onDismiss}>
        <View style={[styles.container, { backgroundColor: type === 'success' ? '#22c55e' : '#ef4444' }]}>
          <Text style={styles.text}>{message}</Text>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  container: {
    marginBottom: 40,
    padding: 18,
    borderRadius: 12,
    minWidth: 220,
    alignItems: 'center',
    elevation: 8,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CustomAlert;
