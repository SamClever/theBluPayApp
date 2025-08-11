import { View, Text, StyleSheet, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { COLORS } from '../constants';
import { OtpInput } from "react-native-otp-entry";
import Button from "../components/Button";
import { useTheme } from '../theme/ThemeProvider';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlertModal from '../components/CustomAlertModal';

const ChangePIN = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const { colors, dark } = useTheme();

  const [currentPin, setCurrentPin] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info' | 'custom'>('custom');
  const [alertTitle, setAlertTitle] = useState<string>('');
  const [alertMessage, setAlertMessage] = useState<string>('');
  const canSubmit = currentPin.length === 4 && newPin.length === 4 && currentPin !== newPin;

  const handleSubmit = async () => {
    if (currentPin.length !== 4 || newPin.length !== 4) {
      setAlertType('warning');
      setAlertTitle('Invalid PIN');
      setAlertMessage('Please enter 4 digits for both current and new PIN.');
      setAlertVisible(true);
      return;
    }
    if (currentPin === newPin) {
      setAlertType('warning');
      setAlertTitle('Use a different PIN');
      setAlertMessage('Your new PIN must be different from your current PIN.');
      setAlertVisible(true);
      return;
    }

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setAlertType('error');
        setAlertTitle('Authentication');
        setAlertMessage('Session expired. Please log in again.');
        setAlertVisible(true);
        setIsLoading(false);
        navigation.navigate('Login' as never);
        return;
      }

      const response = await fetch('https://theblupayapi.com/Account/account/change-pin/', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_pin: currentPin,
          new_pin: newPin,
          confirm_pin: newPin,
        }),
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch {}

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          await AsyncStorage.removeItem('token');
          setAlertType('error');
          setAlertTitle('Authentication');
          setAlertMessage('Session expired. Please log in again.');
          setAlertVisible(true);
          setIsLoading(false);
          navigation.navigate('Login' as never);
          return;
        }
        const errorMsg = (data && (data.detail || data.message)) || 'Failed to change PIN. Please try again.';
        setAlertType('error');
        setAlertTitle('Change PIN Failed');
        setAlertMessage(errorMsg);
        setAlertVisible(true);
        setIsLoading(false);
        return;
      }

      setAlertType('success');
      setAlertTitle('PIN Changed');
      setAlertMessage('Your PIN has been updated successfully.');
      setAlertVisible(true);
    } catch (e: any) {
      setAlertType('error');
      setAlertTitle('Network Error');
      setAlertMessage('Unable to process your request. Check your connection and try again.');
      setAlertVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}> 
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Change PIN" />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.title, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>Change your PIN number to make your account more secure.</Text>

          <View style={[
            styles.card,
            { backgroundColor: dark ? COLORS.dark2 : COLORS.secondaryWhite, borderColor: dark ? COLORS.dark3 : COLORS.grayscale200 }
          ]}>
            <Text style={[styles.label, { color: dark ? COLORS.greyscale300 : COLORS.greyScale800 }]}>Enter current PIN</Text>
            <OtpInput
              numberOfDigits={4}
              onTextChange={(text) => setCurrentPin(text)}
              focusColor={COLORS.primary}
              focusStickBlinkingDuration={500}
              onFilled={(text) => setCurrentPin(text)}
              theme={{
                pinCodeContainerStyle: {
                  backgroundColor: dark ? COLORS.dark1 : COLORS.white,
                  borderColor: dark ? COLORS.gray3 : COLORS.grayscale200,
                  borderWidth: 1,
                  borderRadius: 14,
                  height: 64,
                  width: 64,
                  shadowColor: '#000',
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 2,
                },
                pinCodeTextStyle: {
                  color: dark ? COLORS.white : COLORS.black,
                  fontFamily: 'Urbanist SemiBold',
                  fontSize: 18,
                },
              }}
            />
            <Text style={[styles.hint, { color: dark ? COLORS.grayscale400 : COLORS.greyscale600 }]}>4 digits, numbers only</Text>
          </View>

          <View style={[
            styles.card,
            { backgroundColor: dark ? COLORS.dark2 : COLORS.secondaryWhite, borderColor: dark ? COLORS.dark3 : COLORS.grayscale200 }
          ]}>
            <Text style={[styles.label, { color: dark ? COLORS.greyscale300 : COLORS.greyScale800 }]}>Enter new PIN</Text>
            <OtpInput
              numberOfDigits={4}
              onTextChange={(text) => setNewPin(text)}
              focusColor={COLORS.primary}
              focusStickBlinkingDuration={500}
              onFilled={(text) => setNewPin(text)}
              theme={{
                pinCodeContainerStyle: {
                  backgroundColor: dark ? COLORS.dark1 : COLORS.white,
                  borderColor: dark ? COLORS.gray3 : COLORS.grayscale200,
                  borderWidth: 1,
                  borderRadius: 14,
                  height: 64,
                  width: 64,
                  shadowColor: '#000',
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 2,
                },
                pinCodeTextStyle: {
                  color: dark ? COLORS.white : COLORS.black,
                  fontFamily: 'Urbanist SemiBold',
                  fontSize: 18,
                },
              }}
            />
            <Text style={[styles.hint, { color: currentPin && newPin && currentPin === newPin ? COLORS.error : (dark ? COLORS.grayscale400 : COLORS.greyscale600) }]}>
              {currentPin && newPin && currentPin === newPin ? 'New PIN must be different from current PIN' : 'Use a unique PIN for better security'}
            </Text>
          </View>

          <Button
            title={isLoading ? 'Processing…' : 'Confirm Change'}
            filled
            style={[styles.button, !canSubmit && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={isLoading || !canSubmit}
            isLoading={isLoading}
          />
          <Text style={[styles.footerNote, { color: dark ? COLORS.transparentWhite2 : COLORS.greyscale600 }]}>Your PIN helps protect your account and transactions.</Text>
        </ScrollView>

        <CustomAlertModal
          visible={alertVisible}
          onClose={() => {
            setAlertVisible(false);
            if (alertType === 'success') {
              navigation.goBack();
            }
          }}
          title={alertTitle}
          message={alertMessage}
          type={alertType}
          buttonText={alertType === 'success' ? 'Done' : 'OK'}
          buttonStyle={alertType === 'success' ? 'primary' : 'secondary'}
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
  scrollContent: {
    paddingBottom: 32,
  },
  title: {
    fontSize: 18,
    fontFamily: "Urbanist Medium",
    color: COLORS.greyscale900,
    textAlign: "center",
    marginVertical: 24,
    lineHeight: 26,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Urbanist SemiBold',
    marginBottom: 12,
    marginTop: 8,
  },
  card: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  hint: {
    marginTop: 10,
    fontSize: 12,
    fontFamily: 'Urbanist Regular',
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
    borderRadius: 28,
    marginTop: 8,
  },
  footerNote: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 12,
    fontFamily: 'Urbanist Regular',
  }
})

export default ChangePIN