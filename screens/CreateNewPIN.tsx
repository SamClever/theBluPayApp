import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
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

type Nav = {
  navigate: (value: string) => void
}

const CreateNewPIN = () => {
  const { navigate } = useNavigation<Nav>();
  const { colors, dark } = useTheme();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Custom alert state variables
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [alertAction, setAlertAction] = useState<() => void>(() => {});

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
      
      // Add error handling for network issues
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
        showCustomAlert('Success', 'PIN created successfully!', true, () => {
          setShowAlert(false);
          navigate('Fingerprint');
        });
      } else {
        // Improved error message formatting
        const errorMessage = data?.message || 
          (data ? JSON.stringify(data, null, 2) : 'Failed to create PIN due to server error');
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
        
        {/* Custom Alert Component with better error handling */}
        {showAlert && (
          <CustomAlert 
            visible={showAlert}
            title={alertTitle}
            message={alertMessage}
            success={isSuccess}
            onClose={alertAction}
          />
        )}
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
})

export default CreateNewPIN