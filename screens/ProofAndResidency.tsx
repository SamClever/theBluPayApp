// ProofOfResidency.tsx

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

  // Ensure user is logged in
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

  // Load country list
  useEffect(() => {
    fetch('https://restcountries.com/v2/all')
      .then(res => res.json())
      .then(data => {
        const list = data.map((c: any) => ({
          code: c.alpha2Code,
          name: c.name,
          flag: `https://flagsapi.com/${c.alpha2Code}/flat/64.png`,
        }));
        setAreas(list);
        const us = list.find(x => x.code === 'US');
        if (us) setSelectedArea(us);
      })
      .catch(err => console.warn('Country fetch error', err));
  }, []);

  // Must exactly match your Python IDENTITY_TYPE keys:
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

    // read JWT right before call
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      Alert.alert('Auth', 'Missing credentials. Please log in.');
      navigate('Login');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        country:       selectedArea.code,
        identity_type: selectedMethod.value,
      };
      console.log('➡️ payload:', payload);

      const res = await fetch(`${baseUrl}/Account/kyc/step1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept:         'application/json',
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data: any = null;
      try { data = JSON.parse(text); } catch {}

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
      console.warn(e);
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
              onPress={() => setModalVisible(true)}
            >
              <View style={styles.countryContainer}>
                {selectedArea && (
                  <Image source={{ uri: selectedArea.flag }} style={styles.countryImage} />
                )}
                <Text style={[styles.countryText, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                  {selectedArea?.name}
                </Text>
              </View>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>

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
                  <FlatList
                    data={areas}
                    renderItem={renderItem}
                    keyExtractor={item => item.code}
                    contentContainerStyle={styles.listContainer}
                  />
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
