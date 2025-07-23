import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Modal, TouchableWithoutFeedback, FlatList, TextInput, Image, ImageSourcePropType } from 'react-native';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { COLORS, SIZES, FONTS, icons } from '../constants';
import { SafeAreaView } from 'react-native-safe-area-context';
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

type Nav = {
  navigate: (value: string) => void
}

const FillYourProfile = () => {
  const { navigate } = useNavigation<Nav>();
  const [image, setImage] = useState<any>(null);
  const [error, setError] = useState();
  const [formState, dispatchFormState] = useReducer(reducer, initialState);
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
  const [gender, setGender] = useState('female');
  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const genderOptions = [
    { label: 'Female', value: 'female' },
    { label: 'Male', value: 'male' },
  ];

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

  useEffect(() => {
    if (error) {
      Alert.alert('An error occured', error)
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

  // Submit handler for KYC API
  const handleSubmit = async () => {
    try {
      const payload = {
        First_name: formState.inputValues.firstName,
        Last_name: formState.inputValues.lastName,
        date_of_birth: toEnglishDigits(startedDate),
        gender: gender,
        address_line1: formState.inputValues.addressLine1,
        address_line2: formState.inputValues.addressLine2,
        city: formState.inputValues.city,
        state: formState.inputValues.state,
        zip_code: formState.inputValues.zipCode,
        mobile: formState.inputValues.mobile,
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
        Alert.alert('Success', data.message || 'KYC submitted successfully!');
        navigate('CreateNewPIN');
      } else {
        Alert.alert('KYC Error', data.message ?? JSON.stringify(data, null, 2));
      }
    } catch (err: any) {
      Alert.alert('Network Error', err.message || 'Unable to connect to the server');
    }
  };

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}> 
      <View style={[styles.container, { backgroundColor: colors.background }]}> 
        <Header title="Fill Your Profile" />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ alignItems: "center", marginVertical: 12 }}>
            {/* <View style={styles.avatarContainer}> */}
              {/* <Image
                source={image === null ? icons.userDefault2 : image}
                resizeMode="cover"
                style={styles.avatar} /> */}
              {/* <TouchableOpacity
                onPress={pickImage}
                style={styles.pickImage}>
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={24}
                  color={COLORS.white} />
              </TouchableOpacity> */}
            {/* </View> */}
          </View>
          <View>
            <Input
              id="firstName"
              onInputChanged={inputChangedHandler}
              errorText={formState.inputValidities['firstName']}
              placeholder="First Name"
              placeholderTextColor={COLORS.gray}
              value={formState.inputValues['firstName']}
            />
            <Input
              id="lastName"
              onInputChanged={inputChangedHandler}
              errorText={formState.inputValidities['lastName']}
              placeholder="Last Name"
              placeholderTextColor={COLORS.gray}
              value={formState.inputValues['lastName']}
            />
            <TouchableOpacity
              style={[styles.inputBtn, {
                backgroundColor: dark ? COLORS.dark2 : COLORS.greyscale500,
                borderColor: dark ? COLORS.dark2 : COLORS.greyscale500,
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 12,
              }]}
              onPress={handleOnPressStartDate}
            >
              <Text style={{ color: startedDate ? COLORS.gray : COLORS.grayscale400, flex: 1 }}>
                {startedDate ? toEnglishDigits(startedDate) : 'Date of Birth'}
              </Text>
              <Feather name="calendar" size={24} color={COLORS.grayscale400} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.inputBtn, {
                backgroundColor: dark ? COLORS.dark2 : COLORS.greyscale500,
                borderColor: dark ? COLORS.dark2 : COLORS.greyscale500,
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 12,
              }]}
              onPress={() => setGenderModalVisible(true)}
            >
              <Text style={{ color: gender ? COLORS.gray : COLORS.grayscale400, flex: 1 }}>
                {genderOptions.find(g => g.value === gender)?.label || 'Select Gender'}
              </Text>
              <Feather name="chevron-down" size={22} color={COLORS.grayscale400} />
            </TouchableOpacity>
            {/* Gender Modal */}
            <Modal
              visible={genderModalVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setGenderModalVisible(false)}
            >
              <TouchableWithoutFeedback onPress={() => setGenderModalVisible(false)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }}>
                  <View style={{ backgroundColor: colors.background, borderRadius: 12, padding: 24, minWidth: 220 }}>
                    {genderOptions.map(option => (
                      <TouchableOpacity
                        key={option.value}
                        style={{ paddingVertical: 12 }}
                        onPress={() => { setGender(option.value); setGenderModalVisible(false); }}
                      >
                        <Text style={{ color: gender === option.value ? COLORS.primary : COLORS.gray, fontSize: 16 }}>{option.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
            <Input
              id="addressLine1"
              onInputChanged={inputChangedHandler}
              errorText={formState.inputValidities['addressLine1']}
              placeholder="Address Line 1"
              placeholderTextColor={COLORS.gray}
              value={formState.inputValues['addressLine1']}
            />
            <Input
              id="addressLine2"
              onInputChanged={inputChangedHandler}
              errorText={formState.inputValidities['addressLine2']}
              placeholder="Address Line 2"
              placeholderTextColor={COLORS.gray}
              value={formState.inputValues['addressLine2']}
            />
            <Input
              id="city"
              onInputChanged={inputChangedHandler}
              errorText={formState.inputValidities['city']}
              placeholder="City"
              placeholderTextColor={COLORS.gray}
              value={formState.inputValues['city']}
            />
            <Input
              id="state"
              onInputChanged={inputChangedHandler}
              errorText={formState.inputValidities['state']}
              placeholder="State"
              placeholderTextColor={COLORS.gray}
              value={formState.inputValues['state']}
            />
            <Input
              id="zipCode"
              onInputChanged={inputChangedHandler}
              errorText={formState.inputValidities['zipCode']}
              placeholder="Zip Code"
              placeholderTextColor={COLORS.gray}
              value={formState.inputValues['zipCode']}
              keyboardType="numeric"
            />
            <Input
              id="mobile"
              onInputChanged={inputChangedHandler}
              errorText={formState.inputValidities['mobile']}
              placeholder="Mobile"
              placeholderTextColor={COLORS.gray}
              value={formState.inputValues['mobile']}
              keyboardType="phone-pad"
            />
          </View>
        </ScrollView>
      </View>
      <DatePickerModal
        open={openStartDatePicker}
        // Pass an empty string to startDate to allow full calendar (no restriction)
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
      <View style={[styles.bottomContainer, { justifyContent: 'center' }]}> 
        <Button
          title="Continue"
          filled
          style={styles.continueButton}
          onPress={handleSubmit}
        />
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
  avatarContainer: {
    marginVertical: 12,
    alignItems: "center",
    width: 130,
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
    borderWidth: .4,
    borderRadius: 12,
    height: 52,
    width: SIZES.width - 32,
    alignItems: 'center',
    marginVertical: 12,
    backgroundColor: COLORS.greyscale500,
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
    marginVertical: 10,
    height: 40,
    fontSize: 14,
    color: "#111"
  },
  inputBtn: {
    borderWidth: 1,
    borderRadius: 12,
    borderColor: COLORS.greyscale500,
    height: 52,
    paddingLeft: 8,
    fontSize: 18,
    justifyContent: "space-between",
    marginTop: 4,
    backgroundColor: COLORS.greyscale500,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 8
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  bottomContainer: {
    position: "absolute",
    bottom: 32,
    right: 16,
    left: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    width: SIZES.width - 32,
    alignItems: "center"
  },
  continueButton: {
    width: (SIZES.width - 32) / 2 - 8,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
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
  }
})

export default FillYourProfile