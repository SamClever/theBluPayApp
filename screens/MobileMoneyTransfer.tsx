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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="MobileMoneyTransfer" />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={styles.heroContainer}>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            Send To Mobile Money
          </Text>
          <Text style={[styles.heroSubtitle, { color: dark ? COLORS.gray3 : COLORS.gray }]}>
            Secure and fast payout to your contact
          </Text>
        </View>

        <View style={[
          styles.card,
          {
            backgroundColor: dark ? COLORS.dark2 : COLORS.white,
          }
        ]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Transfer Details</Text>

          {/* Phone Input */}
          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <Image 
                source={require('../assets/icons/call.png')}
                style={styles.inputIcon} 
              />
              <TextInput
                placeholder="255779791909"
                keyboardType="phone-pad"
                value={mobile}
                onChangeText={(text) => onInputChanged('mobile', text)}
                placeholderTextColor={dark ? COLORS.gray3 : '#AAAAAA'}
                style={[styles.input, {
                  backgroundColor: dark ? 'rgba(255,255,255,0.05)' : '#F5F5F5',
                  color: dark ? COLORS.white : COLORS.black,
                }]}
              />
              <TouchableOpacity style={styles.contactButton} onPress={openContacts}>
                <Image
                  source={require('../assets/icons/user.png')}
                  style={{width: 22, height: 22, tintColor: colors.primary}}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Amount Input */}
          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <Image 
                source={require('../assets/icons/money.png')}
                style={styles.inputIcon} 
              />
              <TextInput
                placeholder="Amout"
                keyboardType="numeric"
                value={amount}
                onChangeText={(text) => onInputChanged('amount', text)}
                placeholderTextColor={dark ? COLORS.gray3 : '#AAAAAA'}
                style={[styles.input, {
                  backgroundColor: dark ? 'rgba(255,255,255,0.05)' : '#F5F5F5',
                  color: dark ? COLORS.white : COLORS.black,
                }]}
              />
            </View>
          </View>

          {/* Remarks Input */}
          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <Image 
                source={require('../assets/icons/edit_pencil.png')}
                style={styles.inputIcon} 
              />
              <TextInput
                placeholder="Remarks (optional)"
                value={remarks}
                onChangeText={(text) => onInputChanged('remarks', text)}
                placeholderTextColor={dark ? COLORS.gray3 : '#AAAAAA'}
                style={[styles.input, {
                  backgroundColor: dark ? 'rgba(255,255,255,0.05)' : '#F5F5F5',
                  color: dark ? COLORS.white : COLORS.black,
                }]}
              />
            </View>
          </View>

          {/* Preview Button */}
          <TouchableOpacity
            style={[
              styles.previewButton,
              { backgroundColor: colors.primary }
            ]}
            onPress={handleProceed}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.previewButtonText}>Preview</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.tipCard}>
          <View style={styles.tipIconContainer}>
            <Image 
              source={require('../assets/icons/info-square.png')} 
              style={{width: 22, height: 22, tintColor: '#FFFFFF'}} 
            />
          </View>
          <Text style={[styles.tipText, { color: dark ? COLORS.gray : '#555555' }]}>
            Tip: Make sure the mobile number is registered for mobile money.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    padding: 16
  },
  heroContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: 'Urbanist Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: 'Urbanist Regular',
    textAlign: 'center',
    opacity: 0.8,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Urbanist Bold',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  inputIcon: {
    width: 20,
    height: 20,
    tintColor: COLORS.gray,
    position: 'absolute',
    zIndex: 1,
    left: 16,
  },
  input: {
    flex: 1,
    height: 56,
    paddingVertical: 12,
    paddingLeft: 48,
    paddingRight: 16,
    borderRadius: 12,
    fontSize: 16,
    fontFamily: 'Urbanist Regular',
  },
  contactButton: {
    position: 'absolute',
    right: 12,
    zIndex: 1,
    backgroundColor: 'transparent',
    padding: 8,
  },
  previewButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  previewButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Urbanist Bold',
    letterSpacing: 0.5,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  tipIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Urbanist Medium',
    lineHeight: 20,
  },
});

export default MobileMoneyTransfer;