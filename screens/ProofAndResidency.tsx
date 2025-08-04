import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
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
import CustomAlertModal from '../components/CustomAlertModal';

type Nav = {
  navigate: (screen: string, params?: any) => void;
};

const baseUrl = 'https://theblupayapi.com';

const ProofAndResidency: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { colors, dark } = useTheme();

  const [selectedArea, setSelectedArea] = useState<any>(null);
  const [selectedMethod, setSelectedMethod] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // Custom Alert States
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('Information');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info' | 'custom'>('custom');
  const [alertCallback, setAlertCallback] = useState<(() => void) | null>(null);

  // Check user is logged in
  useEffect(() => {
    AsyncStorage.getItem('token')
      .then(token => {
        if (!token) {
          setAlertMessage('You are not logged in. Please sign in to continue.');
          setAlertTitle('Session Expired');
          setAlertType('error');
          setAlertCallback(() => () => navigation.navigate('Login'));
          setAlertVisible(true);
        }
      })
      .catch(err => console.warn('Token load error', err));
  }, []);

  // Set Tanzania as default
  useEffect(() => {
    const tanzaniaData = {
      code: 'TZ',
      name: 'Tanzania',
      flag: 'https://flagsapi.com/TZ/flat/64.png',
    };
    setSelectedArea(tanzaniaData);
  }, []);

  const methods = [
    {
      icon: icons.idCard,
      label: 'National ID Card',
      value: 'national_id_card',
      description: 'Government-issued national identification card',
    },
    {
      icon: icons.license,
      label: 'International Passport',
      value: 'international_passport',
      description: 'Valid passport with photo identification',
    },
  ];

  const handleVerify = async () => {
    if (!selectedArea) {
      setAlertMessage('Please select your nationality to continue.');
      setAlertTitle('Missing Information');
      setAlertType('warning');
      setAlertVisible(true);
      return;
    }
    if (!selectedMethod) {
      setAlertMessage('Please choose a verification method to continue.');
      setAlertTitle('Missing Information');
      setAlertType('warning');
      setAlertVisible(true);
      return;
    }

    const token = await AsyncStorage.getItem('token');
    if (!token) {
      setAlertMessage('Your session has expired. Please sign in again.');
      setAlertTitle('Authentication Required');
      setAlertType('error');
      setAlertCallback(() => () => navigation.navigate('Login'));
      setAlertVisible(true);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        country: selectedArea.code,
        identity_type: selectedMethod.value,
      };

      console.log('➡️ KYC Step 1 Payload:', payload);

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
        console.log('🔴 KYC Step 1 Error response:', data || text);
        let errorMessage = 'Verification failed. Please try again.';
        
        if (data?.detail) {
          errorMessage = data.detail;
        } else if (data && typeof data === 'object') {
          errorMessage = Object.entries(data)
            .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
            .join('\n');
        } else if (text) {
          errorMessage = text;
        }
        
        setAlertMessage(errorMessage);
        setAlertTitle('Verification Failed');
        setAlertType('error');
        setAlertVisible(true);
        return;
      }

      // Success - navigate to next step
      setAlertMessage('Identity verification initiated successfully! Please proceed to upload your document.');
      setAlertTitle('Verification Started');
      setAlertType('success');
      setAlertCallback(() => () => navigation.navigate('PhotoIdCard', { kycStep1: data }));
      setAlertVisible(true);
      
    } catch (e: any) {
      console.warn('❌ Network error:', e);
      setAlertMessage('Network connection error. Please check your internet connection and try again.');
      setAlertTitle('Connection Error');
      setAlertType('error');
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Proof of Residency" />
        
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.contentContainer}>
            {/* <Text style={[styles.title, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
              Identity Verification
            </Text>
            <Text style={[styles.subtitle, { color: dark ? COLORS.grayscale700 : COLORS.greyscale900 }]}>
              Prove you live in Tanzania
            </Text> */}

            <View style={styles.proofContainer}>
              <Text style={[styles.proofTitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                Nationality
              </Text>
              <View
                style={[
                  styles.proofView,
                  {
                    borderColor: dark ? COLORS.dark2 : COLORS.grayscale200,
                    backgroundColor: dark ? COLORS.dark2 : COLORS.white,
                  },
                ]}
              >
                <View style={styles.countryContainer}>
                  <Image source={{ uri: 'https://flagsapi.com/TZ/flat/64.png' }} style={styles.countryImage} />
                  <Text style={[styles.countryText, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>Tanzania</Text>
                </View>
                <View style={styles.lockedIndicator}>
                  <Ionicons name="lock-closed" size={16} color={COLORS.greyscale500} />
                </View>
              </View>

              <Text style={[styles.proofTitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                Choose Verification Method
              </Text>
                             <Text style={[styles.proofSubtitle, { color: dark ? COLORS.greyscale500 : COLORS.grayscale700 }]}>
                 Select the document you'll use to verify your identity
               </Text>
              
              <View style={styles.methodsContainer}>
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
          </View>
        </ScrollView>

        <View style={styles.bottomContainer}>
          <Button
            title={loading ? 'Verifying...' : 'Continue to Verification'}
            filled
            disabled={loading}
            style={styles.button}
            onPress={handleVerify}
          />
        </View>
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
  title: { 
    fontSize: 28, 
    fontFamily: 'Urbanist Bold', 
    textAlign: 'center', 
    marginBottom: 8 
  },
  subtitle: { 
    fontSize: 16, 
    fontFamily: 'Urbanist Regular', 
    textAlign: 'center', 
    marginBottom: 40,
    lineHeight: 24,
  },
  proofContainer: { 
    marginVertical: 20 
  },
  proofTitle: { 
    fontSize: 20, 
    fontFamily: 'Urbanist Bold',
    marginBottom: 8,
  },
  proofSubtitle: {
    fontSize: 14,
    fontFamily: 'Urbanist Regular',
    marginBottom: 20,
    lineHeight: 20,
  },
  proofView: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    height: 72, 
    width: '100%', 
    borderRadius: 20, 
    borderWidth: 1,
    marginBottom: 30, 
    paddingHorizontal: 16,
  },
  countryContainer: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  countryImage: { 
    width: 32, 
    height: 24 
  },
  countryText: { 
    fontSize: 16, 
    fontFamily: 'Urbanist SemiBold', 
    marginLeft: 16 
  },
  lockedIndicator: {
    padding: 4,
  },
  methodsContainer: {
    marginTop: 10,
  },
  bottomContainer: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: 'transparent',
  },
  button: { 
    width: '90%', 
    borderRadius: 20,
    height: 56,
    marginBottom: 152, 
  },
});

export default ProofAndResidency;
