import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { COLORS } from '../constants';
import { OtpInput } from "react-native-otp-entry";
import Button from "../components/Button";
import { useTheme } from '../theme/ThemeProvider';
import { useNavigation, useRoute } from '@react-navigation/native';

type Nav = {
  navigate: (value: string) => void
}

const OTPVerification = () => {
  const { navigate } = useNavigation<Nav>();
  const route = useRoute<any>();
  const email: string = route?.params?.email || '';
  const [time, setTime] = useState(50);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { colors, dark } = useTheme();

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [])

  const maskEmail = (e: string) => {
    if (!e) return 'your email';
    const [name, domain] = e.split('@');
    if (!domain) return e;
    const maskedName = name.length <= 2 ? name[0] + '*' : name[0] + '*'.repeat(Math.max(1, name.length - 2)) + name[name.length - 1];
    return `${maskedName}@${domain}`;
  };

  const handleVerify = async () => {
    if ((otp || '').length !== 6) {
      Alert.alert('Invalid code', 'Please enter the 6-digit code sent to your email.');
      return;
    }
    if (!email) {
      Alert.alert('Missing email', 'Email is required to verify your code.');
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch('https://theblupayapi.com/userAuth/verify-forgot-password-otp/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp_code: otp }),
      });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok) {
        const message = data?.message || 'OTP verified successfully.';
        Alert.alert('Verified', message);
        navigate('CreateNewPassword' as any, { email, otp_code: otp });
      } else {
        const msg = data?.message || data?.detail || data?.error || 'Verification failed. Please try again.';
        Alert.alert('Verification failed', String(msg));
      }
    } catch (e: any) {
      Alert.alert('Network error', e?.message || 'Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Forgot Password" />
        <ScrollView>
          <Text style={[styles.title, {
            color: dark ? COLORS.white : COLORS.black
          }]}>Code has been sent to {maskEmail(email)}</Text>
          <OtpInput
            numberOfDigits={6}
            onTextChange={(text) => setOtp(text)}
            focusColor={COLORS.primary}
            focusStickBlinkingDuration={500}
            onFilled={(text) => setOtp(text)}
            theme={{
              pinCodeContainerStyle: {
                backgroundColor: dark ? COLORS.dark2 : COLORS.secondaryWhite,
                borderColor: dark ? COLORS.gray : COLORS.secondaryWhite,
                borderWidth: .4,
                borderRadius: 10,
                height: 58,
                width: 58,
              },
              pinCodeTextStyle: {
                color: dark ? COLORS.white : COLORS.black,
              }
            }}
          />
          <View style={styles.codeContainer}>
            <Text style={[styles.code, {
              color: dark ? COLORS.white : COLORS.greyscale900
            }]}>Resend code in</Text>
            <Text style={styles.time}>{`  ${time} `}</Text>
            <Text style={[styles.code, {
              color: dark ? COLORS.white : COLORS.greyscale900
            }]}>s</Text>
          </View>
        </ScrollView>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.button} />
        ) : (
          <Button
            title="Verify"
            filled
            style={styles.button}
            onPress={handleVerify}
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
    marginVertical: 54
  },
  OTPStyle: {
    borderRadius: 8,
    height: 58,
    width: 58,
    backgroundColor: COLORS.white,
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
    borderRadius: 32
  }
})

export default OTPVerification