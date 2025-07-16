import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { COLORS } from '../constants';
import { OtpInput } from "react-native-otp-entry";
import Button from "../components/Button";
import { useTheme } from '../theme/ThemeProvider';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Nav = {
  navigate: (value: string) => void
}

const CreateNewPIN = () => {
  const { navigate } = useNavigation<Nav>();
  const { colors, dark } = useTheme();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  // Remove setPin from handlePinFilled to avoid double state update
  const handlePinFilled = async (text: string) => {
    // Optionally, you can auto-submit or enable a button here, but do NOT call setPin
    // Example: if (text.length === 4) handleContinue();
  };

  const handleContinue = async () => {
    if (pin.length !== 4) {
      Alert.alert('Error', 'Please enter a 4-digit PIN.');
      return;
    }
    setLoading(true);
    try {
      // Try both 'token' and 'userToken' for compatibility
      let token = await AsyncStorage.getItem('userToken');
      if (!token) {
        token = await AsyncStorage.getItem('token');
      }
      if (!token) {
        setLoading(false);
        Alert.alert('Error', 'Authentication token not found. Please login again.');
        return;
      }
      const response = await fetch('https://theblupayapi.com/Account/account/set-pin/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ pin }),
      });
      const data = await response.json();
      console.log('PIN API status:', response.status);
      console.log('PIN API data:', data);
      if (response.ok) {
        Alert.alert('Success', 'PIN created successfully!', [
          { text: 'OK', onPress: () => navigate('Fingerprint') }
        ]);
      } else {
        // Show full error details for debugging
        Alert.alert('Error', data?.message || JSON.stringify(data, null, 2) || 'Failed to create PIN.');
      }
    } catch (error) {
      console.log('PIN API error:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
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