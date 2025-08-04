import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TouchableWithoutFeedback, FlatList, TextInput, Image, ImageSourcePropType, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableWithoutFeedback as TouchableWithoutFeedbackBase } from 'react-native';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { COLORS, SIZES, FONTS, icons } from '../constants';
import Header from '../components/Header';
import { reducer } from '../utils/reducers/formReducers';
import { validateInput } from '../utils/actions/formActions';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ImageLibraryOptions, ImagePickerResponse, launchImageLibrary } from 'react-native-image-picker';
import Input from '../components/Input';
import { getFormatedDate } from "react-native-modern-datepicker";
import DatePickerModal from '../components/DatePickerModal';
import Button from '../components/Button';
import CustomAlertModal from '../components/CustomAlertModal';
import { useTheme } from '../theme/ThemeProvider';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const isTestMode = true;

const initialState = {
  inputValues: {
    firstName: '',
    lastName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    mobile: '',
  },
  inputValidities: {
    firstName: false,
    lastName: false,
    addressLine1: false,
    addressLine2: false,
    city: false,
    state: false,
    zipCode: false,
    mobile: false,
  },
  formIsValid: false,
}


type NavigationProps = {
  navigate: (screen: string, params?: any) => void;
};

const FillYourProfile = () => {
  const navigation = useNavigation<NavigationProps>();
  const [image, setImage] = useState<any>(null);
  const [error, setError] = useState();
  const [formState, dispatchFormState] = useReducer(reducer, initialState);
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
  const [gender, setGender] = useState(''); // Empty by default to show "Select Gender"
  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const genderOptions = [
    { label: 'Select Gender', value: '' },
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
  ];

  // Custom Alert States
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('Information');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info' | 'custom'>('custom');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { colors, dark } = useTheme();

  const today = new Date();
  const startDate = getFormatedDate(
    new Date(today.setDate(today.getDate() + 1)),
    "YYYY/MM/DD");

  const [startedDate, setStartedDate] = useState('');

  // Ensure date picker always returns English numerals
  const handleDateChange = (date: string) => {
    setStartedDate(toEnglishDigits(date));
  }

  const handleOnPressStartDate = () => {
    setOpenStartDatePicker(!openStartDatePicker);
  };

  const inputChangedHandler = useCallback(
    (inputId: string, inputValue: string) => {
      const result = validateInput(inputId, inputValue)
      dispatchFormState({
        inputId,
        validationResult: result,
        inputValue,
      })
    }, [dispatchFormState]);

  // Show custom alert helper function
  const showCustomAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' | 'custom' = 'custom') => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  useEffect(() => {
    if (error) {
      showCustomAlert('An error occurred', error, 'error');
    }
  }, [error]);

  // Fetch codes from rescountries api
  useEffect(() => {
    fetch("https://restcountries.com/v2/all")
      .then(response => response.json())
      .then(data => {
        let areaData = data.map((item: any) => {
          return {
            code: item.alpha2Code,
            item: item.name,
            callingCode: +item.callingCodes[0],
            flag: `https://flagsapi.com/${item.alpha2Code}/flat/64.png`
          }
        });

        setAreas(areaData);
        if (areaData.length > 0) {
          let defaultData = areaData.filter((a: any) => a.code == "US");

          if (defaultData.length > 0) {
            setSelectedArea(defaultData[0])
          }
        }
      })
  }, [])

  // Image Profile handler
  const pickImage = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.log('Image picker error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        let imageUri = response.assets[0].uri;
        setImage({ uri: imageUri });
      }
    });
  };

  // render countries codes modal
  function RenderAreasCodesModal() {
    const renderItem = ({ item }: { item: any }) => {
      return (
        <TouchableOpacity
          style={{
            padding: 10,
            flexDirection: "row"
          }}
          onPress={() => {
            setSelectedArea(item),
              setModalVisible(false)
          }}>
          <Image
            source={{ uri: item.flag }}
            resizeMode='contain'
            style={{
              height: 30,
              width: 30,
              marginRight: 10
            }}
          />
          <Text style={{ fontSize: 16, color: "#fff" }}>{item.item}</Text>
        </TouchableOpacity>
      )
    }

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}>
        <TouchableWithoutFeedback
          onPress={() => setModalVisible(false)}>
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <View
              style={{
                height: SIZES.height,
                width: SIZES.width,
                backgroundColor: COLORS.primary,
                borderRadius: 12
              }}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}>
                <Ionicons name="close-outline" size={24} color={COLORS.primary} />
              </TouchableOpacity>
              <FlatList
                data={areas}
                renderItem={renderItem}
                horizontal={false}
                keyExtractor={(item) => item.code}
                style={{
                  padding: 20,
                  marginBottom: 20
                }}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    )
  }

  // Helper to convert Arabic numerals to English numerals
  function toEnglishDigits(str: string) {
    return str.replace(/[\u0660-\u0669]/g, c => String(c.charCodeAt(0) - 0x0660))
              .replace(/[\u06F0-\u06F9]/g, c => String(c.charCodeAt(0) - 0x06F0));
  }

  // Helper to format date for display (DD/MM/YYYY to MM/DD/YYYY)
  function formatDateForDisplay(dateStr: string) {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      // Convert from DD/MM/YYYY to MM/DD/YYYY for display
      return `${parts[1]}/${parts[0]}/${parts[2]}`;
    }
    return dateStr;
  }

  // Helper to calculate age from date string
  function calculateAge(dateStr: string): number {
    if (!dateStr) return 0;
    const today = new Date();
    const birthDate = new Date(dateStr.split('/').reverse().join('-'));
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Check if birthday has occurred this year
    const isBirthdayPassed = monthDiff > 0 || (monthDiff === 0 && today.getDate() >= birthDate.getDate());
    return isBirthdayPassed ? age : age - 1;
  }

  // Helper to validate mobile number format
  function isValidMobileNumber(mobile: string): boolean {
    const mobileNumber = mobile.trim();
    return mobileNumber.length === 10 && 
           mobileNumber.startsWith('0') && 
           /^\d+$/.test(mobileNumber);
  }

  // Helper to check if all required fields are filled
  function areAllRequiredFieldsFilled(): boolean {
    const requiredFields = [
      formState.inputValues.firstName.trim(),
      formState.inputValues.lastName.trim(),
      startedDate,
      formState.inputValues.addressLine1.trim(),
      formState.inputValues.city.trim(),
      formState.inputValues.state.trim(),
      formState.inputValues.zipCode.trim(),
    ];

    // Check if all fields have values (excluding addressLine2 which is optional)
    const allFieldsFilled = requiredFields.every(field => field && field.length > 0);
    
    // Check mobile number format separately
    const mobileValid = isValidMobileNumber(formState.inputValues.mobile);
    
    // Check gender selection
    const genderSelected = Boolean(gender && gender.length > 0);
    

    
    // If all fields are filled, mobile is valid, and gender is selected, also check age requirement
    if (allFieldsFilled && mobileValid && genderSelected && startedDate) {
      const age = calculateAge(startedDate);
      return age >= 18;
    }
    
    return allFieldsFilled && mobileValid && genderSelected;
  }

  // Submit handler for KYC API
  const handleSubmit = async () => {
    // Validate all mandatory fields
    const validationErrors = [];

    // First Name validation
    if (!formState.inputValues.firstName.trim()) {
      validationErrors.push('First Name is required');
    }

    // Last Name validation
    if (!formState.inputValues.lastName.trim()) {
      validationErrors.push('Last Name is required');
    }

    // Date of Birth validation
    if (!startedDate) {
      validationErrors.push('Date of Birth is required');
    } else {
      // Validate age (must be 18 or older)
      const today = new Date();
      const birthDate = new Date(startedDate.split('/').reverse().join('-'));
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      // Check if birthday has occurred this year
      const isBirthdayPassed = monthDiff > 0 || (monthDiff === 0 && today.getDate() >= birthDate.getDate());
      const actualAge = isBirthdayPassed ? age : age - 1;
      
      if (actualAge < 18) {
        showCustomAlert('Age Restriction', 'Must be 18 years or older', 'warning');
        return;
      }
    }

    // Address Line 1 validation
    if (!formState.inputValues.addressLine1.trim()) {
      validationErrors.push('Address Line 1 is required');
    }

    // City validation
    if (!formState.inputValues.city.trim()) {
      validationErrors.push('City is required');
    }

    // State validation
    if (!formState.inputValues.state.trim()) {
      validationErrors.push('State is required');
    }

    // Zip Code validation
    if (!formState.inputValues.zipCode.trim()) {
      validationErrors.push('Zip Code is required');
    }

    // Gender validation
    if (!gender || gender === '') {
      validationErrors.push('Please select your gender (Male or Female)');
    }

    // Mobile validation
    const mobileNumber = formState.inputValues.mobile.trim();
    if (!mobileNumber) {
      validationErrors.push('Mobile number is required');
    } else {
      // Check if it's exactly 10 digits
      if (mobileNumber.length !== 10) {
        validationErrors.push('Mobile number must be exactly 10 digits');
      }
      // Check if it starts with 0
      else if (!mobileNumber.startsWith('0')) {
        validationErrors.push('Mobile number must start with 0');
      }
      // Check if it contains only numbers
      else if (!/^\d+$/.test(mobileNumber)) {
        validationErrors.push('Mobile number must contain only numbers');
      }
    }

    // If there are validation errors, show them all at once
    if (validationErrors.length > 0) {
      showCustomAlert('Required Fields Missing', 'Please fill in all required fields', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      // Convert date to YYYY-MM-DD format
      const formattedDate = startedDate ? startedDate.split('/').reverse().join('-') : '';
      
      const payload = {
        First_name: formState.inputValues.firstName.trim(),
        Last_name: formState.inputValues.lastName.trim(),
        date_of_birth: formattedDate,
        gender: gender,
        address_line1: formState.inputValues.addressLine1.trim(),
        address_line2: formState.inputValues.addressLine2.trim(),
        city: formState.inputValues.city.trim(),
        state: formState.inputValues.state.trim(),
        zip_code: formState.inputValues.zipCode.trim(),
        mobile: formState.inputValues.mobile.trim(),
      };
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('https://theblupayapi.com/Account/kyc/step4/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log('KYC response:', response.status, data);
      if (response.ok) {
        showCustomAlert('Success', data.message || 'KYC submitted successfully!', 'success');
                        navigation.navigate('ReviewInfo');
      } else {
        // Format API validation errors for better display
        let errorMessage = data.message || 'Validation failed';
        
        if (data.First_name) {
          errorMessage += '\n• First Name: ' + data.First_name.join(', ');
        }
        if (data.Last_name) {
          errorMessage += '\n• Last Name: ' + data.Last_name.join(', ');
        }
        if (data.date_of_birth) {
          errorMessage += '\n• Date of Birth: ' + data.date_of_birth.join(', ');
        }
        if (data.mobile) {
          errorMessage += '\n• Mobile: ' + data.mobile.join(', ');
        }
        if (data.address_line1) {
          errorMessage += '\n• Address Line 1: ' + data.address_line1.join(', ');
        }
        if (data.city) {
          errorMessage += '\n• City: ' + data.city.join(', ');
        }
        if (data.state) {
          errorMessage += '\n• State: ' + data.state.join(', ');
        }
        if (data.zip_code) {
          errorMessage += '\n• Zip Code: ' + data.zip_code.join(', ');
        }
        
        showCustomAlert('Validation Error', errorMessage, 'error');
      }
          } catch (err: any) {
        showCustomAlert('Network Error', err.message || 'Unable to connect to the server', 'error');
      } finally {
        setIsSubmitting(false);
      }
  };

  return (
    <View style={[styles.area, { backgroundColor: colors.background }]}> 
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={[styles.container, { backgroundColor: colors.background }]}> 
          <View style={styles.headerContainer}>
            <Header title="Fill Your Profile" />
          </View>
        
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          automaticallyAdjustKeyboardInsets={false}
        >
          <View style={styles.formContainer}>
            {/* Profile Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: COLORS.transparentPrimary }]}>
                  <Feather name="user" size={20} color={COLORS.primary} />
                </View>
                <Text style={[styles.sectionTitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                  Personal Information
                </Text>
              </View>
              <View style={styles.inputGroup}>
                <Input
                  id="firstName"
                  onInputChanged={inputChangedHandler}
                  errorText={formState.inputValidities['firstName']}
                  placeholder="First Name *"
                  placeholderTextColor={COLORS.grayscale700}
                  value={formState.inputValues['firstName']}
                />
                <Input
                  id="lastName"
                  onInputChanged={inputChangedHandler}
                  errorText={formState.inputValidities['lastName']}
                  placeholder="Last Name *"
                  placeholderTextColor={COLORS.grayscale700}
                  value={formState.inputValues['lastName']}
                />
              </View>
            </View>

            {/* Date of Birth and Gender Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: COLORS.transparentPrimary }]}>
                  <Feather name="calendar" size={20} color={COLORS.primary} />
                </View>
                <Text style={[styles.sectionTitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                  Personal Details
                </Text>
              </View>
              <View style={styles.dateGenderRow}>
                <View style={styles.halfWidth}>
                  <TouchableOpacity
                    style={[styles.datePickerButton, {
                      backgroundColor: dark ? COLORS.dark2 : COLORS.white,
                      borderColor: dark ? COLORS.dark3 : COLORS.grayscale200,
                    }]}
                    onPress={handleOnPressStartDate}
                  >
                    <View style={styles.datePickerContent}>
                      <Text style={[styles.datePickerText, { 
                        color: startedDate ? (dark ? COLORS.white : COLORS.greyscale900) : COLORS.grayscale700
                      }]}>
                        {startedDate ? formatDateForDisplay(startedDate) : 'Date of Birth *'}
                      </Text>
                      <Feather name="calendar" size={18} color={COLORS.primary} />
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={styles.halfWidth}>
                  <TouchableWithoutFeedbackBase onPress={() => setGenderModalVisible(false)}>
                    <View style={styles.dropdownContainer}>
                      <TouchableOpacity
                        style={[styles.genderButton, {
                          backgroundColor: dark ? COLORS.dark2 : COLORS.white,
                          borderColor: genderModalVisible ? COLORS.primary : (dark ? COLORS.dark3 : COLORS.grayscale200),
                        }]}
                        onPress={() => setGenderModalVisible(!genderModalVisible)}
                      >
                        <View style={styles.genderButtonContent}>
                          <Text style={[styles.genderButtonText, { 
                            color: gender ? (dark ? COLORS.white : COLORS.greyscale900) : COLORS.grayscale700
                          }]}>
                            {genderOptions.find(g => g.value === gender)?.label || 'Select Gender *'}
                          </Text>
                          <Feather 
                            name={genderModalVisible ? "chevron-up" : "chevron-down"} 
                            size={18} 
                            color={COLORS.primary} 
                          />
                        </View>
                      </TouchableOpacity>
                      
                      {/* Dropdown Options */}
                      {genderModalVisible && (
                        <View style={[styles.dropdownOptions, {
                          backgroundColor: dark ? COLORS.dark2 : COLORS.white,
                          borderColor: dark ? COLORS.dark3 : COLORS.grayscale200,
                        }]}>
                          {genderOptions.filter(option => option.value !== '').map(option => (
                            <TouchableOpacity
                              key={option.value}
                              style={[styles.dropdownOption, {
                                backgroundColor: gender === option.value ? COLORS.transparentPrimary : 'transparent',
                              }]}
                              onPress={() => {
                                setGender(option.value);
                                setGenderModalVisible(false);
                              }}
                            >
                              <Text style={[styles.dropdownOptionText, { 
                                color: gender === option.value ? COLORS.primary : (dark ? COLORS.white : COLORS.greyscale900)
                              }]}>
                                {option.label}
                              </Text>
                              {gender === option.value && (
                                <Feather name="check" size={16} color={COLORS.primary} />
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  </TouchableWithoutFeedbackBase>
                </View>
              </View>
              {/* Static Age Indicator - Always show if date is selected */}
              {startedDate && (
                <View style={styles.ageIndicator}>
                  <View style={[styles.ageBadge, { 
                    backgroundColor: calculateAge(startedDate) >= 18 ? COLORS.transparentPrimary : COLORS.transparentRed 
                  }]}>
                    <Text style={[styles.ageText, { 
                      color: calculateAge(startedDate) >= 18 ? COLORS.success : COLORS.warning
                    }]}>
                      Age: {calculateAge(startedDate)} years old {calculateAge(startedDate) >= 18 ? '✓' : '⚠'}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Address Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: COLORS.transparentPrimary }]}>
                  <Feather name="map-pin" size={20} color={COLORS.primary} />
                </View>
                <Text style={[styles.sectionTitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                  Address Information
                </Text>
              </View>
              <View style={styles.inputGroup}>
                <Input
                  id="addressLine1"
                  onInputChanged={inputChangedHandler}
                  errorText={formState.inputValidities['addressLine1']}
                  placeholder="Address Line 1 *"
                  placeholderTextColor={COLORS.grayscale700}
                  value={formState.inputValues['addressLine1']}
                />
                <Input
                  id="addressLine2"
                  onInputChanged={inputChangedHandler}
                  errorText={formState.inputValidities['addressLine2']}
                  placeholder="Address Line 2 (Optional)"
                  placeholderTextColor={COLORS.grayscale700}
                  value={formState.inputValues['addressLine2']}
                />
              </View>
              <View style={styles.addressRow}>
                <View style={styles.halfWidth}>
                  <Input
                    id="city"
                    onInputChanged={inputChangedHandler}
                    errorText={formState.inputValidities['city']}
                    placeholder="City *"
                    placeholderTextColor={COLORS.grayscale700}
                    value={formState.inputValues['city']}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Input
                    id="state"
                    onInputChanged={inputChangedHandler}
                    errorText={formState.inputValidities['state']}
                    placeholder="State *"
                    placeholderTextColor={COLORS.grayscale700}
                    value={formState.inputValues['state']}
                  />
                </View>
              </View>
              <Input
                id="zipCode"
                onInputChanged={inputChangedHandler}
                errorText={formState.inputValidities['zipCode']}
                placeholder="Zip Code *"
                placeholderTextColor={COLORS.grayscale700}
                value={formState.inputValues['zipCode']}
                keyboardType="numeric"
              />
            </View>

            {/* Contact Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: COLORS.transparentPrimary }]}>
                  <Feather name="phone" size={20} color={COLORS.primary} />
                </View>
                <Text style={[styles.sectionTitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                  Contact Information
                </Text>
              </View>
              <Input
                id="mobile"
                onInputChanged={inputChangedHandler}
                errorText={formState.inputValidities['mobile']}
                placeholder="Mobile Number * (e.g., 0779791909)"
                placeholderTextColor={COLORS.grayscale700}
                value={formState.inputValues['mobile']}
                keyboardType="phone-pad"
                maxLength={10}
              />
              {/* Static Mobile Validation - Always show if mobile has value */}
              {formState.inputValues.mobile && (
                <View style={styles.validationIndicator}>
                  <View style={[styles.validationBadge, { 
                    backgroundColor: isValidMobileNumber(formState.inputValues.mobile) ? COLORS.transparentPrimary : COLORS.transparentRed 
                  }]}>
                    <Text style={[styles.validationText, { 
                      color: isValidMobileNumber(formState.inputValues.mobile) ? COLORS.success : COLORS.warning
                    }]}>
                      {isValidMobileNumber(formState.inputValues.mobile) 
                        ? '✓ Valid mobile number format' 
                        : '⚠ Must be 10 digits starting with 0'
                      }
                    </Text>
                  </View>
                </View>
              )}
            </View>
            
            {/* Submit Button */}
            <View style={styles.buttonContainer}>
              <Button
                title={isSubmitting ? "Submitting..." : "Continue"}
                filled
                style={[styles.continueButton, {
                  backgroundColor: COLORS.primary,
                  borderColor: COLORS.primary,
                }]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              />
            </View>
          </View>
        </ScrollView>
        </View>
      </KeyboardAvoidingView>



      <DatePickerModal
        open={openStartDatePicker}
        startDate={''}
        selectedDate={
          startedDate && !isNaN(Date.parse(startedDate))
            ? startedDate
            : new Date().toISOString().slice(0, 10)
        }
        onClose={() => setOpenStartDatePicker(false)}
        onChangeStartDate={handleDateChange}
      />
      {RenderAreasCodesModal()}
      
      {/* Custom Alert Modal */}
      <CustomAlertModal
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        buttonText="Okay"
        autoClose={alertType === 'success'}
        autoCloseDelay={2000}
      />
      
      {/* Loading Overlay */}
      {isSubmitting && (
        <View style={[styles.loadingOverlay, { 
          backgroundColor: dark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)' 
        }]}>
          <View style={[styles.loadingContent, { 
            backgroundColor: dark ? COLORS.dark2 : COLORS.white,
            borderColor: dark ? COLORS.dark3 : COLORS.grayscale200,
          }]}>
            <View style={[styles.loadingIcon, { backgroundColor: COLORS.transparentPrimary }]}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
            <Text style={[styles.loadingText, { 
              color: dark ? COLORS.white : COLORS.greyscale900 
            }]}>
              Submitting...
            </Text>
          </View>
        </View>
      )}
    </View>
  )
};

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: COLORS.white
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.white,
    position: 'relative',
    minHeight: '100%',
  },
  avatarContainer: {
    marginVertical: 12,
    alignItems: "center",
    width: 10,
    height: 130,
    borderRadius: 65,
  },
  avatar: {
    height: 130,
    width: 130,
    borderRadius: 65,
  },
  pickImage: {
    height: 42,
    width: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  inputContainer: {
    flexDirection: "row",
    borderColor: COLORS.greyscale500,
    borderWidth: 1,
    borderRadius: 12,
    height: 48,
    width: SIZES.width - 32,
    alignItems: 'center',
    marginVertical: 2,
    backgroundColor: COLORS.greyscale500,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  downIcon: {
    width: 10,
    height: 10,
    tintColor: "#111"
  },
  selectFlagContainer: {
    width: 90,
    height: 50,
    marginHorizontal: 5,
    flexDirection: "row",
  },
  flagIcon: {
    width: 30,
    height: 30
  },
  input: {
    flex: 1,
    marginVertical: 5,
    height: 40,
    fontSize: 14,
    color: "#111"
  },
  inputBtn: {
    borderWidth: 1,
    borderRadius: 12,
    borderColor: COLORS.greyscale500,
    height: 48,
    paddingLeft: 16,
    fontSize: 16,
    justifyContent: "space-between",
    backgroundColor: COLORS.greyscale500,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 16,
    paddingVertical: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between"
  },

  continueButton: {
    width: SIZES.width - 40,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  closeBtn: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    position: "absolute",
    right: 16,
    top: 32,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  },
  headerLogo: {
    width: 24,
    height: 24,
    marginRight: 8,
    tintColor: COLORS.primary
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Urbanist Medium',
    marginTop: 12,
  },
  ageRequirement: {
    fontSize: 12,
    fontFamily: 'Urbanist Regular',
    marginTop: 4,
    marginLeft: 8,
    fontStyle: 'italic',
  },
  requiredFieldsNote: {
    fontSize: 14,
    fontFamily: 'Urbanist Medium',
    textAlign: 'center',
    marginBottom: 8,
  },
  mobileValidation: {
    fontSize: 12,
    fontFamily: 'Urbanist Regular',
    marginTop: 4,
    marginLeft: 8,
  },
  formContainer: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  buttonContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  headerContainer: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Urbanist SemiBold',
    color: COLORS.greyscale900,
  },
  inputGroup: {
    gap: 12,
    marginBottom: 0,
  },
  datePickerButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  datePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  datePickerText: {
    fontSize: 16,
    fontFamily: 'Urbanist Regular',
    marginRight: 10,
  },
  ageIndicator: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  ageText: {
    fontSize: 14,
    fontFamily: 'Urbanist Regular',
  },
  genderButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  genderButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  genderButtonText: {
    fontSize: 16,
    fontFamily: 'Urbanist Regular',
    marginRight: 10,
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 12,
  },
  dateGenderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  dropdownOptions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1001,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  dropdownOptionText: {
    fontSize: 16,
    fontFamily: 'Urbanist Regular',
  },
  validationIndicator: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  validationText: {
    fontSize: 12,
    fontFamily: 'Urbanist Regular',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Urbanist SemiBold',
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: 'Urbanist Regular',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    width: '100%',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  modalOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  modalCancelButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontFamily: 'Urbanist Medium',
  },
  modalOptionText: {
    fontSize: 16,
    fontFamily: 'Urbanist Regular',
  },
  loadingContent: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  ageBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  validationBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  checkIcon: {
    position: 'absolute',
    right: 10,
  },
  loadingIcon: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
})

export default FillYourProfile