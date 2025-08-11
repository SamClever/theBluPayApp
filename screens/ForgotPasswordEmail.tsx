import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image, ImageSourcePropType, Platform, ActivityIndicator } from 'react-native';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES, icons, images } from '../constants';
import Header from '../components/Header';
import { reducer } from '../utils/reducers/formReducers';
import { validateInput } from '../utils/actions/formActions';
import Input from '../components/Input';
import CheckBox from '@react-native-community/checkbox';
import Button from '../components/Button';
import { useTheme } from '../theme/ThemeProvider';
import { useNavigation } from '@react-navigation/native';

type Nav = {
  navigate: (value: string, params?: any) => void
} 

const isTestMode = true;

const initialState = {
  inputValues: {
    email: isTestMode ? 'example@gmail.com' : '',
  },
  inputValidities: {
    email: false
  },
  formIsValid: false,
}

const ForgotPasswordEmail = () => {
  const { navigate } = useNavigation<Nav>();
  const [formState, dispatchFormState] = useReducer(reducer, initialState);
  const [error, setError] = useState(null);
  const [isChecked, setChecked] = useState(false);
  const { colors, dark } = useTheme();
  const [loading, setLoading] = useState(false);

  const inputChangedHandler = useCallback(
    (inputId: string, inputValue: string) => {
      const result = validateInput(inputId, inputValue)
      dispatchFormState({
        inputId,
        validationResult: result,
        inputValue
      })
    }, [dispatchFormState])

  useEffect(() => {
    if (error) {
      Alert.alert('An error occured', error)
    }
  }, [error])

  const handleForgotPassword = async () => {
    try {
      const email = formState.inputValues.email;
      // basic guard
      if (!email) {
        Alert.alert('Missing email', 'Please enter your email address.');
        return;
      }
      setLoading(true);
      const resp = await fetch('https://theblupayapi.com/userAuth/forgot-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok) {
        const message = data?.message || 'OTP code sent to your email.';
        Alert.alert('Check your email', message);
        navigate('OtpVerification' as any, { email });
      } else {
        // Extract reasonable message
        const msg = data?.message || data?.detail || data?.error || 'Unable to process request.';
        Alert.alert('Request failed', String(msg));
      }
    } catch (e: any) {
      Alert.alert('Network error', e?.message || 'Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Forgot Password" />
        <ScrollView style={{ marginVertical: 54 }} showsVerticalScrollIndicator={false}>
          <View style={styles.logoContainer}>
            <Image
              source={images.logo as ImageSourcePropType}
              resizeMode='contain'
              style={styles.logo}
            />
          </View>
          <Text style={[styles.title, {
            color: dark ? COLORS.white : COLORS.black
          }]}>Enter to Your Email</Text>
          <Input
            id="email"
            onInputChanged={inputChangedHandler}
            errorText={formState.inputValidities['email']}
            placeholder="Email"
            placeholderTextColor={dark ? COLORS.grayTie : COLORS.black}
            icon={icons.email}
            keyboardType="email-address"
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
              title="Reset Password"
              filled
              onPress={handleForgotPassword}
              style={styles.button}
            />
          )}
          <TouchableOpacity
            onPress={() => navigate("Login")}>
            <Text style={styles.forgotPasswordBtnText}>Remenber the password?</Text>
          </TouchableOpacity>
          <View>
          </View>
        </ScrollView>
        <View style={styles.bottomContainer}>
          <Text style={[styles.bottomLeft, {
            color: dark ? COLORS.white : COLORS.black
          }]}>Don't have an account ?</Text>
          <TouchableOpacity
            onPress={() => navigate("Signup")}>
            <Text style={styles.bottomRight}>{"  "}Sign Up</Text>
          </TouchableOpacity>
        </View>
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
  logo: {
    width: 100,
    height: 100,
    tintColor: COLORS.primary
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 32
  },
  title: {
    fontSize: 24,
    fontFamily: "Urbanist Bold",
    color: COLORS.black,
    textAlign: "center",
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

export default ForgotPasswordEmail