import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { COLORS } from '../constants';
import Header from '../components/Header';
import Button from '../components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlertModal from '../components/CustomAlertModal';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

function PayoutPINVerification() {
  const navigation = useNavigation();
  const route = useRoute();
  const p = route.params;
  const { colors, dark } = useTheme();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'error',
    buttonText: 'Try Again',
  });

  // Fetch user PIN on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setProfileLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Session Expired', 'Please log in again.');
        navigation.navigate('Login');
        return;
      }

      const response = await fetch('https://theblupayapi.com/Account/dashboard/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 401 || status === 403) {
          await AsyncStorage.removeItem('token');
          navigation.navigate('Login');
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error(`Failed to fetch user profile (status ${status})`);
      }

      let data = {};
      try {
        const responseText = await response.text();
        if (responseText && responseText.trim()) {
          data = JSON.parse(responseText);
        }
      } catch (parseError) {
        console.warn('Failed to parse profile response:', parseError);
        throw new Error('Failed to parse user profile data');
      }
      setUser({
        First_name: data.kyc?.First_name,
        Last_name: data.kyc?.Last_name,
        account_number: data.account?.account_number,
        account_balance: data.account?.account_balance,
        pin: data.account?.pin_number,
      });
    } catch (error) {
      setAlertConfig({
        title: 'Error',
        message: error.message || 'Failed to load user profile. Please try again.',
        type: 'error',
        buttonText: 'Try Again',
      });
      setAlertVisible(true);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePinChange = (text) => {
    const numericText = text.replace(/[^0-9]/g, '').slice(0, 4);
    setPin(numericText);
    
    if (numericText.length === 4) {
      setTimeout(() => verifyPIN(numericText), 100);
    }
  };

  const verifyPIN = async (pinToVerify) => {
    const currentPin = pinToVerify || pin;
    
    if (currentPin.length !== 4) {
      setAlertConfig({
        title: 'Invalid PIN',
        message: 'Please enter a 4-digit PIN.',
        type: 'error',
        buttonText: 'Try Again',
      });
      setAlertVisible(true);
      return;
    }

    if (!user?.pin) {
      setAlertConfig({
        title: 'Error',
        message: 'Unable to verify PIN. Please try again.',
        type: 'error',
        buttonText: 'Try Again',
      });
      setAlertVisible(true);
      return;
    }

    setLoading(true);
    
    setTimeout(async () => {
      try {
        if (currentPin === String(user.pin)) {
          const token = await AsyncStorage.getItem('token');
          if (!token) {
            Alert.alert('Session Expired', 'Please log in again.');
            navigation.navigate('Login');
            setLoading(false);
            return;
          }

          try {
            const webhookResp = await fetch('https://theblupayapi.com/webhooks/clickpesa-payout/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({ orderReference: p.order_reference, status: 'SUCCESS' }),
            });

            let webhookData = {};
            try {
              const responseText = await webhookResp.text();
              if (responseText && responseText.trim()) {
                webhookData = JSON.parse(responseText);
              }
            } catch (parseError) {
              console.warn('Failed to parse webhook response:', parseError);
              webhookData = {};
            }

            if (!webhookResp.ok) {
              const msg = webhookData?.message || webhookData?.detail || 'PIN verified but payout processing failed.';
              setAlertConfig({
                title: 'Processing Error',
                message: msg,
                type: 'warning',
                buttonText: 'Continue',
              });
              setAlertVisible(true);
              setLoading(false);
              return;
            }
          } catch (webhookError) {
            console.warn('Webhook error:', webhookError);
          }

          setLoading(false);
          navigation.navigate('PayoutSuccessful', p);

        } else {
          setAlertConfig({
            title: 'PIN Verification Failed',
            message: 'The PIN you entered is incorrect. Please try again.',
            type: 'error',
            buttonText: 'Try Again',
          });
          setAlertVisible(true);
          setPin('');
          setLoading(false);
        }
      } catch (error) {
        setAlertConfig({
          title: 'Network Error',
          message: error?.message || 'Something went wrong. Please check your internet connection and try again.',
          type: 'error',
          buttonText: 'Try Again',
        });
        setAlertVisible(true);
        setPin('');
        setLoading(false);
      }
    }, 500);
  };

  const handleContinue = async () => {
    await verifyPIN();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Verify PIN" />
      
      {profileLoading ? (
        <View style={[styles.content, { justifyContent: 'center' }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text, marginTop: 16 }]}>
            Loading your profile...
          </Text>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
            <MaterialCommunityIcons
              name="shield-check"
              size={32}
              color="#FFFFFF"
            />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            Secure Your Withdrawal
          </Text>
          
          <Text style={[styles.description, { 
            color: dark ? COLORS.greyscale600 : COLORS.grayscale700 
          }]}>
            Please enter your 4-digit PIN to confirm this withdrawal of{'\n'}
            <Text style={[styles.amountText, { color: colors.primary }]}>
              {p.total_amount || p.amount}
            </Text>
          </Text>

          <View style={styles.pinContainer}>
            <TextInput
              style={[
                styles.pinInput,
                {
                  backgroundColor: dark ? COLORS.dark2 : COLORS.secondaryWhite,
                  borderColor: dark ? COLORS.gray : COLORS.secondaryWhite,
                  color: dark ? COLORS.white : COLORS.black,
                }
              ]}
              value={pin}
              onChangeText={handlePinChange}
              placeholder="Enter 4-digit PIN"
              placeholderTextColor={dark ? COLORS.gray : COLORS.gray}
              keyboardType="number-pad"
              secureTextEntry={true}
              maxLength={4}
              autoFocus={true}
              textAlign="center"
            />
          </View>

          <View style={[styles.securityNote, { 
            backgroundColor: dark ? COLORS.dark3 : '#F8F9FA',
            borderColor: dark ? COLORS.gray2 : '#E9ECEF'
          }]}>
            <MaterialCommunityIcons
              name="information"
              size={20}
              color={colors.primary}
              style={{ marginRight: 8 }}
            />
            <Text style={[styles.securityText, { 
              color: dark ? COLORS.greyscale600 : COLORS.grayscale700 
            }]}>
              Your PIN is encrypted and secure. We never store or share your PIN.
            </Text>
          </View>

          <Button
            title="Verify PIN"
            filled
            isLoading={loading}
            onPress={handleContinue}
            disabled={pin.length !== 4 || loading}
            style={[
              styles.verifyButton,
              {
                backgroundColor: pin.length === 4 && !loading ? colors.primary : (dark ? COLORS.gray2 : COLORS.greyscale300),
                opacity: pin.length === 4 && !loading ? 1 : 0.6,
              }
            ]}
            textStyle={{
              color: '#FFFFFF',
              fontSize: 16,
              fontFamily: 'Urbanist Bold',
            }}
          />

          <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            style={[styles.cancelButton, { 
              backgroundColor: 'transparent',
              borderColor: dark ? COLORS.gray2 : COLORS.greyscale300,
              borderWidth: 1,
            }]}
            textStyle={{
              color: dark ? COLORS.white : COLORS.black,
              fontSize: 16,
              fontFamily: 'Urbanist Medium',
            }}
          />
        </View>
      )}

      <CustomAlertModal
        visible={alertVisible}
        onClose={() => {
          setAlertVisible(false);
          setPin('');
        }}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttonText={alertConfig.buttonText}
        showIcon={true}
        customIcon={alertConfig.type === 'error' ? 'alert-circle' : 'check-circle'}
        onButtonPress={() => {
          setAlertVisible(false);
          setPin('');
          
          if (alertConfig.title === 'Error' && alertConfig.message.includes('Failed to load user profile')) {
            fetchUserProfile();
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Urbanist Regular',
    textAlign: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Urbanist Bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Urbanist Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  amountText: {
    fontFamily: 'Urbanist Bold',
    fontSize: 18,
  },
  pinContainer: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  pinInput: {
    width: 200,
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    fontSize: 20,
    fontFamily: 'Urbanist Bold',
    letterSpacing: 4,
    textAlign: 'center',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 32,
    marginHorizontal: 16,
  },
  securityText: {
    fontSize: 14,
    fontFamily: 'Urbanist Regular',
    flex: 1,
    lineHeight: 20,
  },
  verifyButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cancelButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PayoutPINVerification;
