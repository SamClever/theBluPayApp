import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, ImageSourcePropType, Platform, ActivityIndicator } from 'react-native';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES, icons, images } from '../constants';
import Header from '../components/Header';
import { reducer } from '../utils/reducers/formReducers';
import { validateInput } from '../utils/actions/formActions';
import Input from '../components/Input';
import CheckBox from '@react-native-community/checkbox';
import Button from '../components/Button';
import SocialButton from '../components/SocialButton';
import OrSeparator from '../components/OrSeparator';
import { useTheme } from '../theme/ThemeProvider';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';
import CustomAlertModal from '../components/CustomAlertModal';

interface InputValues {
  email: string
  password: string
}

interface InputValidities {
  email: boolean | undefined
  password: boolean | undefined
}

interface FormState {
  inputValues: InputValues
  inputValidities: InputValidities
  formIsValid: boolean
}

const initialState: FormState = {
  inputValues: {
    email: '',
    password: '',
  },
  inputValidities: {
    email: false,
    password: false,
  },
  formIsValid: false,
}

const Login = () => {
  const navigation = useNavigation<any>();
  const [formState, dispatchFormState] = useReducer(reducer, initialState);
  const [error, setError] = useState(null);
  const [isChecked, setChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { colors, dark } = useTheme();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('Information');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info' | 'custom'>('custom');
  const [alertCallback, setAlertCallback] = useState<(() => void) | null>(null);

  const inputChangedHandler = useCallback(
    (inputId: string, inputValue: string) => {
      const result = validateInput(inputId, inputValue)
      dispatchFormState({
        inputId,
        validationResult: result,
        inputValue,
      })
    }, [dispatchFormState])

  useEffect(() => {
    if (error) {
      setAlertMessage('An error occured');
      setAlertTitle('Error');
      setAlertVisible(true);
    }
  }, [error]);

  useEffect(() => {
    const loadRememberedEmail = async () => {
      const savedEmail = await AsyncStorage.getItem('rememberedEmail');
      if (savedEmail) {
        dispatchFormState({
          inputId: 'email',
          validationResult: true,
          inputValue: savedEmail,
        });
        setChecked(true);
      }
    };
    loadRememberedEmail();
  }, []);

  // Implementing apple authentication
  const appleAuthHandler = () => {
    console.log("Apple Authentication")
  };

  // Implementing facebook authentication
  const facebookAuthHandler = () => {
    console.log("Facebook Authentication")
  };

  // Implementing google authentication
  const googleAuthHandler = () => {
    console.log("Google Authentication")
  };

  // Add login handler
  const handleLogin = async () => {
    if (!formState.inputValues.email || !formState.inputValues.password) {
      setAlertType('warning');
      setAlertMessage('Please fill in all required fields');
      setAlertTitle('Missing Information');
      setAlertVisible(true);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('https://theblupayapi.com/userAuth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formState.inputValues.email,
          password: formState.inputValues.password,
        }),
      });
      const data = await response.json();
      console.log('Login API status:', response.status);
      console.log('Login API data:', data);
      if (response.ok) {
        // Desired flow: Login -> LoginOtp -> Home
        if (isChecked) {
          await AsyncStorage.setItem('rememberedEmail', formState.inputValues.email);
        } else {
          await AsyncStorage.removeItem('rememberedEmail');
        }
        setAlertMessage(data?.message || 'OTP code sent. Please verify to complete login.');
        setAlertTitle('Verification Required');
        setAlertType('info');
        setAlertVisible(true);
        setAlertCallback(() => () => navigation.navigate('LoginOtp', { email: formState.inputValues.email }));
      } else if (
        data?.message &&
        (data.message.toLowerCase().includes('otp code sent') || data.message.toLowerCase().includes('verify to complete login'))
      ) {
        // If backend says OTP sent, show custom alert then redirect to LoginOtp
        setAlertMessage(data.message);
        setAlertTitle('Verification Required');
        setAlertType('info');
        setAlertVisible(true);
        // Set navigation to LoginOtp after modal closes
        setAlertCallback(() => () => navigation.navigate('LoginOtp', { email: formState.inputValues.email }));
      } else {
        let userMessage = 'Something went wrong.';
        // Extract message from different possible fields
        if (data.message) userMessage = data.message;
        else if (data.detail) userMessage = data.detail;
        else if (data.error) userMessage = data.error;
        else if (typeof data === 'string') userMessage = data;

        // Custom overrides for common backend errors
        if (data.error === 'Invalid credentials.') {
          userMessage = 'Your email or password is incorrect.';
        }
        if (data.detail === 'User not found.') {
          userMessage = 'No account found with this email.';
        }
        if (data.error === 'Network error') {
          userMessage = 'Please check your internet connection.';
        }
        setAlertMessage(userMessage);
        setAlertTitle('Error');
        setAlertType('error');
        setAlertVisible(true);
      }
    } catch (error) {
      console.log('Login API error:', error);
      setAlertMessage('An error occurred. Please try again.');
      setAlertTitle('Error');
      setAlertType('error');
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const iconColor = dark ? COLORS.white : COLORS.black;

  return (
    <SafeAreaView style={[styles.area, {
      backgroundColor: colors.background
    }]}>
      <View style={[styles.container, {
        backgroundColor: colors.background
      }]}>
        <Header title="" />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/Blupay_logo.png')}
              resizeMode='contain'
              style={styles.logo}
            />
          </View>
          <Text style={[styles.title, {
            color: dark ? COLORS.white : COLORS.black
          }]}>Login to Your Account</Text>
          <Input
            id="email"
            onInputChanged={inputChangedHandler}
            errorText={formState.inputValidities['email']}
            placeholder="Email"
            placeholderTextColor={dark ? COLORS.grayTie : COLORS.black}
            icon={icons.email}
            keyboardType="email-address"
          />
          <Input
            onInputChanged={inputChangedHandler}
            errorText={formState.inputValidities['password']}
            autoCapitalize="none"
            id="password"
            placeholder="Password"
            placeholderTextColor={dark ? COLORS.grayTie : COLORS.black}
            icon={icons.padlock}
            secureTextEntry={!showPassword}
            rightIcon={<Icon name={showPassword ? "eye" : "eye-off"} size={15} color={iconColor} />}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />
          <View style={styles.checkBoxContainer}>
            <View style={{ flexDirection: 'row' }}>
              <CheckBox
                style={styles.checkbox}
                value={isChecked}
                boxType="square"
                onTintColor={isChecked ? COLORS.primary : dark ? COLORS.primary : "gray"}
                onFillColor={isChecked ? COLORS.primary : dark ? COLORS.primary : "gray"}
                onCheckColor={COLORS.white}
                onValueChange={setChecked}
                tintColors={{ true: COLORS.primary, false: "gray" }}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.privacy, {
                  color: dark ? COLORS.white : COLORS.black
                }]}>Remenber me</Text>
              </View>
            </View>
          </View>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={styles.button} />
          ) : (
            <Button
              title="Login"
              filled
              onPress={handleLogin}
              style={styles.button}
            />
          )}
          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPasswordMethods")}
          >
            <Text style={styles.forgotPasswordBtnText}>Forgot the password?</Text>
          </TouchableOpacity>
          <View>
            <OrSeparator text="or continue with" />
            <View style={styles.socialBtnContainer}>
              <SocialButton
                icon={icons.appleLogo}
                onPress={appleAuthHandler}
                tintColor={dark ? COLORS.white : COLORS.black}
              />
              <SocialButton
                icon={icons.facebook}
                onPress={facebookAuthHandler}
              />
              <SocialButton
                icon={icons.google}
                onPress={googleAuthHandler}
              />
            </View>
          </View>
        </ScrollView>
        <View style={styles.bottomContainer}>
          <Text style={[styles.bottomLeft, {
            color: dark ? COLORS.white : COLORS.black
          }]}>Don't have an account ?</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Signup")}
          >
            <Text style={styles.bottomRight}>{"  "}Sign Up</Text>
          </TouchableOpacity>
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
        // icon={require('../assets/images/your-illustration.png')} // Optional
      />
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
  logo: {
    width: 200,
    height: 100
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 32
  },
  title: {
    fontSize: 28,
    fontFamily: "Urbanist Bold",
    color: COLORS.black,
    textAlign: "center",
    marginTop: -2,
    marginBottom: 16
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  checkBoxContainer: {
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 18,
  },
  checkbox: {
    marginRight: Platform.OS === "ios" ?  8 : 14,
    height: 16,
    width: 16,
    borderRadius: 4,
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  privacy: {
    fontSize: 12,
    fontFamily: "Urbanist Regular",
    color: COLORS.black,
  },
  socialTitle: {
    fontSize: 19.25,
    fontFamily: "Urbanist Medium",
    color: COLORS.black,
    textAlign: "center",
    marginVertical: 26
  },
  socialBtnContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 18,
    position: "absolute",
    bottom: 12,
    right: 0,
    left: 0,
  },
  bottomLeft: {
    fontSize: 14,
    fontFamily: "Urbanist Regular",
    color: "black"
  },
  bottomRight: {
    fontSize: 16,
    fontFamily: "Urbanist Medium",
    color: COLORS.primary
  },
  button: {
    marginVertical: 6,
    width: SIZES.width - 32,
    borderRadius: 30
  },
  forgotPasswordBtnText: {
    fontSize: 16,
    fontFamily: "Urbanist SemiBold",
    color: COLORS.primary,
    textAlign: "center",
    marginTop: 12
  }
})

export default Login