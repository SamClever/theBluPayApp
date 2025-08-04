// src/screens/PhotoIdCard.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  PermissionsAndroid,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-virtualized-view';
import { useNavigation } from '@react-navigation/native';
import { launchCamera, CameraOptions } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeProvider';
import { COLORS, SIZES, icons, illustrations } from '../constants';
import Header from '../components/Header';
import CustomAlertModal from '../components/CustomAlertModal';

const baseUrl = 'https://theblupayapi.com';

type NavigationProps = {
  navigate: (screen: string, params?: any) => void;
};

const PhotoIdCard = () => {
  const navigation = useNavigation<NavigationProps>();
  const { colors, dark } = useTheme();
  const [idUri, setIdUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Custom Alert States
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('Information');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info' | 'custom'>('custom');
  const [alertCallback, setAlertCallback] = useState<(() => void) | null>(null);

  // Request CAMERA permission on Android
  async function ensureCameraPermission() {
    if (Platform.OS !== 'android') return true;
    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA
    );
    if (status !== 'granted') {
      setAlertMessage('Camera access is needed to take your ID photo. Please enable camera permissions in your device settings.');
      setAlertTitle('Permission Required');
      setAlertType('warning');
      setAlertVisible(true);
      return false;
    }
    return true;
  }

  // Upload the image file to your API
  const uploadIdPhoto = async (uri: string) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('identity_image', {
      uri,
      name: 'id_card.jpg',
      type: 'image/jpeg',
    } as any);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setAlertMessage('Your session has expired. Please sign in again.');
        setAlertTitle('Authentication Required');
        setAlertType('error');
        setAlertCallback(() => () => navigation.navigate('Login'));
        setAlertVisible(true);
        return;
      }

      const res = await fetch(
        `${baseUrl}/Account/kyc/step2/`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        }
      );

      if (!res.ok) {
        const errJson = await res.json();
        console.warn('Upload error:', errJson);
        let errorMessage = 'Failed to upload ID photo. Please try again.';
        
        if (errJson?.detail) {
          errorMessage = errJson.detail;
        } else if (errJson?.message) {
          errorMessage = errJson.message;
        }
        
        setAlertMessage(errorMessage);
        setAlertTitle('Upload Failed');
        setAlertType('error');
        setAlertVisible(true);
      } else {
        const responseData = await res.json();
        console.log('✅ Upload successful:', responseData);
        
        setAlertMessage('ID photo uploaded successfully! Please proceed to take your selfie.');
        setAlertTitle('Upload Successful');
        setAlertType('success');
        setAlertCallback(() => () => navigation.navigate('SelfieWithIdCard'));
        setAlertVisible(true);
      }
    } catch (err) {
      console.error('❌ Upload error:', err);
      setAlertMessage('Network connection error. Please check your internet connection and try again.');
      setAlertTitle('Network Error');
      setAlertType('error');
      setAlertVisible(true);
    } finally {
      setUploading(false);
    }
  };

  // Take a photo, then upload it
  const takePhoto = async () => {
    if (!(await ensureCameraPermission())) return;

    const options: CameraOptions = { 
      mediaType: 'photo', 
      quality: 0.8,
      includeBase64: false,
      saveToPhotos: false,
    };
    
    launchCamera(options, async resp => {
      if (resp.didCancel) return;
      if (resp.errorCode) {
        setAlertMessage(resp.errorMessage || 'Camera error occurred. Please try again.');
        setAlertTitle('Camera Error');
        setAlertType('error');
        setAlertVisible(true);
        return;
      }
      if (resp.assets && resp.assets[0]) {
        const uri = resp.assets[0].uri;
        if (uri) {
          setIdUri(uri);
          await uploadIdPhoto(uri);
        }
      }
    });
  };

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Photo ID Card" />
        
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.contentContainer}>
            <View style={styles.headerSection}>
              {/* <Text style={[styles.title, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                Capture Your ID Card
              </Text> */}
              
              <Text style={[styles.subtitle, { color: dark ? COLORS.grayscale700 : COLORS.greyscale900 }]}>
                Please point the camera at your ID card and ensure all details are clearly visible
              </Text>
            </View>
            
            <View style={styles.scanSection}>
              <View
                style={[
                  styles.scanContainer,
                  { 
                    backgroundColor: dark ? COLORS.dark2 : COLORS.white,
                    borderColor: dark ? COLORS.dark3 : COLORS.grayscale200,
                  },
                ]}
              >
                {idUri ? (
                  <Image
                    source={{ uri: idUri }}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.placeholderContainer}>
                    <Image
                      source={illustrations.nida as ImageSourcePropType}
                      style={styles.placeholderImage}
                      resizeMode="contain"
                    />
                    <Text style={[styles.placeholderText, { color: dark ? COLORS.greyscale500 : COLORS.grayscale700 }]}>
                      Your ID card will appear here
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.instructionsSection}>
              {/* <Text style={[styles.instructionsTitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                Tips for best results:
              </Text> */}
              <View style={styles.instructionsList}>
                <View style={styles.instructionItem}>
                  <View style={[styles.bulletPoint, { backgroundColor: COLORS.primary }]} />
                  <Text style={[styles.instructionText, { color: dark ? COLORS.greyscale500 : COLORS.grayscale700 }]}>
                    Ensure good lighting
                  </Text>
                </View>
                <View style={styles.instructionItem}>
                  <View style={[styles.bulletPoint, { backgroundColor: COLORS.primary }]} />
                  <Text style={[styles.instructionText, { color: dark ? COLORS.greyscale500 : COLORS.grayscale700 }]}>
                    Keep the card flat and steady
                  </Text>
                </View>
                <View style={styles.instructionItem}>
                  <View style={[styles.bulletPoint, { backgroundColor: COLORS.primary }]} />
                  <Text style={[styles.instructionText, { color: dark ? COLORS.greyscale500 : COLORS.grayscale700 }]}>
                    Make sure all text is readable
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Camera button container */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.cameraBtn, uploading && styles.cameraBtnDisabled]}
          onPress={takePhoto}
          disabled={uploading}
        >
          <Image
            source={icons.camera as ImageSourcePropType}
            style={[styles.cameraIcon, uploading && styles.cameraIconDisabled]}
            resizeMode="contain"
          />
        </TouchableOpacity>
        {uploading && (
          <Text style={[styles.uploadingText, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
            Uploading your ID photo...
          </Text>
        )}
      </View>

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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Urbanist Bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Urbanist Regular',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  scanSection: { 
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  scanContainer: {
    width: SIZES.width * 0.75,
    height: SIZES.width * 0.75,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  cardImage: { 
    width: 300, 
    height: 400
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  placeholderText: {
    fontSize: 14,
    fontFamily: 'Urbanist Medium',
    textAlign: 'center',
    lineHeight: 20,
  },
  instructionsSection: {
    paddingHorizontal: 20,
    alignItems: 'flex-start',
  },
  instructionsTitle: {
    fontSize: 18,
    fontFamily: 'Urbanist SemiBold',
    textAlign: 'left',
    marginBottom: -10,
    marginLeft: 17,
    
  },
  instructionsList: {
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 20,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 16,
    marginTop: 2,
  },
  instructionText: {
    fontSize: 15,
    fontFamily: 'Urbanist Regular',
    lineHeight: 22,
    flex: 1,
    textAlign: 'left',
    
    
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  uploadingText: {
    marginTop: 16,
    fontFamily: 'Urbanist Medium',
    fontSize: 14,
    textAlign: 'center',
  },
  cameraBtn: {
    height: 80,
    width: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  cameraBtnDisabled: {
    backgroundColor: COLORS.grayscale400,
    shadowOpacity: 0.1,
  },
  cameraIcon: { 
    height: 32, 
    width: 32, 
    tintColor: COLORS.white 
  },
  cameraIconDisabled: {
    tintColor: COLORS.greyscale600,
  },
});

export default PhotoIdCard;
