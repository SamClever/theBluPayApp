import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeProvider';
import { COLORS, SIZES, images } from '../constants';
import Header from '../components/Header';
import Button from '../components/Button';

type Nav = {
  navigate: (screen: string) => void;
};

const baseUrl = 'https://theblupayapi.com';

const ReasonForUsingAllPay: React.FC = () => {
  const { navigate } = useNavigation<Nav>();
  const route = useRoute();
  const { email = '' } = route.params as { email?: string };
  const { colors, dark } = useTheme();

  const [otp, setOtp] = useState(Array(6).fill(''));
  const inputs = useRef<Array<TextInput | null>>([]);
  const [timer, setTimer] = useState(60);
  const [resendAvailable, setResendAvailable] = useState(false);

  useEffect(() => {
    if (timer === 0) {
      setResendAvailable(true);
      return;
    }
    const id = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const handleChange = (text: string, idx: number) => {
    if (/^\d?$/.test(text)) {
      const clone = [...otp];
      clone[idx] = text;
      setOtp(clone);
      if (text && idx < 5) inputs.current[idx + 1]?.focus();
      else if (!text && idx > 0) inputs.current[idx - 1]?.focus();
    }
  };

  const handleResend = () => {
    setOtp(Array(6).fill(''));
    setTimer(60);
    setResendAvailable(false);
    inputs.current[0]?.focus();
    // TODO: call resend-OTP API here
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      return Alert.alert('Invalid OTP', 'Please enter all 6 digits.');
    }

    try {
      const resp = await fetch(
        `${baseUrl}/userAuth/verify-registration-otp/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp_code: code }),
        }
      );
      const data = await resp.json();

      if (!resp.ok) {
        return Alert.alert(
          'Verification Failed',
          data.detail || 'Incorrect code.'
        );
      }

      // ── SAVE JWT UNDER "token" ─────────────────────────
      await AsyncStorage.setItem('token', data.access_token);
      console.log('🔥 Saved token:', data.access_token);

      Alert.alert('Success', data.message || 'OTP verified!');
      navigate('VerifyYourIdentity');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Something went wrong.');
    }
  };

  const format = (s: number) => {
    const m = Math.floor(s / 60),
      sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <SafeAreaView
      style={[styles.area, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Verify OTP" />

        <ScrollView
          style={{ marginVertical: 54 }}
          showsVerticalScrollIndicator={false}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/Blupay_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text
            style={[
              styles.title,
              { color: dark ? COLORS.white : COLORS.black },
            ]}>
    
          </Text>

          <View style={styles.otpContainer}>
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={r => (inputs.current[i] = r)}
                style={[
                  styles.otpBox,
                  {
                    backgroundColor: dark ? COLORS.dark2 : COLORS.greyscale500,
                    borderColor: dark ? COLORS.white : COLORS.black,
                    color: dark ? COLORS.white : COLORS.black,
                  },
                ]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={t => handleChange(t, i)}
                textAlign="center"
                autoCorrect={false}
              />
            ))}
          </View>

          <Text
            style={[
              styles.timerText,
              { color: dark ? COLORS.white : COLORS.black },
            ]}>
            {resendAvailable
              ? "Didn't receive the code?"
              : `Code expires in ${format(timer)}`}
          </Text>

          {resendAvailable && (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendLink}>Resend Code</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        <View style={styles.bottomContainer}>
          <Button
            title="Continue"
            filled
            style={styles.button}
            onPress={handleVerify}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  area: { flex: 1 },
  container: { flex: 1, padding: 16 },
  logoContainer: { alignItems: 'center', marginVertical: 32 },
  logo: {
    width: 200,
    height: 100,
    // No tintColor, so the logo displays in original colors
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    fontFamily: 'Urbanist Bold',
    marginBottom: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginTop: 20,
  },
  otpBox: {
    width: 48,
    height: 60,
    borderRadius: 12,
    borderWidth: 1.5,
    fontSize: 22,
    fontFamily: 'Urbanist SemiBold',
  },
  timerText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
    fontFamily: 'Urbanist Regular',
  },
  resendLink: {
    textAlign: 'center',
    marginTop: 4,
    fontSize: 14,
    color: COLORS.primary,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 28,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  button: { width: SIZES.width - 32, borderRadius: 30 },
});

export default ReasonForUsingAllPay;
