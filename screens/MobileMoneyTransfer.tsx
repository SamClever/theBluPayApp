import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, Linking, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { COLORS, icons, illustrations } from '../constants';
import Header from '../components/Header';
import { PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '../components/Button';
import Input from '../components/Input';

const MobileMoneyTransfer = () => {
  const navigation = useNavigation();
  const [mobile, setMobile] = useState('');
  const [amount, setAmount] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
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

  const handleProceed = async () => {
    if (!mobile || !amount) {
      Alert.alert('Missing Information', 'Please enter both mobile number and amount.');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Session Expired', 'Please log in again.');
        // @ts-ignore
        navigation.navigate('Login');
        return;
      }

      const resp = await fetch('https://theblupayapi.com/payout/preview/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, phone: mobile }),
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        const msg = data?.message || data?.detail || 'Unable to preview payout.';
        Alert.alert('Preview Failed', msg);
        return;
      }

      // @ts-ignore
      navigation.navigate('PayoutReviewSummary', {
        amount: data.amount || amount,
        fee: data.fee,
        total_amount: data.total_amount,
        currency: data.currency,
        channel_provider: data.channel_provider,
        payout_fee_bearer: data.payout_fee_bearer,
        account_balance: data.account_balance,
        sufficient_balance: data.sufficient_balance,
        phone: data.phone || mobile,
        estimated_completion: data.estimated_completion,
        remarks,
      });
    } catch (e: any) {
      Alert.alert('Network Error', e?.message || 'Failed to preview payout.');
    } finally {
      setLoading(false);
    }
  };

  const onInputChanged = (id: string, text: string) => {
    if (id === 'mobile') setMobile(text);
    if (id === 'amount') setAmount(text);
    if (id === 'remarks') setRemarks(text);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }] }>
      <Header title="MobileMoneyTransfer" />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center', marginTop: 16 }}>
          {/* <Image
            source={dark ? illustrations.bankSuccessDark : illustrations.bankSuccess}
            style={{ width: 180, height: 180, opacity: 0.9 }}
            resizeMode="contain"
          /> */}
          <Text style={[styles.heroTitle, { color: colors.text }]}>Send To Mobile Money</Text>
          <Text style={[styles.heroCaption, { color: dark ? COLORS.grayscale400 : COLORS.gray }]}>
            Secure and fast payout to your contact
          </Text>
        </View>

        <View style={[
          styles.card,
          {
            backgroundColor: dark ? COLORS.dark2 : COLORS.white,
            borderColor: colors.border || (dark ? COLORS.grayscale700 : COLORS.gray2)
          }
        ]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Transfer Details</Text>

          <Input
            id="mobile"
            icon={icons.call}
            placeholder="Mobile Number"
            keyboardType="phone-pad"
            value={mobile}
            onInputChanged={onInputChanged}
            placeholderTextColor={dark ? COLORS.gray3 : COLORS.gray}
            style={{
              backgroundColor: dark ? COLORS.grayscale900 : COLORS.white,
              color: dark ? COLORS.white : COLORS.grayscale900,
              borderColor: dark ? COLORS.primary : COLORS.gray3,
              borderWidth: 1.5,
              borderRadius: 12,
              paddingVertical: 14,
              paddingHorizontal: 16,
              marginBottom: 12,
              fontSize: 16,
            }}
            rightIcon={
              <Image
                source={require('../assets/icons/user.png')}
                style={{ width: 20, height: 20, tintColor: colors.primary }}
              />
            }
            onRightIconPress={openContacts}
          />

          <Input
            id="amount"
            icon={icons.money}
            placeholder="Amount"
            keyboardType="numeric"
            value={amount}
            onInputChanged={onInputChanged}
            placeholderTextColor={dark ? COLORS.gray3 : COLORS.gray}
            style={{
              backgroundColor: dark ? COLORS.grayscale900 : COLORS.white,
              color: dark ? COLORS.white : COLORS.grayscale900,
              borderColor: dark ? COLORS.primary : COLORS.gray3,
              borderWidth: 1.5,
              borderRadius: 12,
              paddingVertical: 14,
              paddingHorizontal: 16,
              marginBottom: 12,
              fontSize: 16,
            }}
          />

          <Input
            id="remarks"
            icon={icons.editPencil}
            placeholder="Remarks (optional)"
            value={remarks}
            onInputChanged={onInputChanged}
            placeholderTextColor={dark ? COLORS.gray3 : COLORS.gray}
            style={{
              backgroundColor: dark ? COLORS.grayscale900 : COLORS.white,
              color: dark ? COLORS.white : COLORS.grayscale900,
              borderColor: dark ? COLORS.primary : COLORS.gray3,
              borderWidth: 1.5,
              borderRadius: 12,
              paddingVertical: 14,
              paddingHorizontal: 16,
              marginBottom: 4,
              fontSize: 16,
            }}
          />

          <Button
            title="Preview"
            filled
            isLoading={loading}
            onPress={handleProceed}
            style={{ marginTop: 12, backgroundColor: colors.primary }}
            textStyle={{ color: colors.buttonText }}
          />
        </View>

        <View style={[
          styles.tipCard,
          { backgroundColor: dark ? COLORS.dark2 : COLORS.secondaryWhite }
        ]}>
          <Image source={require('../assets/icons/info-square.png')} style={{ width: 18, height: 18, tintColor: colors.primary }} />
          <Text style={{ color: colors.text, fontSize: 13, marginLeft: 8 }}>
            Tip: Make sure the mobile number is registered for mobile money.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: {
    borderRadius: 20,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  heroTitle: {
    marginTop: 8,
    fontSize: 20,
    fontFamily: 'Urbanist Bold',
  },
  heroCaption: {
    fontSize: 13,
    fontFamily: 'Urbanist Regular',
    marginTop: 2,
  },
  tipCard: {
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    alignItems: 'center',
    flexDirection: 'row',
  },
});

export default MobileMoneyTransfer;