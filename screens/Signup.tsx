import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Checkbox from 'expo-checkbox';
import Icon from 'react-native-vector-icons/Feather';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

import { COLORS, SIZES, icons, images } from '../constants';
import Header from '../components/Header';
import Input from '../components/Input';
import Button from '../components/Button';
import SocialButton from '../components/SocialButton';
import OrSeparator from '../components/OrSeparator';
import { useTheme } from '../theme/ThemeProvider';
import CustomAlertModal from '../components/CustomAlertModal';

import { reducer } from '../utils/reducers/formReducers';
import { validateInput } from '../utils/actions/formActions';

const baseUrl = 'https://theblupayapi.com';

type NavigationProps = {
  navigate: (screen: string, params?: any) => void;
};

const initialState = {
  inputValues: { email: '', password: '' },
  inputValidities: { email: true, password: true }, // Start as valid since fields are empty
  formIsValid: false,
};

const Signup = () => {
  const { navigate } = useNavigation<NavigationProps>();
  const { colors, dark } = useTheme();

  const [formState, dispatchFormState] = useReducer(reducer, initialState);
  const [loading, setLoading] = useState(false);
  const [isChecked, setChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Custom Alert States
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('Information');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info' | 'custom'>('custom');
  const [alertCallback, setAlertCallback] = useState<(() => void) | null>(null);

  // Google Sign-In for React Native CLI
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // Required for web and Android
      offlineAccess: false,
    });
  }, []);

  const handleGoogleSignUp = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      setAlertType('success');
      setAlertTitle('Google Sign Up');
      setAlertMessage('Google account connected successfully!');
      setAlertVisible(true);
      // TODO: Send userInfo.user info to your backend for registration/login
    } catch (err) {
      const error = err as { code?: string };
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        setAlertType('error');
        setAlertTitle('Google Sign Up');
        setAlertMessage('Google sign up cancelled.');
        setAlertVisible(true);
      } else if (error.code === statusCodes.IN_PROGRESS) {
        setAlertType('warning');
        setAlertTitle('Google Sign Up');
        setAlertMessage('Google sign in already in progress.');
        setAlertVisible(true);
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setAlertType('error');
        setAlertTitle('Google Sign Up');
        setAlertMessage('Google Play Services not available or outdated.');
        setAlertVisible(true);
      } else {
        setAlertType('error');
        setAlertTitle('Google Sign Up');
        setAlertMessage('Google sign up failed. Please try again.');
        setAlertVisible(true);
      }
    }
  };

  const inputChangedHandler = useCallback((inputId: string, inputValue: string) => {
    const result = validateInput(inputId, inputValue);
    dispatchFormState({ inputId, validationResult: result, inputValue });
  }, []);

  const registerHandler = async () => {
    // Debug validation state
    console.log('🔍 Validation Debug:', {
      email: formState.inputValues.email,
      emailValid: formState.inputValidities.email,
      password: formState.inputValues.password,
      passwordValid: formState.inputValidities.password,
      isChecked: isChecked,
      formState: formState
    });

    // Beautiful validation with specific messages
    const validationErrors = [];
    
    if (!formState.inputValues.email) {
      validationErrors.push('Email address is required');
    } else if (!formState.inputValidities.email) {
      validationErrors.push('Please enter a valid email address');
    }
    
    if (!formState.inputValues.password) {
      validationErrors.push('Password is required');
    } else if (!formState.inputValidities.password) {
      validationErrors.push('Password must be at least 6 characters');
    }

    if (!isChecked) {
      validationErrors.push('Please accept our Privacy Policy to continue');
    }

    console.log('🔍 Validation Errors:', validationErrors);

    if (validationErrors.length > 0) {
      setAlertType('warning');
      setAlertMessage(`Please fix the following issues:\n${validationErrors.join('\n')}`);
      setAlertTitle('Missing Information');
      setAlertVisible(true);
      return;
    }

    setLoading(true);
    const payload = {
      email: formState.inputValues.email,
      password: formState.inputValues.password,
      terms_accepted: isChecked,
    };

    try {
      const response = await fetch(`${baseUrl}/userAuth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log('Register response:', response.status, data);
      console.log('API Error Data:', {
        message: data.message,
        detail: data.detail,
        error: data.error,
        fullData: data
      });
      
      // Enhanced debug user exists detection
      console.log('🔍 User exists check:', {
        responseStatus: response.status,
        messageText: data.message?.toLowerCase(),
        detailText: data.detail?.toLowerCase(),
        errorText: data.error?.toLowerCase(),
        statusText: data.status?.toLowerCase(),
        descriptionText: data.description?.toLowerCase(),
        fullResponseData: data
      });

      // Check for user already exists patterns (more comprehensive)
      const userExistsPatterns = [
        'user is exist', 'already exists', 'user exist', 'user already', 'email already',
        'user exists', 'email exists', 'account exists', 'already registered',
        'user is already', 'email is already', 'account is already',
        'duplicate', 'already taken', 'email taken', 'user taken',
        'user with this email', 'email address is already', 'email is already',
        'this email is already', 'email already registered', 'user already registered',
        'account already exists', 'user already exists', 'email already exists',
        'registration failed', 'user creation failed', 'email already in use',
        'email address already', 'user with email', 'existing user'
      ];

      const responseText = [
        data.message?.toLowerCase(),
        data.detail?.toLowerCase(),
        data.error?.toLowerCase(),
        data.status?.toLowerCase(),
        data.description?.toLowerCase(),
        data.reason?.toLowerCase(),
        data.cause?.toLowerCase(),
        data.info?.toLowerCase()
      ].filter(Boolean).join(' ');

      console.log('🔍 Response text for pattern matching:', responseText);

      // Check multiple conditions for user existence
      const isUserExists = 
        userExistsPatterns.some(pattern => responseText.includes(pattern)) ||
        response.status === 409 || // HTTP 409 Conflict
        response.status === 422 || // HTTP 422 Unprocessable Entity (often used for validation errors)
        (response.status === 400 && responseText.includes('email')) || // HTTP 400 with email-related error
        (response.status >= 400 && response.status < 500 && !response.ok); // Any 4xx error that's not a success

      console.log('🔍 User exists detection result:', {
        isUserExists,
        matchedPatterns: userExistsPatterns.filter(pattern => responseText.includes(pattern)),
        responseStatus: response.status
      });

      if (isUserExists) {
        // Show a friendly alert if user already exists
        setAlertMessage('Welcome back! It looks like you already have an account with us. Please sign in to continue.');
        setAlertTitle('Account Already Exists');
        setAlertType('info');
        setAlertCallback(() => () => navigate('Login'));
        setAlertVisible(true);
      } else if (response.ok) {
        // ✅ Show success message from API
        setAlertMessage('Account created successfully! Please verify your email to continue.');
        setAlertTitle('Registration Successful');
        setAlertType('success');
        setAlertCallback(() => () => navigate('ReasonForUsingAllPay', { email: formState.inputValues.email }));
        setAlertVisible(true);
      } else {
        // ❌ Show error message from API (or full JSON if missing)
        let userMessage = 'Registration failed.';
        let alertTitle = 'Registration Error';
        let alertType: 'success' | 'error' | 'warning' | 'info' | 'custom' = 'error';
        
        // Additional fallback check for user existence
        const fallbackUserExistsCheck = 
          response.status >= 400 && response.status < 500 && 
          (responseText.includes('email') || responseText.includes('user') || responseText.includes('account'));
        
        if (fallbackUserExistsCheck) {
          // Likely a user existence issue
          userMessage = 'Welcome back! It looks like you already have an account with us. Please sign in to continue.';
          alertTitle = 'Account Already Exists';
          alertType = 'info';
          setAlertCallback(() => () => navigate('Login'));
        } else if (data.message?.toLowerCase().includes('password') || data.detail?.toLowerCase().includes('password')) {
          userMessage = 'Password must be at least 6 characters long.';
        } else if (data.message?.toLowerCase().includes('email') || data.detail?.toLowerCase().includes('email')) {
          userMessage = 'Please enter a valid email address.';
        } else if (data.error === 'Invalid credentials.') {
          userMessage = 'Your email or password is incorrect.';
        } else if (data.detail === 'User not found.') {
          userMessage = 'No account found with this email.';
        } else if (data.error === 'Network error') {
          userMessage = 'Please check your internet connection.';
        } else if (data.message) {
          userMessage = data.message;
        } else if (data.detail) {
          userMessage = data.detail;
        } else if (data.error) {
          userMessage = data.error;
        } else if (typeof data === 'string') {
          userMessage = data;
        }
        setAlertMessage(userMessage);
        setAlertTitle(alertTitle);
        setAlertType(alertType);
        setAlertVisible(true);
      }
    } catch (error) {
      console.log('Register API error:', error);
      let errorMessage = 'An error occurred. Please try again.';
      
      // Handle specific network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
      }
      
      setAlertMessage(errorMessage);
      setAlertTitle('Network Error');
      setAlertType('error');
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="" />

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/Blupay_logo.png')}
              resizeMode="contain"
              style={{ width: 200, height: 100 }}
            />
          </View>

          <Text style={[styles.title, { color: dark ? COLORS.white : COLORS.black }]}>
            Create Your Account
          </Text>

          <Input
            id="email"
            onInputChanged={inputChangedHandler}
            errorText={formState.inputValues.email && !formState.inputValidities.email ? ['Please enter a valid email address'] : []}
            placeholder="Email Address"
            autoFocus
            placeholderTextColor={dark ? COLORS.grayscale400 : COLORS.gray}
            icon={icons.email}
            keyboardType="email-address"
            value={formState.inputValues.email}
          />

          <Input
            id="password"
            onInputChanged={inputChangedHandler}
            errorText={formState.inputValues.password && !formState.inputValidities.password ? ['Password must be at least 6 characters'] : []}
            autoCapitalize="none"
            placeholder="Password (min 6 characters)"
            placeholderTextColor={dark ? COLORS.grayscale400 : COLORS.gray}
            icon={icons.padlock}
            secureTextEntry={!showPassword}
            value={formState.inputValues.password}
            rightIcon={
              <Icon
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={dark ? COLORS.grayscale400 : COLORS.gray}
              />
            }
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          <View style={styles.checkBoxContainer}>
            <View style={[styles.checkboxRow, !isChecked && formState.inputValues.email && formState.inputValues.password && styles.checkboxRowError]}>
              <TouchableOpacity
                style={[styles.checkbox, { backgroundColor: isChecked ? COLORS.primary : 'transparent', borderWidth: 1, borderColor: isChecked ? COLORS.primary : (dark ? COLORS.grayscale400 : COLORS.gray), width: 20, height: 20, borderRadius: 4, justifyContent: 'center', alignItems: 'center' }]}
                onPress={() => {
                  console.log('🔍 Checkbox pressed, current state:', isChecked);
                  setChecked(!isChecked);
                }}
              >
                {isChecked && (
                  <Text style={{ color: COLORS.white, fontSize: 12, textAlign: 'center' }}>✓</Text>
                )}
              </TouchableOpacity>
              <Text style={[styles.privacy, { color: dark ? COLORS.white : COLORS.black }]}>
                By continuing you accept our{' '}
                <Text style={styles.privacyLink}>Privacy Policy</Text>
              </Text>
            </View>
            {!isChecked && formState.inputValues.email && formState.inputValues.password && (
              <Text style={styles.checkboxErrorText}>Please accept the Privacy Policy to continue</Text>
            )}
          </View>

          {loading ? (
            <View style={styles.loadingButton}>
              <ActivityIndicator size="small" color={COLORS.white} />
              <Text style={styles.loadingText}>Creating Account...</Text>
            </View>
          ) : (
            <Button title="Sign Up" filled onPress={registerHandler} style={styles.button} />
          )}

          <OrSeparator text="or continue with" />

          <View style={styles.socialBtnContainer}>
            <SocialButton icon={icons.appleLogo} onPress={() => console.log('Apple Auth')} />
            <SocialButton icon={icons.facebook} onPress={() => console.log('Facebook Auth')} />
            <SocialButton
              icon={icons.google}
              onPress={handleGoogleSignUp}
            />
          </View>
        </ScrollView>

        <View style={styles.bottomContainer}>
          <Text style={[styles.bottomLeft, { color: dark ? COLORS.white : COLORS.black }]}>
            Already have an account?
          </Text>
          <TouchableOpacity onPress={() => navigate('Login')}>
            <Text style={styles.bottomRight}> Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Custom Alert Modal */}
      <CustomAlertModal
        visible={alertVisible}
        onClose={() => {
          setAlertVisible(false);
          if (alertCallback) {
            alertCallback();
            setAlertCallback(null);
          }
        }}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        buttonText="Okay"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  area: { flex: 1 },
  container: { flex: 1, padding: 16 },
  scrollContent: { flexGrow: 1, paddingBottom: 20 },
  logo2: { width: 100, height: 100 },
  logoContainer: { alignItems: 'center', justifyContent: 'center', marginVertical: 32 },
  title: { fontSize: 28, fontFamily: 'Urbanist Bold', textAlign: 'center', marginBottom: 12 },
  checkBoxContainer: { marginVertical: 12, width: '100%' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  checkboxRowError: { borderColor: COLORS.warning, borderWidth: 1, borderRadius: 8, padding: 4 },
  checkbox: { marginRight: 8 },
  privacy: { fontSize: 14, fontFamily: 'Urbanist Regular' },
  privacyLink: { color: COLORS.primary, fontFamily: 'Urbanist Medium' },
  checkboxErrorText: { 
    color: COLORS.warning, 
    fontSize: 12, 
    fontFamily: 'Urbanist Regular', 
    marginTop: 4, 
    marginLeft: 32 
  },
  socialBtnContainer: { flexDirection: 'row', justifyContent: 'center' },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  bottomLeft: { fontSize: 14, fontFamily: 'Urbanist Regular' },
  bottomRight: { fontSize: 16, fontFamily: 'Urbanist Medium', color: COLORS.primary },
  button: { marginVertical: 6, width: SIZES.width - 32, borderRadius: 30 },
  loadingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 30,
    marginVertical: 6,
    width: SIZES.width - 32,
  },
  loadingText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: 'Urbanist Medium',
    marginLeft: 8,
  },
});

export default Signup;
