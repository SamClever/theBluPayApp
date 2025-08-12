<<<<<<< HEAD
import { View, Text, StyleSheet, ActivityIndicator, Modal } from 'react-native';
=======
import { View, Text, StyleSheet, Alert, ActivityIndicator, Modal } from 'react-native';
>>>>>>> 47a2ff4a (move activete account to create new pin)
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { COLORS } from '../constants';
import { OtpInput } from "react-native-otp-entry";
import Button from "../components/Button";
import { useTheme } from '../theme/ThemeProvider';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../components/CustomAlert'; // Import custom alert component
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
<<<<<<< HEAD
  
  // Custom alert state variables
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [alertAction, setAlertAction] = useState<() => void>(() => {});
  
  // Success modal state variables
  const [alertVisible, setAlertVisible] = useState(false);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);

  // Function to show custom alert - improved implementation
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
=======
  const [successModal, setSuccessModal] = useState(false);
>>>>>>> 47a2ff4a (move activete account to create new pin)

  // Remove setPin from handlePinFilled to avoid double state update
  const handlePinFilled = async (text: string) => {
    // Optionally, you can auto-submit or enable a button here, but do NOT call setPin
    // Example: if (text.length === 4) handleContinue();
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
<<<<<<< HEAD
      
      // Add error handling for network issues
=======
      // 1. Set PIN
>>>>>>> 47a2ff4a (move activete account to create new pin)
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
      
      if (response.ok) {
<<<<<<< HEAD
        // Instead of showing custom alert, show success modal with account details
        try {
          // Fetch account details
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
            // If can't get account details, still show success but without account details
            setSuccessData({
              message: 'PIN created successfully! Your account is now active. Please log in to continue.',
            });
            setAlertVisible(true);
          }
        } catch (error) {
          console.log('Account details fetch error:', error);
          // Still show success even if we couldn't get account details
          setSuccessData({
            message: 'PIN created successfully! Your account is now active.',
          });
          setAlertVisible(true);
        }
      } else {
        // Improved error message formatting
        const errorMessage = data?.message || 
          (data ? JSON.stringify(data, null, 2) : 'Failed to create PIN due to server error');
        showCustomAlert('Error', errorMessage);
=======
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
            // Optionally show a warning, but still show PIN success modal
            Alert.alert('Warning', 'PIN set, but KYC confirmation failed. Please contact support if your account is not activated.');
          } else {
            const confirmData = await confirmResponse.json();
            console.log('✅ KYC Confirm API Response:', confirmData);
          }
        } catch (kycError) {
          console.log('KYC Confirm API error:', kycError);
          Alert.alert('Warning', 'PIN set, but KYC confirmation failed due to network error.');
        }
        setSuccessModal(true);
      } else {
        Alert.alert('Error', data?.message || JSON.stringify(data, null, 2) || 'Failed to create PIN.');
>>>>>>> 47a2ff4a (move activete account to create new pin)
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
<<<<<<< HEAD
        
        {/* Custom Alert Component with better error handling */}
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
=======
        {/* Success Modal */}
        <Modal
          visible={successModal}
          transparent
          animationType="fade"
          onRequestClose={() => setSuccessModal(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: colors.background, borderRadius: 16, padding: 32, alignItems: 'center', width: 320 }}>
              <Text style={{ fontSize: 24, fontFamily: 'Urbanist Bold', color: COLORS.success, marginBottom: 16 }}>PIN Created!</Text>
              <Text style={{ fontSize: 16, fontFamily: 'Urbanist Regular', color: colors.text, textAlign: 'center', marginBottom: 24 }}>Your PIN was set successfully. You can now use it to secure your account.</Text>
              <Button
                title="Go to Login"
                filled
                style={{ width: '100%' }}
                onPress={() => {
                  setSuccessModal(false);
                  navigate('Login');
                }}
>>>>>>> 47a2ff4a (move activete account to create new pin)
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