import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, Linking, ActivityIndicator } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { COLORS, icons, illustrations } from '../constants';
import Header from '../components/Header';
import { PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlertModal from '../components/CustomAlertModal';

type Nav = {
  navigate: (value: string) => void
}

const TopupMobileMoney = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const { navigate } = useNavigation<Nav>();
  const [mobile, setMobile] = useState('');
  const [amount, setAmount] = useState('');
  const [remarks, setRemarks] = useState('');
  const { colors, dark } = useTheme();
  const [user, setUser] = useState<{
    account_number?: string;
    First_name?: string;
    Last_name?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [insufficientBalanceAlert, setInsufficientBalanceAlert] = useState(false);
  const [balanceCheckLoading, setBalanceCheckLoading] = useState(false);
  const [mobileBalance, setMobileBalance] = useState<number | null>(null);
  const [showUssdCompleteModal, setShowUssdCompleteModal] = useState(false);
  const [showInvalidUssdModal, setShowInvalidUssdModal] = useState(false);

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Session expired. Please log in again.');
        navigate('Login');
        return;
      }
      
      const response = await fetch('https://theblupayapi.com/Account/dashboard/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch user profile');
      
      const data = await response.json();
      setUser({
        account_number: data.account?.account_number,
        First_name: data.kyc?.First_name,
        Last_name: data.kyc?.Last_name,
      });
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const checkMobileMoneyBalance = async (phoneNumber: string) => {
    try {
      setBalanceCheckLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        Alert.alert('Error', 'Session expired. Please log in again.');
        navigate('Login');
        return null;
      }

      // This would be your balance check API endpoint
      const response = await fetch('https://theblupayapi.com/mobile-money/balance/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: phoneNumber,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const balance = data.balance || 0;
        setMobileBalance(balance);
        return balance;
      } else {
        console.log('Balance check failed, proceeding without balance validation');
        setMobileBalance(null);
        return null; // Return null if balance check fails, proceed anyway
      }
    } catch (error) {
      console.log('Balance check error:', error);
      setMobileBalance(null);
      return null; // Return null if balance check fails, proceed anyway
    } finally {
      setBalanceCheckLoading(false);
    }
  };

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

  const handleTopup = async () => {
    // Validate inputs
    if (!amount || !mobile) {
      Alert.alert('Error', 'Please enter both amount and mobile number.');
      return;
    }

    // Validate amount is a positive number
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount greater than 0.');
      return;
    }

    // Validate mobile number format (basic validation)
    const mobileRegex = /^[0-9]{10,15}$/;
    if (!mobileRegex.test(mobile.replace(/\s/g, ''))) {
      Alert.alert('Error', 'Please enter a valid mobile number.');
      return;
    }

    if (!user?.account_number) {
      Alert.alert('Error', 'Account number not available. Please try again.');
      return;
    }

    // Check mobile money balance
    const mobileBalance = await checkMobileMoneyBalance(mobile);
    
    if (mobileBalance !== null && mobileBalance < amountNum) {
      setInsufficientBalanceAlert(true);
      return;
    }

    // Navigate to review summary screen (not TopupSuccessful)
    navigation.navigate('TopupReviewSummary', {
        amount: amount,
        mobileNumber: mobile,
        accountNumber: user.account_number,
        accountName: user.First_name && user.Last_name ? `${user.First_name} ${user.Last_name}` : undefined,
        remarks: remarks,
        provider: 'Mobile Money'
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="MobileMoney Topup" />
      {/* <View style={{ alignItems: 'center', marginTop: 32 }}>
        <Image
          source={dark ? illustrations.bankSuccessDark : illustrations.bankSuccess}
          style={{ width: 180, height: 180 }}
          resizeMode="contain"
        />
      </View> */}
      <View style={[styles.card, { backgroundColor: dark ? COLORS.dark2 : COLORS.white }]}>
        <Text style={[styles.label, { color: colors.primary }]}>Account Number</Text>
        <View style={[styles.inputRow, { backgroundColor: dark ? COLORS.dark2 : COLORS.secondaryWhite, borderColor: dark ? COLORS.grayscale700 : COLORS.gray2, borderWidth: 1 }]}>
          <View style={styles.inputIconBox}>
            <Image source={require('../assets/icons/credit-card.png')} style={styles.icon} />
          </View>
    {showUssdCompleteModal && (
      <CustomAlertModal
        visible={showUssdCompleteModal}
        title="USSD Topup Complete"
        message="You have successfully submitted a valid USSD PIN. Tap 'Continue' to proceed."
        onConfirm={() => {
          setShowUssdCompleteModal(false);
          navigation.navigate('TopupReviewSummary', {
            // ...existing code...
          });
        }}
        confirmText="Continue"
      />
    )}

    {showInvalidUssdModal && (
      <CustomAlertModal
        visible={showInvalidUssdModal}
        title="Invalid USSD PIN"
        message="The USSD PIN you entered is invalid. Please try again."
        onConfirm={() => setShowInvalidUssdModal(false)}
        confirmText="OK"
      />
    )}
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: 'transparent' }]}
            placeholder="Loading account number..."
            placeholderTextColor="#888"
            value={user?.account_number || ''}
            editable={false}
          />
        </View>

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

        <TouchableOpacity 
          style={[styles.proceedBtn, { backgroundColor: colors.primary }]}
          onPress={handleTopup}
          disabled={balanceCheckLoading}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            {balanceCheckLoading && (
              <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
            )}
                      <Text style={styles.proceedText}>
            {balanceCheckLoading ? 'Checking Balance...' : 'Review & Proceed'}
          </Text>
          </View>
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

      {/* Insufficient Balance Alert */}
      <CustomAlertModal
        visible={insufficientBalanceAlert}
        onClose={() => setInsufficientBalanceAlert(false)}
        title="Insufficient Balance"
        message={`Your mobile money balance (${mobileBalance || 0}) is less than the requested amount (${amount}). Please top up your mobile money account or reduce the amount.`}
        type="warning"
        customIcon="alert-triangle"
        buttonText="OK"
        onButtonPress={() => setInsufficientBalanceAlert(false)}
        buttonStyle="primary"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: {
    borderRadius: 20,
    padding: 20,
    marginTop: 40,
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

export default TopupMobileMoney;