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
  const [pinStrength, setPinStrength] = useState<'weak' | 'medium' | 'strong' | ''>('');

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

  // Function to calculate PIN strength
  const calculatePinStrength = (pinValue: string): 'weak' | 'medium' | 'strong' | '' => {
    if (!pinValue || pinValue.length < 4) return '';
    
    // Common PINs are weak
    if (commonPINs.includes(pinValue)) return 'weak';
    
    // Check if all digits are the same (e.g., 1111)
    if (new Set(pinValue.split('')).size === 1) return 'weak';
    
    // Check if it's a simple sequence (e.g., 1234, 4321)
    const isSimpleSequence = 
      (pinValue === '1234') || 
      (pinValue === '4321');
    
    if (isSimpleSequence) return 'weak';
    
    // Check if PIN has 2 different digits repeating (e.g., 1212, 5656)
    if (pinValue[0] === pinValue[2] && pinValue[1] === pinValue[3]) return 'medium';
    
    // If no weak patterns are found, it's strong
    return 'strong';
  };

  // Handle PIN input and calculate strength
  const handlePinChange = (value: string) => {
    setPin(value);
    if (value.length === 4) {
      setPinStrength(calculatePinStrength(value));
    } else {
      setPinStrength('');
    }
  };
  
  // Remove setPin from handlePinFilled to avoid double state update
  const handlePinFilled = async (text: string) => {
    // Optionally, you can auto-submit or enable a button here, but do NOT call setPin
  };

  // Common PINs that should be avoided for security
  const commonPINs = ['0000', '1111', '1234', '2222', '3333', '4321', '4444', '5555', '6666', '7777', '8888', '9999'];
  
  const handleContinue = async () => {
    if (pin.length !== 4) {
      showCustomAlert('Error', 'Please enter a 4-digit PIN.');
      return;
    }

    // Check if PIN is common or easily guessable
    if (commonPINs.includes(pin)) {
      showCustomAlert('Security Warning', 'The PIN you entered is too common and easily guessable. Please choose a more secure PIN.');
      return;
    }

    // Check for sequential digits (like 1234, 5678)
    const isSequential = (pin: string) => {
      for (let i = 0; i < pin.length - 1; i++) {
        if (Number(pin[i+1]) - Number(pin[i]) !== 1) {
          return false;
        }
      }
      return true;
    };

    // Check for repeated digits (like 1111, 2222)
    const isRepeated = (pin: string) => {
      const firstDigit = pin[0];
      for (let i = 1; i < pin.length; i++) {
        if (pin[i] !== firstDigit) {
          return false;
        }
      }
      return true;
    };

    if (isSequential(pin) || isRepeated(pin)) {
      showCustomAlert('Security Warning', 'Please choose a more secure PIN. Avoid sequential (like 1234) or repeated (like 1111) numbers.');
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
          } else if (msg.includes('common') || msg.includes('easy') || msg.includes('simple') || msg.includes('weak')) {
            pinErrorMsg = 'The PIN you entered is too common and easily guessable. Please choose a more secure PIN.';
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
      // Try to determine if the error is related to a common PIN
      let errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      if (errorMessage.toLowerCase().includes('server error')) {
        // Check if the PIN is common based on our local list
        if (commonPINs.includes(pin)) {
          errorMessage = 'The PIN you entered is too common and easily guessable. Please choose a more secure PIN.';
        } else {
          errorMessage = 'Unable to create PIN. Please try a different PIN or try again later.';
        }
      }
      
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
        
        <Text style={[styles.securityHint, {
          color: dark ? COLORS.grayscale700 : COLORS.greyscale900
        }]}>Choose a unique 4-digit PIN that's not easily guessable. Avoid common PINs like 1234, 0000, or birth years.</Text>
        
        <OtpInput
          numberOfDigits={4}
          onTextChange={handlePinChange}
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
        
        {pin.length === 4 && (
          <View style={styles.strengthIndicator}>
            <Text style={[styles.strengthText, { 
              color: pinStrength === 'weak' 
                ? COLORS.error 
                : pinStrength === 'medium' 
                  ? COLORS.warning 
                  : COLORS.success 
            }]}>
              {pinStrength === 'weak' 
                ? 'Weak PIN: Too common or easily guessed' 
                : pinStrength === 'medium' 
                  ? 'Medium PIN: Acceptable but could be better' 
                  : 'Strong PIN: Good choice!'}
            </Text>
            <View style={styles.strengthBars}>
              <View style={[styles.strengthBar, { 
                backgroundColor: pinStrength ? COLORS.error : COLORS.grayscale400 
              }]} />
              <View style={[styles.strengthBar, { 
                backgroundColor: pinStrength === 'medium' || pinStrength === 'strong' 
                  ? COLORS.warning 
                  : COLORS.grayscale400 
              }]} />
              <View style={[styles.strengthBar, { 
                backgroundColor: pinStrength === 'strong' 
                  ? COLORS.success 
                  : COLORS.grayscale400 
              }]} />
            </View>
          </View>
        )}
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
  },
  securityHint: {
    fontSize: 14,
    fontFamily: "Urbanist Regular",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 16
  },
  strengthIndicator: {
    alignItems: 'center',
    marginVertical: 16,
    width: '100%'
  },
  strengthText: {
    fontSize: 14,
    fontFamily: "Urbanist Medium",
    marginBottom: 8
  },
  strengthBars: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8
  },
  strengthBar: {
    height: 4,
    width: 50,
    marginHorizontal: 4,
    borderRadius: 2
  }
})

export default CreateNewPIN