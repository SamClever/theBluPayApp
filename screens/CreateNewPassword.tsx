import { View, Text, StyleSheet, ScrollView, Image, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useCallback, useReducer, useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES, icons, illustrations } from '../constants';
import Header from '../components/Header';
import { reducer } from '../utils/reducers/formReducers';
import { validateInput } from '../utils/actions/formActions';
import Input from '../components/Input';
import CheckBox from '@react-native-community/checkbox';
import Button from '../components/Button';
import { useTheme } from '../theme/ThemeProvider';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../components/CustomAlert';

type Nav = {
  navigate: (value: string) => void
}

const initialState = {
  inputValues: {
    email: '', // add email field for reset-password endpoint
    newPassword: '',
    confirmNewPassword: '',
  },
  inputValidities: {
    email: false,
    newPassword: false,
    confirmNewPassword: false,
  },
  formIsValid: false,
}

const LoadingModal = ({ visible }: { visible: boolean }) => {
  if (!visible) return null;
  return (
    <View style={{
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.3)',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
    }}>
      <View style={{
        backgroundColor: '#222',
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
      }}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: '#fff', marginTop: 12 }}>Please wait...</Text>
      </View>
    </View>
  );
};

const CreateNewPassword = () => {
  const { navigate } = useNavigation<Nav>();
  const [formState, dispatchFormState] = useReducer(reducer, initialState);
  const [isChecked, setChecked] = useState(false);
  const { colors, dark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ visible: boolean, type: 'success' | 'error', message: string }>({ visible: false, type: 'success', message: '' });
  const alertTimeout = useRef<NodeJS.Timeout | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const inputChangedHandler = useCallback(
    (inputId: string, inputValue: string) => {
      const result = validateInput(inputId, inputValue)
      dispatchFormState({
        inputId,
        validationResult: result,
        inputValue,
      })
    },
    [dispatchFormState]
  );

  const showAlert = (type: 'success' | 'error', message: string, cb?: () => void) => {
    setAlert({ visible: true, type, message });
    if (alertTimeout.current) clearTimeout(alertTimeout.current);
    alertTimeout.current = setTimeout(() => {
      setAlert({ visible: false, type, message: '' });
      if (cb) cb();
    }, 2200);
  };

  const handleChangePassword = async () => {
    const { email, newPassword, confirmNewPassword } = formState.inputValues;
    if (!email || !newPassword || !confirmNewPassword) {
      showAlert('error', 'Please fill all fields.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showAlert('error', 'New passwords do not match.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://theblupayapi.com/userAuth/reset-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          new_password: newPassword,
          confirm_password: confirmNewPassword,
        }),
      });
      const data = await response.json();
      // For debugging, log the response:
      // console.log('API response:', data);

      if (!response.ok) {
        const msg = data?.message || data?.detail || data?.error || 'Password reset failed';
        showAlert('error', msg);
        return;
      }
      showAlert('success', 'Password reset successfully.', () => navigate('Login'));
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      showAlert('error', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Reset Password" />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.illustrationContainer}>
            <Image
              source={illustrations.newPassword}
              resizeMode='contain'
              style={styles.illustration}
            />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Reset Password</Text>
          <Input
            onInputChanged={inputChangedHandler}
            errorText={formState.inputValidities['email']}
            autoCapitalize="none"
            id="email"
            placeholder="Email"
            placeholderTextColor={dark ? COLORS.greyscale400 : COLORS.greyscale600}
            icon={icons.email}
            keyboardType="email-address"
            style={[
              styles.input,
              { backgroundColor: dark ? COLORS.greyscale900 : COLORS.secondaryWhite }
            ]}
            inputStyle={{ color: colors.text }}
          />
          <Input
            onInputChanged={inputChangedHandler}
            errorText={formState.inputValidities['newPassword']}
            autoCapitalize="none"
            id="newPassword"
            placeholder="New Password"
            placeholderTextColor={dark ? COLORS.greyscale400 : COLORS.greyscale600}
            icon={icons.padlock}
            secureTextEntry={!showNew}
            style={[
              styles.input,
              { backgroundColor: dark ? COLORS.greyscale900 : COLORS.secondaryWhite }
            ]}
            inputStyle={{ color: colors.text }}
            rightIcon={
              <TouchableOpacity onPress={() => setShowNew(v => !v)}>
                <Image
                  source={showNew ? icons.eye : icons.eyeClosed}
                  style={{ width: 22, height: 22, tintColor: colors.text }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            }
          />
          <Input
            onInputChanged={inputChangedHandler}
            errorText={formState.inputValidities['confirmNewPassword']}
            autoCapitalize="none"
            id="confirmNewPassword"
            placeholder="Confirm New Password"
            placeholderTextColor={dark ? COLORS.greyscale400 : COLORS.greyscale600}
            icon={icons.padlock}
            secureTextEntry={!showConfirm}
            style={[
              styles.input,
              { backgroundColor: dark ? COLORS.greyscale900 : COLORS.secondaryWhite }
            ]}
            inputStyle={{ color: colors.text }}
            rightIcon={
              <TouchableOpacity onPress={() => setShowConfirm(v => !v)}>
                <Image
                  source={showConfirm ? icons.eye : icons.eyeClosed}
                  style={{ width: 22, height: 22, tintColor: colors.text }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            }
          />
          <View style={styles.checkBoxContainer}>
            <CheckBox
              style={styles.checkbox}
              value={isChecked}
              boxType="square"
              onTintColor={COLORS.primary}
              onFillColor={COLORS.primary}
              onCheckColor={COLORS.white}
              onValueChange={setChecked}
              tintColors={{ true: COLORS.primary, false: dark ? COLORS.greyscale600 : COLORS.greyscale400 }}
            />
            <Text style={[styles.privacy, { color: colors.text }]}>Remember me</Text>
          </View>
        </ScrollView>
        <Button
          title="Continue"
          filled
          onPress={handleChangePassword}
          style={[
            styles.button,
            { backgroundColor: COLORS.primary }
          ]}
          textStyle={{ color: COLORS.white, fontSize: 18, fontFamily: "Urbanist Medium" }}
          disabled={loading}
        />
        <LoadingModal visible={loading} />
        {/* Fix: Only render CustomAlert if it exists in your components folder */}
        {/* If you get "Cannot find module '../components/CustomAlert'", check the filename and extension: */}
        {/* It should be: /home/samclever/Music/theBluPayApp/components/CustomAlert.tsx or .js */}
        {/* If your CustomAlert is named differently, update the import accordingly: */}
        {/* import CustomAlert from '../components/CustomAlert'; */}
        {/* If you don't have this file, create it or use your inline alert as before */}
        {typeof CustomAlert === 'function' && (
          <CustomAlert
            visible={alert.visible}
            type={alert.type}
            message={alert.message}
            onDismiss={() => setAlert({ ...alert, visible: false })}
          />
        )}
      </View>
    </SafeAreaView>
  )
};

const styles = StyleSheet.create({
  area: {
    flex: 1,
    // backgroundColor: COLORS.black, // replaced by dynamic color
  },
  container: {
    flex: 1,
    padding: 16,
    // backgroundColor: COLORS.black, // replaced by dynamic color
  },
  illustrationContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 32,
  },
  illustration: {
    width: SIZES.width * 0.7,
    height: 180,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Urbanist Medium",
    // color: COLORS.white, // replaced by dynamic color
    marginBottom: 18,
    marginLeft: 4,
  },
  input: {
    // backgroundColor: COLORS.greyscale900, // replaced by dynamic color
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 0,
  },
  // inputText removed, use inline style
  checkBoxContainer: {
    flexDirection: "row",
    alignItems: 'center',
    marginVertical: 8,
    marginLeft: 2,
  },
  checkbox: {
    marginRight: Platform.OS === "ios" ? 8 : 14,
    height: 18,
    width: 18,
    borderRadius: 4,
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  privacy: {
    fontSize: 14,
    fontFamily: "Urbanist Regular",
    // color: COLORS.white, // replaced by dynamic color
  },
  button: {
    marginVertical: 18,
    width: "100%",
    borderRadius: 30,
    // backgroundColor: COLORS.primary, // handled inline
    alignSelf: "center",
  },
  // buttonText removed, use inline style
});

export default CreateNewPassword