import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-virtualized-view';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { COLORS, SIZES } from '../constants';
import Button from '../components/Button';
import Header from '../components/Header';
import { launchCamera, CameraOptions, Asset } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const baseUrl = 'https://blupay.zakedebt.co.tz';

type Nav = {
  navigate: (value: string) => void
};

const SelfieWithIdCard = () => {
  const { navigate } = useNavigation<Nav>();
  const { colors, dark } = useTheme();
  const [photo, setPhoto] = useState<Asset | null>(null);
  const [uploading, setUploading] = useState(false);

  const openCamera = async () => {
    const options: CameraOptions = {
      mediaType: 'photo',
      cameraType: 'front',
      saveToPhotos: false,
      quality: 0.8,
    };
    launchCamera(options, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Camera Error', response.errorMessage || 'Could not open camera.');
        return;
      }
      if (response.assets && response.assets.length > 0) {
        setPhoto(response.assets[0]);
      }
    });
  };

  const uploadPhoto = async () => {
    // Instead of uploading, just navigate to the next screen
    navigate('FillYourProfile');
  };

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="" />
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>Selfie with ID Card</Text>
          <Text style={[styles.subtitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>Please face the camera holding your ID card.</Text>
        </ScrollView>
      </View>
      <View style={styles.bottomContainer}>
        <Button
          title={photo ? 'Retake' : 'Take Selfie'}
          style={{
            width: (SIZES.width - 32) / 2 - 8,
            borderRadius: 32,
            backgroundColor: dark ? COLORS.dark3 : COLORS.tansparentPrimary,
            borderColor: dark ? COLORS.dark3 : COLORS.tansparentPrimary
          }}
          textColor={dark ? COLORS.white : COLORS.primary}
          onPress={openCamera}
        />
        <Button
          title={uploading ? 'Uploading…' : 'Continue'}
          filled
          style={styles.continueButton}
          onPress={uploadPhoto}
          disabled={uploading}
        />
      </View>
      {uploading && (
        <View style={{ position: 'absolute', top: '50%', left: 0, right: 0, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Urbanist Bold',
    color: COLORS.greyscale900,
    textAlign: 'center',
    marginVertical: 22,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Urbanist Regular',
    color: COLORS.greyscale900,
    textAlign: 'center',
    paddingHorizontal: 3,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 32,
    right: 16,
    left: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: SIZES.width - 32,
    alignItems: 'center',
  },
  continueButton: {
    width: (SIZES.width - 32) / 2 - 8,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
});

export default SelfieWithIdCard;
