import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Checkbox from 'expo-checkbox';

import { COLORS, SIZES, icons, images } from '../constants';
import Header from '../components/Header';
import Input from '../components/Input';
import Button from '../components/Button';
import SocialButton from '../components/SocialButton';
import OrSeparator from '../components/OrSeparator';
import { useTheme } from '../theme/ThemeProvider';

import { reducer } from '../utils/reducers/formReducers';
import { validateInput } from '../utils/actions/formActions';

const baseUrl = 'https://blupay.zakedebt.co.tz';

type NavigationProps = {
  navigate: (screen: string, params?: any) => void;
};

const initialState = {
  inputValues: { email: '', password: '' },
  inputValidities: { email: false, password: false },
  formIsValid: false,
};

const Signup = () => {
  const { navigate } = useNavigation<NavigationProps>();
  const { colors, dark } = useTheme();

  const [formState, dispatchFormState] = useReducer(reducer, initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setChecked] = useState(false);

  // Show any backend error via Alert:
  useEffect(() => {
    // no-op here, we handle errors inline
  }, []);

  const inputChangedHandler = useCallback((inputId: string, inputValue: string) => {
    const result = validateInput(inputId, inputValue);
    dispatchFormState({ inputId, validationResult: result, inputValue });
  }, []);

  const registerHandler = async () => {
    if (!isChecked) {
      Alert.alert('Error', 'Please accept our Privacy Policy.');
      return;
    }

    setIsLoading(true);
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

      if (response.ok) {
        // ✅ Show success message from API
        Alert.alert('Success', data.message);
        navigate('ReasonForUsingAllPay', { email: formState.inputValues.email });
      } else {
        // ❌ Show error message from API (or full JSON if missing)
        Alert.alert(
          'Registration Error',
          data.message ?? JSON.stringify(data, null, 2)
        );
      }
    } catch (err: any) {
      Alert.alert('Network Error', err.message || 'Unable to connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}

        <Header title="" />

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.logoContainer}>
            <Image source={images.logo2} resizeMode="contain" style={styles.logo2} />
          </View>

          <Text style={[styles.title, { color: dark ? COLORS.white : COLORS.black }]}>
            Create Your Account
          </Text>

          <Input
            id="email"
            onInputChanged={inputChangedHandler}
            errorText={!formState.inputValidities.email ? ['Please enter a valid email'] : []}
            placeholder="Email"
            autoFocus
            placeholderTextColor={dark ? COLORS.grayTie : COLORS.black}
            icon={icons.email}
            keyboardType="email-address"
          />

          <Input
            id="password"
            onInputChanged={inputChangedHandler}
            errorText={!formState.inputValidities.password ? ['Password must be at least 6 characters'] : []}
            autoCapitalize="none"
            placeholder="Password"
            placeholderTextColor={dark ? COLORS.grayTie : COLORS.black}
            icon={icons.padlock}
            secureTextEntry
          />

          <View style={styles.checkBoxContainer}>
            <View style={styles.checkboxRow}>
              <Checkbox
                value={isChecked}
                onValueChange={setChecked}
                style={styles.checkbox}
              />
              <Text style={[styles.privacy, { color: dark ? COLORS.white : COLORS.black }]}>
                By continuing you accept our Privacy Policy
              </Text>
            </View>
          </View>

          <Button title="Sign Up" filled onPress={registerHandler} style={styles.button} />

          <OrSeparator text="or continue with" />

          <View style={styles.socialBtnContainer}>
            <SocialButton icon={icons.appleLogo} onPress={() => console.log('Apple Auth')} />
            <SocialButton icon={icons.facebook} onPress={() => console.log('Facebook Auth')} />
            <SocialButton icon={icons.google} onPress={() => console.log('Google Auth')} />
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  area: { flex: 1, backgroundColor: COLORS.white },
  container: { flex: 1, padding: 16, backgroundColor: COLORS.white },
  logo2: { width: 100, height: 100 },
  logoContainer: { alignItems: 'center', justifyContent: 'center', marginVertical: 32 },
  title: { fontSize: 28, fontFamily: 'Urbanist Bold', textAlign: 'center', marginBottom: 12 },
  checkBoxContainer: { marginVertical: 12, width: '100%' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  checkbox: { marginRight: 8 },
  privacy: { fontSize: 14, fontFamily: 'Urbanist Regular' },
  socialBtnContainer: { flexDirection: 'row', justifyContent: 'center' },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
  },
  bottomLeft: { fontSize: 14, fontFamily: 'Urbanist Regular' },
  bottomRight: { fontSize: 16, fontFamily: 'Urbanist Medium', color: COLORS.primary },
  button: { marginVertical: 6, width: SIZES.width - 32, borderRadius: 30 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});

export default Signup;
