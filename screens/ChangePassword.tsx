import { View, Text, StyleSheet, ScrollView, Image, Alert, TouchableWithoutFeedback, Modal, Platform } from 'react-native';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES, icons, illustrations } from '../constants';
import Header from '../components/Header';
import { reducer } from '../utils/reducers/formReducers';
import { validateInput } from '../utils/actions/formActions';
import Input from '../components/Input';
import CheckBox from '@react-native-community/checkbox';
import Button from '../components/Button';
import { useTheme } from '../theme/ThemeProvider';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlertModal from '../components/CustomAlertModal';

const isTestMode = true

const initialState = {
  inputValues: {
    password: isTestMode ? '' : '',
    newPassword: isTestMode ? '' : '',
    confirmNewPassword: isTestMode ? '' : '',
  },
  inputValidities: {
    password: false,
    newPassword: false,
    confirmNewPassword: false,
  },
  formIsValid: false,
}

const ChangePassword = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [formState, dispatchFormState] = useReducer(reducer, initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isChecked, setChecked] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');
  const { colors, dark } = useTheme();

  const inputChangedHandler = useCallback(
    (inputId: string, inputValue: string) => {
      const result = validateInput(inputId, inputValue)
      dispatchFormState({
        inputId,
        validationResult: result,
        inputValue,
      })
    }, [dispatchFormState])

  const changePassword = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate passwords match
      if (formState.inputValues.newPassword !== formState.inputValues.confirmNewPassword) {
        setAlertTitle('Validation Error');
        setAlertMessage('New password and confirm password do not match.');
        setAlertType('error');
        setAlertVisible(true);
        return;
      }

      // Check if all fields are filled
      if (!formState.inputValues.password || !formState.inputValues.newPassword || !formState.inputValues.confirmNewPassword) {
        setAlertTitle('Validation Error');
        setAlertMessage('Please fill in all password fields.');
        setAlertType('error');
        setAlertVisible(true);
        return;
      }

      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setAlertTitle('Authentication Error');
        setAlertMessage('Session expired. Please log in again.');
        setAlertType('error');
        setAlertVisible(true);
        navigation.navigate('Login');
        return;
      }

      const response = await fetch('https://theblupayapi.com/userAuth/change-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_password: formState.inputValues.password,
          new_password: formState.inputValues.newPassword,
          confirm_password: formState.inputValues.confirmNewPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success
        setModalVisible(true);
      } else {
        // Error from API
        const errorMessage = data.message || data.error || 'Failed to change password. Please try again.';
        setAlertTitle('Error');
        setAlertMessage(errorMessage);
        setAlertType('error');
        setAlertVisible(true);
      }
    } catch (error: any) {
      console.error('Change password error:', error);
      setAlertTitle('Network Error');
      setAlertMessage('Unable to connect to server. Please check your internet connection and try again.');
      setAlertType('error');
      setAlertVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Render modern alert modal
  const renderAlertModal = () => (
    <CustomAlertModal
      visible={alertVisible}
      onClose={() => setAlertVisible(false)}
      title={alertTitle}
      message={alertMessage}
      buttonText="OK"
    />
  );

  // Render modal
  const renderModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}>
        <TouchableWithoutFeedback
          onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={[styles.modalSubContainer, { backgroundColor: dark ? COLORS.dark2 : COLORS.white }]}>
              <Image
                source={illustrations.passwordSuccess}
                resizeMode='contain'
                style={styles.modalIllustration}
              />
              <Text style={styles.modalTitle}>Password Changed!</Text>
              <Text style={[styles.modalSubtitle, {
                color: dark ? COLORS.greyscale300 : COLORS.greyscale600,
              }]}>Your password has been successfully changed. For security reasons, you will be logged out and need to log in again with your new password.</Text>
              <Button
                title="Continue"
                filled
                onPress={() => {
                  setModalVisible(false);
                  // Clear token and navigate to login
                  AsyncStorage.removeItem('token');
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                  });
                }}
                style={{
                  width: "100%",
                  marginTop: 12
                }}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    )
  }

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Change Password" />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.logoContainer}>
            <Image
              source={dark ? illustrations.passwordSuccessDark : illustrations.newPassword}
              resizeMode='contain'
              style={styles.success}
            />
          </View>
          <Text style={[styles.title, { color: dark ? COLORS.white : COLORS.black }]}>Change Password</Text>
          <Input
            onInputChanged={inputChangedHandler}
            errorText={formState.inputValidities['password']}
            autoCapitalize="none"
            id="password"
            placeholder="Current Password"
            placeholderTextColor={dark ? COLORS.grayTie : COLORS.black}
            icon={icons.padlock}
            secureTextEntry={true}
            value={formState.inputValues.password}
          />
          <Input
            onInputChanged={inputChangedHandler}
            errorText={formState.inputValidities['newPassword']}
            autoCapitalize="none"
            id="newPassword"
            placeholder="New Password"
            placeholderTextColor={dark ? COLORS.grayTie : COLORS.black}
            icon={icons.padlock}
            secureTextEntry={true}
            value={formState.inputValues.newPassword}
          />
          <Input
            onInputChanged={inputChangedHandler}
            errorText={formState.inputValidities['confirmNewPassword']}
            autoCapitalize="none"
            id="confirmNewPassword"
            placeholder="Confirm New Password"
            placeholderTextColor={dark ? COLORS.grayTie : COLORS.black}
            icon={icons.padlock}
            secureTextEntry={true}
            value={formState.inputValues.confirmNewPassword}
          />
          <View style={styles.spacer}>
          </View>
        </ScrollView>
        <Button
          title="Change Password"
          filled
          onPress={changePassword}
          isLoading={isLoading}
          style={styles.button}
        />
        {renderModal()}
        {renderAlertModal()}
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
  success: {
    width: SIZES.width * 0.8,
    height: 250
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 52
  },
  title: {
    fontSize: 18,
    fontFamily: "Urbanist Medium",
    color: COLORS.black,
    marginVertical: 12
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
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: "Urbanist Bold",
    color: COLORS.primary,
    textAlign: "center",
    marginVertical: 12
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: "Urbanist Regular",
    color: COLORS.greyscale600,
    textAlign: "center",
    marginVertical: 12
  },
  modalContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.2)"
  },
  modalSubContainer: {
    height: 494,
    width: SIZES.width * 0.9,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 16
  },
  modalIllustration: {
    height: 180,
    width: 180,
    marginVertical: 22
  },
  spacer: {
    marginVertical: 18
  }
})

export default ChangePassword