import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-virtualized-view';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { COLORS, SIZES, icons } from '../constants';
import Header from '../components/Header';
import VerificationMethod from '../components/VerificationMethod';
import Button from '../components/Button';

type Nav = {
  navigate: (screen: string, params?: any) => void;
};

const baseUrl = 'https://blupay.zakedebt.co.tz';

const ProofOfResidency: React.FC = () => {
  const { navigate } = useNavigation<Nav>();
  const { colors, dark } = useTheme();

  const [areas, setAreas] = useState<any[]>([]);
  const [selectedArea, setSelectedArea] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [countryLoading, setCountryLoading] = useState(true);
  const [countryError, setCountryError] = useState<string | null>(null);

  // Check user is logged in
  useEffect(() => {
    AsyncStorage.getItem('userToken')
      .then(token => {
        if (!token) {
          Alert.alert('Session', 'You are not logged in.');
          navigate('Login');
        }
      })
      .catch(err => console.warn('Token load error', err));
  }, []);

  // Load countries
  useEffect(() => {
    const fetchCountries = async () => {
      setCountryLoading(true);
      setCountryError(null);
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=cca2,name');
        if (!response.ok) {
          setCountryError(`Country API error: ${response.status} ${response.statusText}`);
          setCountryLoading(false);
          console.warn('🌐 API error:', response.status, response.statusText);
          Alert.alert('Error', `Country API error: ${response.status} ${response.statusText}`);
          return;
        }
        const text = await response.text();
        let data: any = null;
        try {
          data = JSON.parse(text);
        } catch (parseErr) {
          setCountryError('Invalid response from country API.');
          setCountryLoading(false);
          console.warn('🌐 Parse error:', parseErr, text);
          Alert.alert('Error', 'Invalid response from country API.');
          return;
        }

        if (!Array.isArray(data) || data.length === 0) {
          setCountryError('Country API did not return a valid list.');
          setCountryLoading(false);
          console.warn('🌐 Unexpected API response:', data);
          Alert.alert('Error', 'Country API did not return a valid list.');
          return;
        }

        const countryList = data
          .filter((c: any) => c.cca2 && c.name?.common)
          .map((c: any) => ({
            code: c.cca2,
            name: c.name.common,
            flag: `https://flagsapi.com/${c.cca2}/flat/64.png`,
          }));

        if (countryList.length === 0) {
          setCountryError('No valid countries found in API response.');
          setCountryLoading(false);
          console.warn('🌐 No valid countries:', data);
          Alert.alert('Error', 'No valid countries found in API response.');
          return;
        }

        setAreas(countryList);
        const defaultCountry = countryList.find((c: { code: string }) => c.code === 'US') || countryList[0];
        setSelectedArea(defaultCountry);
        setCountryLoading(false);
        console.log('✅ Country list loaded:', countryList.length);
      } catch (err: any) {
        setCountryError('Unable to fetch country list.');
        setCountryLoading(false);
        console.warn('🌐 Fetch error:', err.message);
        Alert.alert('Error', 'Unable to fetch country list.');
      }
    };

    fetchCountries();
  }, []);

  const methods = [
    {
      icon: icons.idCard,
      label: 'National ID Card',
      value: 'national_id_card',
    },
    {
      icon: icons.certificate,
      label: 'Drivers Licence',
      value: 'drivers_licence',
    },
    {
      icon: icons.license,
      label: 'International Passport',
      value: 'international_passport',
    },
  ];

  const handleVerify = async () => {
    if (!selectedArea) {
      return Alert.alert('Validation', 'Select your nationality.');
    }
    if (!selectedMethod) {
      return Alert.alert('Validation', 'Choose a verification method.');
    }

    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      Alert.alert('Auth', 'Missing credentials. Please log in.');
      navigate('Login');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        country: selectedArea.code,
        identity_type: selectedMethod.value,
      };

      console.log('➡️ Payload:', payload);

      const res = await fetch(`${baseUrl}/Account/kyc/step1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {}

      if (!res.ok) {
        console.log('🔴 Error response:', data || text);
        const msg =
          data?.detail ||
          (data && typeof data === 'object'
            ? Object.entries(data)
                .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
                .join('\n')
            : text);
        return Alert.alert('Server Error', msg);
      }

      navigate('PhotoIdCard', { kycStep1: data });
    } catch (e: any) {
      console.warn('❌ Network error:', e);
      Alert.alert('Network Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => {
        setSelectedArea(item);
        setModalVisible(false);
      }}>
      <Image source={{ uri: item.flag }} style={styles.flagImage} />
      <Text style={[styles.listText, { color: COLORS.white }]}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="" />
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
            Proof of Residency
          </Text>
          <Text style={[styles.subtitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
            Prove you live in United States
          </Text>

          <View style={styles.proofContainer}>
            <Text style={[styles.proofTitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
              Nationality
            </Text>
            <TouchableOpacity
              style={[
                styles.proofView,
                {
                  borderColor: dark ? COLORS.dark2 : COLORS.grayscale200,
                  backgroundColor: dark ? COLORS.dark2 : COLORS.white,
                },
              ]}
              onPress={() => {
                if (!countryLoading && areas.length > 0) setModalVisible(true);
              }}
              disabled={countryLoading || areas.length === 0}
            >
              <View style={styles.countryContainer}>
                {countryLoading ? (
                  <Text style={[styles.countryText, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>Loading…</Text>
                ) : selectedArea ? (
                  <>
                    <Image source={{ uri: selectedArea.flag }} style={styles.countryImage} />
                    <Text style={[styles.countryText, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>{selectedArea?.name}</Text>
                  </>
                ) : (
                  <Text style={[styles.countryText, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>Select Country</Text>
                )}
              </View>
              <Text style={styles.changeText}>{countryLoading ? '' : 'Change'}</Text>
            </TouchableOpacity>
            {countryError && (
              <Text style={{ color: 'red', marginTop: 4, marginBottom: 8, textAlign: 'center' }}>{countryError}</Text>
            )}

            <Text style={[styles.proofTitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
              Choose Verification Method
            </Text>
            <View style={{ marginVertical: 22 }}>
              {methods.map(m => (
                <VerificationMethod
                  key={m.value}
                  icon={m.icon}
                  name={m.label}
                  isSelected={selectedMethod?.value === m.value}
                  onSelect={() => setSelectedMethod(m)}
                />
              ))}
            </View>
          </View>

          <Modal animationType="slide" transparent visible={modalVisible}>
            <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
              <View style={styles.modalBackdrop}>
                <View style={styles.modalContent}>
                  <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                    <Ionicons name="close-outline" size={24} color={COLORS.primary} />
                  </TouchableOpacity>
                  {countryLoading ? (
                    <Text style={{ color: COLORS.white, textAlign: 'center', marginTop: 40 }}>Loading countries…</Text>
                  ) : areas.length === 0 ? (
                    <Text style={{ color: COLORS.white, textAlign: 'center', marginTop: 40 }}>No countries found.</Text>
                  ) : (
                    <FlatList
                      data={areas}
                      renderItem={renderItem}
                      keyExtractor={item => item.code}
                      contentContainerStyle={styles.listContainer}
                    />
                  )}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </ScrollView>

        <View style={styles.bottomContainer}>
          <Button
            title={loading ? 'Submitting…' : 'Verify Identity'}
            filled
            disabled={loading}
            style={styles.button}
            onPress={handleVerify}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  area: { flex: 1 },
  container: { flex: 1, padding: 16 },
  title: { fontSize: 28, fontFamily: 'Urbanist Bold', textAlign: 'center', marginVertical: 22 },
  subtitle: { fontSize: 16, fontFamily: 'Urbanist Regular', textAlign: 'center', paddingHorizontal: 3 },
  proofContainer: { marginVertical: 22 },
  proofTitle: { fontSize: 20, fontFamily: 'Urbanist Bold' },
  proofView: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    height: 72, width: SIZES.width - 32, borderRadius: 20, borderWidth: 1,
    marginVertical: 10, paddingHorizontal: 16,
  },
  countryContainer: { flexDirection: 'row', alignItems: 'center' },
  countryImage: { width: 32, height: 24 },
  countryText: { fontSize: 16, fontFamily: 'Urbanist SemiBold', marginLeft: 16 },
  changeText: { fontSize: 16, fontFamily: 'Urbanist SemiBold', color: COLORS.primary },
  bottomContainer: { position: 'absolute', bottom: 28, left: 0, right: 0, alignItems: 'center', paddingHorizontal: 16 },
  button: { marginTop: 12, width: SIZES.width - 32, borderRadius: 32 },
  closeBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.white, position: 'absolute', top: 32, right: 16, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  modalBackdrop: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  modalContent: { height: SIZES.height, width: SIZES.width, backgroundColor: COLORS.primary, borderRadius: 12 },
  listContainer: { padding: 20, paddingBottom: 40 },
  listItem: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  flagImage: { width: 30, height: 30, marginRight: 10 },
  listText: { fontSize: 16 },
});

export default ProofOfResidency;
