// src/screens/PhotoIdCard.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image as RNImage,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-virtualized-view';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { launchCamera, CameraOptions } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeProvider';
import { COLORS, icons, illustrations } from '../constants';

// 1️⃣ Pull this URL from one place
const baseUrl = 'https://blupay.zakedebt.co.tz';

// Navigation params (extend as needed)
type RootStackParamList = {
  PhotoIdCard: undefined;
  SelfieWithIdCard: undefined;
};

const PhotoIdCard = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { dark } = useTheme();
  const [idUri, setIdUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Request CAMERA permission on Android
  async function ensureCameraPermission() {
    if (Platform.OS !== 'android') return true;
    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA
    );
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera access is needed to take your ID photo.'
      );
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
      const token = await AsyncStorage.getItem('userToken');  // or 'accessToken', whichever you use
      const res = await fetch(
        `${baseUrl}/Account/kyc/step2/`,
        {
          method: 'POST',
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        }
      );

      if (!res.ok) {
        const errJson = await res.json();
        console.warn('Upload error:', errJson);
        Alert.alert('Upload failed', JSON.stringify(errJson));
      } else {
        await res.json();
        Alert.alert('Success', 'ID photo uploaded successfully.');
        navigation.navigate('SelfieWithIdCard');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Network error', 'Could not upload image.');
    } finally {
      setUploading(false);
    }
  };

  // Take a photo, then upload it
  const takePhoto = async () => {
    if (!(await ensureCameraPermission())) return;

    const options: CameraOptions = { mediaType: 'photo', quality: 0.8 };
    launchCamera(options, async resp => {
      if (resp.didCancel) return;
      if (resp.errorCode) {
        Alert.alert('Camera Error', resp.errorMessage || 'Unknown error');
        return;
      }
      const uri = resp.assets?.[0]?.uri;
      if (uri) {
        setIdUri(uri);
        await uploadIdPhoto(uri);
      }
    });
  };

  return (
    <SafeAreaView
      style={[styles.area, { backgroundColor: dark ? COLORS.dark2 : '#1F222A' }]}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: dark ? COLORS.dark2 : '#1F222A' },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <RNImage
            source={icons.back}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Photo ID Card</Text>
          <Text style={styles.subtitle}>
            Please point the camera at the ID card
          </Text>
          <View style={styles.scanView}>
            <View
              style={[
                styles.scanContainer,
                { backgroundColor: dark ? COLORS.dark2 : COLORS.white },
              ]}
            >
              {idUri ? (
                <RNImage
                  source={{ uri: idUri }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              ) : (
                <RNImage
                  source={illustrations.card}
                  style={styles.cardImage}
                  resizeMode="contain"
                />
              )}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Single camera button */}
      <View style={styles.singleButtonContainer}>
        <TouchableOpacity
          style={styles.cameraBtn}
          onPress={takePhoto}
          disabled={uploading}
        >
          <RNImage
            source={icons.camera}
            style={styles.cameraIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        {uploading && <Text style={styles.uploadingText}>Uploading…</Text>}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  area: { flex: 1 },
  container: { flex: 1, padding: 16 },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.white,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Urbanist Bold',
    color: COLORS.white,
    textAlign: 'center',
    marginVertical: 22,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Urbanist Regular',
    color: COLORS.white,
    textAlign: 'center',
    paddingHorizontal: 3,
  },
  scanView: { alignItems: 'center', marginVertical: 64 },
  scanContainer: {
    width: 332,
    height: 332,
    borderRadius: 32,
    overflow: 'hidden',
  },
  cardImage: { width: '100%', height: '100%' },

  singleButtonContainer: {
    position: 'absolute',
    bottom: 28,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  uploadingText: {
    marginTop: 8,
    color: COLORS.white,
    fontFamily: 'Urbanist Regular',
  },
  cameraBtn: {
    height: 108,
    width: 108,
    borderRadius: 54,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: { height: 44, width: 44, tintColor: COLORS.white },
});

export default PhotoIdCard;
