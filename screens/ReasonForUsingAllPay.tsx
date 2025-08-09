import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeProvider';
import { COLORS, SIZES, images } from '../constants';
import Header from '../components/Header';
import CustomAlertModal from '../components/CustomAlertModal';

type Nav = {
  navigate: (screen: string, params?: any) => void;
};

const baseUrl = 'https://theblupayapi.com';

const ReasonForUsingAllPay: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route?.params && typeof route.params === 'object' ? route.params as { email?: string } : {};
  const email = params?.email || '';
  const { colors, dark } = useTheme();

  const [otp, setOtp] = useState(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('Information');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info' | 'custom'>('custom');
  const [alertCallback, setAlertCallback] = useState<(() => void) | null>(null);
  
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

  // Auto-submit when OTP is complete
  useEffect(() => {
    const code = otp.join('');
    if (code.length === 6) {
      // Small delay to let user see the last digit
      const timeoutId = setTimeout(() => {
        handleVerify();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [otp]);

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
      setAlertType('warning');
      setAlertMessage('Please enter all 6 digits.');
      setAlertTitle('Invalid OTP');
      setAlertVisible(true);
      return;
    }

    setLoading(true);
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
        setAlertType('error');
        setAlertMessage(data.detail || 'Incorrect verification code. Please try again.');
        setAlertTitle('Verification Failed');
        setAlertVisible(true);
        return;
      }

      // ── SAVE JWT UNDER "token" ─────────────────────────
      const accessToken =
        (data && (data.access_token || data.access || data.token)) ||
        (data?.data && (data.data.access_token || data.data.access || data.data.token));

      if (!accessToken || typeof accessToken !== 'string') {
        setAlertType('error');
        setAlertMessage('Verification succeeded but no access token was returned.');
        setAlertTitle('Authentication Error');
        setAlertVisible(true);
        return;
      }

      await AsyncStorage.setItem('token', accessToken);
      console.log('�� Saved token length:', accessToken.length);

      // Custom success message with custom alert
      setAlertType('success');
      setAlertMessage('Email verified successfully! Please complete your profile setup.');
      setAlertTitle('Verification Successful');
      setAlertVisible(true);
      // Navigate to VerifyYourIdentity after alert closes
      setAlertCallback(() => () => navigation.navigate('VerifyYourIdentity'));
      
    } catch (e: any) {
      setAlertType('error');
      setAlertMessage('Network error. Please check your connection and try again.');
      setAlertTitle('Connection Error');
      setAlertVisible(true);
    } finally {
      setLoading(false);
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

        <View style={styles.contentContainer}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/Blupay_logo.png')}
              resizeMode='contain'
              style={styles.logo}
            />
          </View>

          <View style={styles.textContainer}>
            <Text
              style={[
                styles.title,
                { color: dark ? COLORS.white : COLORS.black },
              ]}>
              Enter the 6-digit code
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: dark ? COLORS.grayTie : COLORS.grayscale700 },
              ]}>
              sent to your email
            </Text>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={(r) => {
                  inputs.current[i] = r;
                }}
                style={[
                  styles.otpBox,
                  {
                    backgroundColor: dark ? COLORS.dark2 : COLORS.greyscale500,
                    borderColor: digit ? COLORS.primary : (dark ? COLORS.white : COLORS.black),
                    color: dark ? COLORS.white : COLORS.black,
                  },
                ]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={t => handleChange(t, i)}
                textAlign="center"
                autoCorrect={false}
                editable={!loading}
              />
            ))}
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: dark ? COLORS.white : COLORS.black }]}>
                Verifying your code...
              </Text>
            </View>
          )}

          <View style={styles.timerContainer}>
            <Text
              style={[
                styles.timerText,
                { color: dark ? COLORS.grayTie : COLORS.grayscale700 },
              ]}>
              {resendAvailable
                ? "Didn't receive the code?"
                : `Code expires in ${format(timer)}`}
            </Text>

            {resendAvailable && (
              <TouchableOpacity onPress={handleResend} disabled={loading}>
                <Text style={[styles.resendLink, loading && styles.disabledText]}>
                  Resend Code
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <CustomAlertModal
        visible={alertVisible}
        onClose={() => {
          setAlertVisible(false);
          // Execute callback if exists, then clear it
          if (alertCallback) {
            alertCallback();
            setAlertCallback(null);
          }
        }}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        buttonText="Okay"
        autoClose={alertType === 'success'}
        autoCloseDelay={2000}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  area: { 
    flex: 1 
  },
  container: { 
    flex: 1, 
    padding: 16 
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: { 
    alignItems: 'center', 
    marginBottom: 40 
  },
  logo: { 
    width: 150, 
    height: 100 
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    textAlign: 'center',
    fontSize: 28,
    fontFamily: 'Urbanist Bold',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Urbanist Regular',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 280,
    marginBottom: 40,
  },
  otpBox: {
    width: 45,
    height: 55,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 24,
    fontFamily: 'Urbanist SemiBold',
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Urbanist Medium',
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerText: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Urbanist Regular',
    marginBottom: 8,
  },
  resendLink: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Urbanist SemiBold',
    color: COLORS.primary,
  },
  disabledText: {
    opacity: 0.5,
  },
});

export default ReasonForUsingAllPay;
