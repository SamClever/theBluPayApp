import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { COLORS, icons, illustrations } from '../constants';
import Header from '../components/Header';
import { PermissionsAndroid, Platform } from 'react-native';

const MobileMoneyTransfer = () => {
  const navigation = useNavigation();
  const [mobile, setMobile] = useState('');
  const [amount, setAmount] = useState('');
  const [remarks, setRemarks] = useState('');
  const { colors, dark } = useTheme();

  const openContacts = async () => {
    if (Platform.OS === 'android') {
      const permission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: 'Contacts',
          message: 'This app would like to view your contacts.',
          buttonPositive: 'OK'
        }
      );
      if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert(
          'Permission Required',
          'Please allow contact access in your device settings to use this feature.',
          [
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
        return;
      }
    }
    // Contacts.getAll() call removed. If you want to use contacts, implement here with another package.
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="MobileMoneyTransfer" />
      <View style={{ alignItems: 'center', marginTop: 32 }}>
        <Image
          source={dark ? illustrations.bankSuccessDark : illustrations.bankSuccess}
          style={{ width: 180, height: 180 }}
          resizeMode="contain"
        />
      </View>
      <View style={[styles.card, { backgroundColor: dark ? COLORS.dark2 : COLORS.white }]}>
        <Text style={[styles.label, { color: colors.primary }]}>Mobile Number</Text>
        <View style={[styles.inputRow, { backgroundColor: dark ? COLORS.dark2 : COLORS.secondaryWhite, borderColor: dark ? COLORS.grayscale700 : COLORS.gray2, borderWidth: 1 }]}>
          <View style={styles.inputIconBox}>
            <Image source={require('../assets/icons/call.png')} style={styles.icon} />
          </View>
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: 'transparent' }]}
            placeholder="Mobile Number"
            placeholderTextColor="#888"
            keyboardType="phone-pad"
            value={mobile}
            onChangeText={setMobile}
          />
        </View>

        <Text style={[styles.label, { color: colors.primary }]}>Amount</Text>
        <View style={[styles.inputRow, { backgroundColor: dark ? COLORS.dark2 : COLORS.secondaryWhite, borderColor: dark ? COLORS.grayscale700 : COLORS.gray2, borderWidth: 1 }]}>
          <View style={styles.inputIconBox}>
            <Image source={require('../assets/icons/money.png')} style={styles.icon} />
          </View>
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: 'transparent' }]}
            placeholder="Amount"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        <Text style={[styles.label, { color: colors.primary }]}>
          Remarks <Text style={styles.optional}>(optional)</Text>
        </Text>
        <View style={[styles.inputRow, { backgroundColor: dark ? COLORS.dark2 : COLORS.secondaryWhite, borderColor: dark ? COLORS.grayscale700 : COLORS.gray2, borderWidth: 1 }]}>
          <View style={styles.inputIconBox}>
            <Image source={require('../assets/icons/edit_pencil.png')} style={styles.icon} />
          </View>
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: 'transparent' }]}
            placeholder="Remarks (optional)"
            placeholderTextColor="#888"
            value={remarks}
            onChangeText={setRemarks}
          />
        </View>

        <TouchableOpacity style={[styles.proceedBtn, { backgroundColor: colors.primary }]}>
          <Text style={styles.proceedText}>Proceed</Text>
        </TouchableOpacity>
      </View>
      <View style={{
        backgroundColor: dark ? COLORS.dark2 : COLORS.secondaryWhite,
        borderRadius: 12,
        padding: 12,
        marginTop: 9,
        alignItems: 'center'
      }}>
        <Text style={{ color: colors.text, fontSize: 13 }}>
          Tip: Make sure the mobile number is registered for mobile money.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: {
    borderRadius: 20,
    padding: 20,
    marginTop: -10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
  },
  optional: { color: COLORS.gray, fontWeight: 'normal', fontSize: 14 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    // borderColor and borderWidth are set inline for theme
  },
  inputIconBox: {
    width: 32, height: 32, justifyContent: 'center', alignItems: 'center',
  },
  icon: { width: 20, height: 20, tintColor: COLORS.primary },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    // backgroundColor is set inline for theme
  },
  contactsBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginLeft: 8,
  },
  contactsText: { color: COLORS.white, fontWeight: 'bold' },
  proceedBtn: {
    borderRadius: 16,
    marginTop: 24,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  proceedText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
});

export default MobileMoneyTransfer; 