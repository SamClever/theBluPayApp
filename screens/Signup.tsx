import React, { useCallback, useReducer, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';

import { COLORS, SIZES, icons } from '../constants';
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

  // Simple Google Sign-In handler without the library
  const handleGoogleSignUp = () => {
    setAlertType('info');
    setAlertTitle('Google Sign Up');
    setAlertMessage('Google Sign-In is currently unavailable. Please use email registration.');
    setAlertVisible(true);
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
      
      // Always try to parse response as JSON, but handle cases where it's not valid JSON
      let data;
      try {
        data = await response.json();
        
        // Log detailed response for debugging
        console.log('🔍 Detailed API Response:', {
          status: response.status,
          statusText: response.statusText,
          headers: [...response.headers.entries()],
          data: data
        });
        
      } catch (parseError) {
        console.log('Response is not valid JSON:', parseError);
        data = { error: 'Invalid server response format' };
      }
      
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

      // Refined list of specific patterns that definitively indicate user exists
      // Only using very specific phrases that clearly indicate a user already exists
      const userExistsPatterns = [
        'user already exists',
        'email already exists',
        'account already exists',
        'email is already registered',
        'user is already registered',
        'email address is already in use',
        'email already in use',
        'duplicate entry',
        'this email is already taken',
        'user with this email already exists'
      ];

      // Only consider 409 Conflict as definitive proof of existing user
      // but don't act on it immediately - let the full response check handle it

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

      // More precise check for user existence - require explicit confirmation
      const isUserExists = 
        // Only accept clear indications from the response text
        (response.status === 409 && (
          responseText.includes('exist') || 
          responseText.includes('already') ||
          responseText.includes('registered') ||
          responseText.includes('duplicate')
        )) || // HTTP 409 Conflict with explicit message
        (responseText.includes('user already exists') || 
         responseText.includes('email already exists') ||
         responseText.includes('account already exists') ||
         responseText.includes('already registered') ||
         (responseText.includes('already') && responseText.includes('email')) ||
         (responseText.includes('already') && responseText.includes('user')) ||
         (responseText.includes('exists') && responseText.includes('email')) ||
         (responseText.includes('exists') && responseText.includes('user')));

      console.log('🔍 User exists detection result:', {
        isUserExists,
        matchedPatterns: userExistsPatterns.filter(pattern => responseText.includes(pattern)),
        responseStatus: response.status
      });

      // Check if the response contains explicit indication that the user exists
      if (
        // Only look for very explicit signals
        (response.status === 409) || // 409 Conflict status code
        (data && (
          (typeof data.message === 'string' && data.message.toLowerCase().includes('already exists')) ||
          (typeof data.error === 'string' && data.error.toLowerCase().includes('already exists')) ||
          (typeof data.detail === 'string' && data.detail.toLowerCase().includes('already exists'))
        )) ||
        isUserExists
      ) {
        setAlertMessage('A user with this email already exists. Please log in to your account. If you forgot your password, you can reset it from the login screen.');
        setAlertTitle('User Already Exists');
        setAlertType('custom');
        setAlertCallback(() => () => navigate('Login'));
        setAlertVisible(true);
        return;
      } else if (response.ok || (response.status >= 200 && response.status < 300)) {
        // ✅ Check if the user was actually created successfully
        console.log('🔍 Registration appears successful:', response.status, data);
        
        // Specifically check if the API returned a success message or user data
        const isSuccessful = 
          (data && data.user) || 
          (data && data.id) ||
          (data && data.success === true) ||
          (data && data.status === 'success') ||
          (data && data.message && typeof data.message === 'string' && 
           data.message.toLowerCase().includes('success'));
        
        if (isSuccessful) {
          setAlertMessage('Account created successfully! Please verify your email to continue.');
          setAlertTitle('Registration Successful');
          setAlertType('success');
          setAlertCallback(() => () => navigate('ReasonForUsingAllPay', { email: formState.inputValues.email }));
          setAlertVisible(true);
        } else {
          // Handle unexpected success response without confirmation data
          setAlertMessage('Your account has been created. Please verify your email to continue.');
          setAlertTitle('Registration Complete');
          setAlertType('success');
          setAlertCallback(() => () => navigate('ReasonForUsingAllPay', { email: formState.inputValues.email }));
          setAlertVisible(true);
        }
      } else {
        // Robust fallback check for user existence - match all common duplicate user phrases
        const fallbackUserExistsCheck =
          response.status === 409 ||
          (response.status === 400 && (
            responseText.includes('user already exists') ||
            responseText.includes('email already exists') ||
            responseText.includes('account already exists') ||
            responseText.includes('email is already registered') ||
            responseText.includes('user is already registered') ||
            responseText.includes('email address is already in use') ||
            responseText.includes('email already in use') ||
            responseText.includes('duplicate entry') ||
            responseText.includes('this email is already taken') ||
            responseText.includes('user with this email already exists') ||
            (responseText.includes('user') && responseText.includes('exist')) ||
            (responseText.includes('email') && responseText.includes('exist')) ||
            (responseText.includes('account') && responseText.includes('exist')) ||
            (responseText.includes('already') && responseText.includes('registered')) ||
            (responseText.includes('already') && responseText.includes('taken'))
          ));

        // Debug: log the response and data for user-exists check
        if (fallbackUserExistsCheck ||
          (data.message && (
            data.message.toLowerCase().includes('user already exists') ||
            data.message.toLowerCase().includes('email already exists') ||
            data.message.toLowerCase().includes('account already exists') ||
            data.message.toLowerCase().includes('email is already registered') ||
            data.message.toLowerCase().includes('user is already registered') ||
            data.message.toLowerCase().includes('email address is already in use') ||
            data.message.toLowerCase().includes('email already in use') ||
            data.message.toLowerCase().includes('duplicate entry') ||
            data.message.toLowerCase().includes('this email is already taken') ||
            data.message.toLowerCase().includes('user with this email already exists')
          )) ||
          (data.detail && (
            data.detail.toLowerCase().includes('user already exists') ||
            data.detail.toLowerCase().includes('email already exists') ||
            data.detail.toLowerCase().includes('account already exists') ||
            data.detail.toLowerCase().includes('email is already registered') ||
            data.detail.toLowerCase().includes('user is already registered') ||
            data.detail.toLowerCase().includes('email address is already in use') ||
            data.detail.toLowerCase().includes('email already in use') ||
            data.detail.toLowerCase().includes('duplicate entry') ||
            data.detail.toLowerCase().includes('this email is already taken') ||
            data.detail.toLowerCase().includes('user with this email already exists')
          )) ||
          (data.error && (
            data.error.toLowerCase().includes('user already exists') ||
            data.error.toLowerCase().includes('email already exists') ||
            data.error.toLowerCase().includes('account already exists') ||
            data.error.toLowerCase().includes('email is already registered') ||
            data.error.toLowerCase().includes('user is already registered') ||
            data.error.toLowerCase().includes('email address is already in use') ||
            data.error.toLowerCase().includes('email already in use') ||
            data.error.toLowerCase().includes('duplicate entry') ||
            data.error.toLowerCase().includes('this email is already taken') ||
            data.error.toLowerCase().includes('user with this email already exists')
          ))
        ) {
          console.log('🔴 USER EXISTS ALERT TRIGGERED', {
            responseStatus: response.status,
            responseText,
            data
          });
          setAlertMessage('A user with this email already exists. Please log in to your account. If you forgot your password, you can reset it from the login screen.');
          setAlertTitle('User Already Exists');
          setAlertType('custom');
          setAlertCallback(() => () => navigate('Login'));
          setAlertVisible(true);
          return;
        }

        // Only show the generic error if not a user-exists case
        let userMessage = 'A user with this email already exists. Please log in to your account. If you forgot your password, you can reset it from the login screen.';
        let alertTitle = 'User Already Exists';
        let alertType: 'success' | 'error' | 'warning' | 'info' | 'custom' = 'custom';

        if (data.message?.toLowerCase().includes('password') || data.detail?.toLowerCase().includes('password')) {
          userMessage = 'Password must be at least 6 characters long.';
          alertTitle = 'Password Issue';
          alertType = 'warning';
        } else if (data.message?.toLowerCase().includes('email') || data.detail?.toLowerCase().includes('email')) {
          userMessage = 'Please enter a valid email address.';
          alertTitle = 'Email Issue';
        } else if (data.error === 'Invalid credentials.') {
          userMessage = 'Your email or password is incorrect.';
          alertTitle = 'Invalid Credentials';
          alertType = 'warning';
        } else if (data.detail === 'User not found.') {
          userMessage = 'No account found with this email.';
          alertTitle = 'User Not Found';
          alertType = 'info';
        } else if (data.error === 'Network error') {
          userMessage = 'Please check your internet connection.';
          alertTitle = 'Network Error';
          alertType = 'error';
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
        setAlertCallback(() => null); // Always provide a callback, even if it's just to close
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
      
      // Much more strict check for errors that specifically indicate user exists
      const errorString = String(error).toLowerCase();
      if (
        errorString.includes('user already exists') || 
        errorString.includes('email already exists') ||
        (errorString.includes('duplicate') && errorString.includes('email')) ||
        errorString.includes('email is already registered')
      ) {
        setAlertMessage('A user with this email already exists. Please log in to your account. If you forgot your password, you can reset it from the login screen.');
        setAlertTitle('User Already Exists');
        setAlertType('custom');
        setAlertCallback(() => () => navigate('Login'));
        setAlertVisible(true);
        return;
      } else {
        setAlertMessage(errorMessage);
        setAlertTitle('Network Error');
        setAlertType('error');
        setAlertVisible(true);
      }
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
            <SocialButton icon={icons.appleLogo} onPress={() => {
              setAlertType('info');
              setAlertTitle('Apple Sign Up');
              setAlertMessage('Apple Sign-In is currently unavailable. Please use email registration.');
              setAlertVisible(true);
            }} />
            <SocialButton icon={icons.facebook} onPress={() => {
              setAlertType('info');
              setAlertTitle('Facebook Sign Up');
              setAlertMessage('Facebook Sign-In is currently unavailable. Please use email registration.');
              setAlertVisible(true);
            }} />
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
export default Signup;
