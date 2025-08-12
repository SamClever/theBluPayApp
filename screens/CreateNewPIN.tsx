import { View, Text, StyleSheet, Alert, ActivityIndicator, Modal } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { COLORS } from '../constants';
import { OtpInput } from "react-native-otp-entry";
import Button from "../components/Button";
import { useTheme } from '../theme/ThemeProvider';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../components/CustomAlert';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

type Nav = {
  navigate: (value: string) => void
}

interface AccountData {
  account_number: string;
  pin_number: string;
  red_code: string;
  account_status: string;
}

interface SuccessData {
  message: string;
  account?: AccountData;
}

const CreateNewPIN = () => {
  const navigation = useNavigation<Nav>();
  const { colors, dark } = useTheme();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  // Custom alert state variables
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [alertAction, setAlertAction] = useState<() => void>(() => {});

  // Success modal state variables
  const [alertVisible, setAlertVisible] = useState(false);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);

  // Function to show custom alert
  const showCustomAlert = (title: string, message: string, success: boolean = false, action?: () => void) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setIsSuccess(success);
    if (action) {
      setAlertAction(() => action);
    } else {
      setAlertAction(() => () => setShowAlert(false));
    }
    setShowAlert(true);
  };

  // Function to handle success modal dismissal
  const handleSuccessContinue = () => {
    setAlertVisible(false);
    navigation.navigate('Login');
  };

  // Remove setPin from handlePinFilled to avoid double state update
  const handlePinFilled = async (text: string) => {
    // Optionally, you can auto-submit or enable a button here, but do NOT call setPin
  };

  const handleContinue = async () => {
    if (pin.length !== 4) {
      showCustomAlert('Error', 'Please enter a 4-digit PIN.');
      return;
    }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setLoading(false);
        showCustomAlert('Error', 'Authentication token not found. Please login again.');
        return;
      }
      // 1. Set PIN
      const response = await fetch('https://theblupayapi.com/Account/account/set-pin/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ pin }),
      }).catch(error => {
        throw new Error('Network request failed: ' + error.message);
      });
      if (!response) {
        throw new Error('No response received from server');
      }
      const data = await response.json().catch(() => null);
      console.log('PIN API status:', response.status);
      console.log('PIN API data:', data);

      // Handle common PIN errors with friendly messages
      if (!response.ok) {
        let pinErrorMsg = 'Failed to create PIN due to server error.';
        if (data) {
          const msg = (data.message || data.detail || data.error || '').toLowerCase();
          if (
            msg.includes('already set') ||
            msg.includes('user already exists') ||
            msg.includes('account already exists') ||
            msg.includes('email already exists') ||
            msg.includes('email is already registered')
          ) {
            pinErrorMsg = 'A user with this account already exists. Please log in or reset your PIN if you forgot it.';
          } else if (msg.includes('invalid') || msg.includes('not valid')) {
            pinErrorMsg = 'The PIN you entered is invalid. Please enter a valid 4-digit PIN.';
          } else if (msg.includes('too short') || msg.includes('at least')) {
            pinErrorMsg = 'PIN must be exactly 4 digits.';
          } else if (msg.includes('server error')) {
            pinErrorMsg = 'Server error. Please try again later.';
          } else if (msg) {
            // Use the API message if it's not generic
            pinErrorMsg = data.message || data.detail || data.error;
          }
        }
        showCustomAlert('PIN Error', pinErrorMsg);
        setLoading(false);
        return;
      }

      // ...existing code...
      if (response.ok) {
        // 2. After PIN is set, call KYC confirm API
        try {
          const confirmResponse = await fetch('https://theblupayapi.com/Account/kyc/activate/', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'User-Agent': 'AllPay-Mobile-App',
            },
          });
          if (!confirmResponse.ok) {
            const confirmError = await confirmResponse.text();
            console.log('❌ KYC Confirm API Error:', confirmError);
            showCustomAlert('Warning', 'PIN set, but KYC confirmation failed. Please contact support if your account is not activated.');
          } else {
            const confirmData = await confirmResponse.json();
            console.log('✅ KYC Confirm API Response:', confirmData);
          }
        } catch (kycError) {
          console.log('KYC Confirm API error:', kycError);
          showCustomAlert('Warning', 'PIN set, but KYC confirmation failed due to network error.');
        }
        // Fetch account details for the success modal
        try {
          const accountResponse = await fetch('https://theblupayapi.com/Account/account/details/', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (accountResponse.ok) {
            const accountData = await accountResponse.json();
            setSuccessData({
              message: 'Your account has been activated successfully! Please log in to continue using BluPay.',
              account: accountData
            });
            setAlertVisible(true);
          } else {
            setSuccessData({
              message: 'PIN created successfully! Your account is now active. Please log in to continue.',
            });
            setAlertVisible(true);
          }
        } catch (error) {
          console.log('Account details fetch error:', error);
          setSuccessData({
            message: 'PIN created successfully! Your account is now active.',
          });
          setAlertVisible(true);
        }
      } else {
        const errorMessage = data?.message || (data ? JSON.stringify(data, null, 2) : 'Failed to create PIN due to server error');
        showCustomAlert('Error', errorMessage);
      }
    } catch (error) {
      console.log('PIN API error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      showCustomAlert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}> 
      <View style={[styles.container, { backgroundColor: colors.background }]}> 
        <Header title="Create New PIN" />
        <Text style={[styles.title, {
          color: dark ? COLORS.white : COLORS.greyscale900
        }]}>Add a PIN number to make your account more secure.</Text>
        <OtpInput
          numberOfDigits={4}
          onTextChange={setPin}
          onFilled={handlePinFilled}
          autoFocus={true}
          focusColor={COLORS.primary}
          focusStickBlinkingDuration={500}
          theme={{
            pinCodeContainerStyle: {
              backgroundColor: dark ? COLORS.dark2 : COLORS.secondaryWhite,
              borderColor: dark ? COLORS.gray : COLORS.secondaryWhite,
              borderWidth: .4,
              borderRadius: 10,
              height: 58,
              width: 58
            },
            pinCodeTextStyle: {
              color: dark ? COLORS.white : COLORS.black,
            }
          }}
        />
        {loading && <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 24 }} />}
        <Button
          title="Continue"
          filled
          style={styles.button}
          onPress={handleContinue}
          disabled={loading}
        />
        {/* Custom Alert Component */}
        {showAlert && (
          <CustomAlert 
            visible={showAlert}
            type={isSuccess ? "success" : "error"}
            message={alertMessage}
            onDismiss={alertAction}
          />
        )}
        {/* Custom Success Alert Modal */}
        <Modal
          visible={alertVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setAlertVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.successAlert, { backgroundColor: colors.background }]}>
              {/* Success Icon */}
              <View style={styles.successIconContainer}>
                <MaterialCommunityIcons name="check-circle" size={64} color={COLORS.success} />
              </View>
              {/* Title */}
              <Text style={[styles.successTitle, { color: colors.text }]}>
                Account Activated!
              </Text>
              {/* Message */}
              <Text style={[styles.successMessage, { color: colors.text }]}>
                {successData?.message || 'Your account is active! We\'re reviewing your KYC now.'}
              </Text>
              {/* Account Information */}
              {successData?.account && (
                <View style={[styles.accountInfoContainer, { backgroundColor: dark ? COLORS.dark2 : COLORS.greyscale500 }]}>
                  <Text style={[styles.accountInfoTitle, { color: colors.text }]}>
                    Account Details
                  </Text>
                  <View style={styles.accountInfoRow}>
                    <Text style={[styles.accountInfoLabel, { color: colors.text }]}>Account Number:</Text>
                    <Text style={[styles.accountInfoValue, { color: COLORS.primary }]}>
                      {successData.account.account_number}
                    </Text>
                  </View>
                  <View style={styles.accountInfoRow}>
                    <Text style={[styles.accountInfoLabel, { color: colors.text }]}>PIN:</Text>
                    <Text style={[styles.accountInfoValue, { color: COLORS.primary }]}>
                      {successData.account.pin_number}
                    </Text>
                  </View>
                  <View style={styles.accountInfoRow}>
                    <Text style={[styles.accountInfoLabel, { color: colors.text }]}>Red Code:</Text>
                    <Text style={[styles.accountInfoValue, { color: COLORS.primary }]}>
                      {successData.account.red_code}
                    </Text>
                  </View>
                  <View style={styles.accountInfoRow}>
                    <Text style={[styles.accountInfoLabel, { color: colors.text }]}>Status:</Text>
                    <View style={[styles.statusBadge, { backgroundColor: COLORS.success + '20' }]}>
                      <Text style={[styles.statusText, { color: COLORS.success }]}>
                        {successData.account.account_status}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
              {/* Action Button */}
              <Button
                title="Go to Login"
                onPress={handleSuccessContinue}
                filled={true}
                style={styles.successButton}
              />
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  )
};

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: COLORS.white
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.white
  },
  title: {
    fontSize: 18,
    fontFamily: "Urbanist Medium",
    color: COLORS.greyscale900,
    textAlign: "center",
    marginVertical: 64
  },
  OTPStyle: {
    borderRadius: 8,
    height: 58,
    width: 58,
    backgroundColor: COLORS.secondaryWhite,
    borderBottomColor: "gray",
    borderBottomWidth: .4,
    borderWidth: .4,
    borderColor: "gray"
  },
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
    justifyContent: "center"
  },
  code: {
    fontSize: 18,
    fontFamily: "Urbanist Medium",
    color: COLORS.greyscale900,
    textAlign: "center"
  },
  time: {
    fontFamily: "Urbanist Medium",
    fontSize: 18,
    color: COLORS.primary
  },
  button: {
    borderRadius: 32,
    marginVertical: 72
  },
  center: {
    flex: 1,
    justifyContent: "center",
    marginBottom: 144
  },
  // Success Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20
  },
  successAlert: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  successIconContainer: {
    marginBottom: 16
  },
  successTitle: {
    fontSize: 24,
    fontFamily: 'Urbanist Bold',
    textAlign: 'center',
    marginBottom: 12
  },
  successMessage: {
    fontSize: 16,
    fontFamily: 'Urbanist Regular',
    textAlign: 'center',
    marginBottom: 24
  },
  accountInfoContainer: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24
  },
  accountInfoTitle: {
    fontSize: 16,
    fontFamily: 'Urbanist SemiBold',
    marginBottom: 12
  },
  accountInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  accountInfoLabel: {
    fontSize: 14,
    fontFamily: 'Urbanist Regular'
  },
  accountInfoValue: {
    fontSize: 14,
    fontFamily: 'Urbanist Medium',
    color: COLORS.primary
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 16
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Urbanist Medium',
  },
  successButton: {
    width: '100%',
    borderRadius: 32,
  }
})

export default CreateNewPIN