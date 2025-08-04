import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { COLORS, SIZES } from '../constants';

interface VerificationMethodProps {
  icon: any;
  name: string;
  isSelected: boolean;
  onSelect: () => void;
}

const VerificationMethod: React.FC<VerificationMethodProps> = ({ icon, name, isSelected, onSelect }) => {
  const { dark } = useTheme();

  return (
    <TouchableOpacity style={[styles.container, {
      borderColor: dark ? COLORS.dark2 : COLORS.grayscale200,
      backgroundColor: dark ? COLORS.dark2 : COLORS.white
    }]} onPress={onSelect}>
      <View style={styles.leftContent}>
        <View style={styles.iconContainer}>
          <Image source={icon} style={styles.icon} />
        </View>
        <Text style={[styles.name, {
          color: dark ? COLORS.white : COLORS.greyscale900
        }]}>{name}</Text>
      </View>
      <View style={styles.radioContainer}>
        <View style={[styles.radio, isSelected && styles.radioSelected]}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 72,
    width: '100%',
    borderRadius: 20,
    borderColor: COLORS.grayscale200,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: COLORS.primary
  },
  name: {
    fontSize: 16,
    fontFamily: "Urbanist SemiBold",
    color: COLORS.greyscale900
  },
  radioContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 24,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  radioSelected: {
    backgroundColor: COLORS.primary,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
  },
});

export default VerificationMethod;