import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { COLORS, icons } from '../constants';
import Header from '../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '../components/Button';
import CustomAlertModal from '../components/CustomAlertModal';


type PayoutReviewRoute = RouteProp<{ params: {
  amount: string;
  fee?: string;
  total_amount?: string;
  currency?: string;
  channel_provider?: string;
  payout_fee_bearer?: string;
  account_balance?: string;
  sufficient_balance?: boolean;
  phone: string;
  estimated_completion?: string;
  remarks?: string;
}}, 'params'>;

const PayoutReviewSummary = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<PayoutReviewRoute>();
  const p = route.params;
  const { colors, dark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'error' as 'error' | 'warning' | 'success' | 'info' | 'custom',
    buttonText: 'Okay',
  });

  const confirmPayout = async () => {
    // Check for insufficient balance before proceeding
    if (p.sufficient_balance === false) {
      // Calculate the amount needed
      const currentBalance = parseFloat(p.account_balance?.toString() || '0');
      const totalNeeded = parseFloat(p.total_amount?.toString() || '0');
      const shortfall = (totalNeeded - currentBalance).toFixed(2);
      
      setAlertConfig({
        title: 'Insufficient Balance',
        message: `Your current balance (${p.currency || 'TZS'} ${p.account_balance}) is less than the total amount needed (${p.currency || 'TZS'} ${p.total_amount}).\n\nYou need ${p.currency || 'TZS'} ${shortfall} more to complete this transaction.`,
        type: 'warning',
        buttonText: 'Okay',
      });
      setAlertVisible(true);
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Session Expired', 'Please log in again.');
        navigation.navigate('Login');
        return;
      }

      const initResp = await fetch('https://theblupayapi.com/payout/initiate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: p.amount, phone: p.phone.replace('+', '') }),
      });
      const initData = await initResp.json().catch(() => ({}));
      
      if (!initResp.ok) {
        const msg = initData?.message || initData?.detail || 'Failed to initiate payout.';
        
        // Handle specific error cases with user-friendly messages
        if (msg.toLowerCase().includes('insufficient') || msg.toLowerCase().includes('balance')) {
          setAlertConfig({
            title: 'Insufficient Balance',
            message: `Your current balance (${p.currency || 'TZS'} ${p.account_balance}) is less than the total amount needed (${p.currency || 'TZS'} ${p.total_amount}). Please add more funds to your account before continuing.`,
            type: 'warning',
            buttonText: 'Okay',
          });
          setAlertVisible(true);
        } else if (msg.toLowerCase().includes('limit')) {
          setAlertConfig({
            title: 'Transaction Limit Reached',
            message: 'You have reached your transaction limit. Please contact customer support for assistance.',
            type: 'info',
            buttonText: 'Contact Support',
          });
          setAlertVisible(true);
        } else {
          setAlertConfig({
            title: 'Payout Failed',
            message: msg,
            type: 'error',
            buttonText: 'Try Again',
          });
          setAlertVisible(true);
        }
        return;
      }

      const orderRef = initData.order_reference || initData.orderReference;
      if (!orderRef) {
        setAlertConfig({
          title: 'Payout Error',
          message: 'No order reference returned from API. Please try again.',
          type: 'error',
          buttonText: 'Try Again',
        });
        setAlertVisible(true);
        return;
      }

      // Navigate to PIN verification screen with payout data
      navigation.navigate('PayoutPINVerification', {
        order_reference: orderRef,
        amount: initData.amount || p.amount,
        fee: initData.fee,
        total_amount: initData.total_amount,
        phone: initData.phone || p.phone,
        status: initData.status,
        channel_provider: initData.channel_provider,
        estimated_completion: initData.estimated_completion || p.estimated_completion,
      });

    } catch (e: any) {
      setAlertConfig({
        title: 'Network Error',
        message: e?.message || 'Something went wrong. Please check your internet connection and try again.',
        type: 'error',
        buttonText: 'Try Again',
      });
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const Row = ({ 
    label, 
    value,
    highlight = false,
    highlightColor
  }: { 
    label: string; 
    value?: string | number | boolean;
    highlight?: boolean;
    highlightColor?: string;
  }) => (
    <View style={[
      styles.row,
      {
        borderBottomColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
        paddingVertical: 13,
        alignItems: 'center',
        minHeight: 42,
        borderBottomWidth: 1,
      }
    ]}>
      <Text
        style={[
          styles.label,
          {
            color: dark ? COLORS.gray3 : COLORS.gray, // softer, more neutral label color
            flex: 1,
            fontSize: 15,
            fontFamily: 'Urbanist Medium',
            letterSpacing: 0.1,
          }
        ]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {label}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1.2, justifyContent: 'flex-end' }}>
        {highlight && (
          <View style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: highlightColor || colors.primary,
            marginRight: 8,
          }} />
        )}
        <Text
          style={[
            styles.value,
            {
              color: highlight ? (highlightColor || colors.primary) : (dark ? COLORS.white : COLORS.black),
              textAlign: 'right',
              fontSize: 16,
              fontFamily: 'Urbanist Bold',
              letterSpacing: 0.2,
            }
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {String(value ?? '-')}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Review Payout Summary" />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Total Withdrawal Card - Blue Card at the top */}
        <View 
          style={[
            styles.amountCard,
            {
              backgroundColor: colors.primary,
              marginTop: 16,
              marginHorizontal: 16,
              borderRadius: 20,
            }
          ]}
        >
          <Text style={styles.amountLabel}>Total Withdrawal</Text>
          <Text style={styles.amountValue}>{`${p.currency || 'TZS'} ${p.total_amount}`}</Text>
          <Text style={styles.amountDetails}>
            {`Including ${p.fee} service fee • ${p.channel_provider}`}
          </Text>
        </View>

        {/* Transaction Details Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: dark ? COLORS.dark2 : COLORS.white,
              borderColor: 'transparent',
              marginHorizontal: 16,
              marginTop: 16,
              marginBottom: 16,
              paddingVertical: 16,
              paddingHorizontal: 0,
              shadowOpacity: 0.05,
              shadowRadius: 15,
              elevation: 4,
              borderRadius: 20,
            }
          ]}
        >
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Image
                source={require('../assets/icons/wallet.png')}
                style={{
                  width: 24,
                  height: 24,
                  tintColor: '#FFFFFF',
                }}
              />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Transaction Details</Text>
          </View>
          
          <View style={{ paddingHorizontal: 20 }}>
            {/* Transaction Details Rows */}
            <Row label="Withdrawal Amount" value={`${p.currency || 'TZS'} ${p.amount}`} />
            <Row label="Service Fee" value={`${p.fee}`} />
            <Row label="Current Balance" value={`${p.account_balance}`} />
            
            {/* Status with colored dot */}
            <Row 
              label="Status" 
              value={p.sufficient_balance ? 'Sufficient Funds' : 'Insufficient Funds'} 
              highlight={true}
              highlightColor={p.sufficient_balance ? '#22C55E' : '#EF4444'}
            />
          
            {/* Recipient Section */}
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Recipient</Text>
            
            <Row label="Phone Number" value={p.phone} />
            <Row label="Estimated Time" value={p.estimated_completion} />
          </View>
        </View>

        {/* Enhanced Button with vibrant styling */}
        <Button
          title="Continue to PIN Verification"
          filled
          isLoading={loading}
          onPress={confirmPayout}
          style={{
            marginTop: 16,
            backgroundColor: colors.primary, // Always use primary color
            borderRadius: 28,
            height: 56,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: colors.primary,
            shadowOpacity: 0.18,
            shadowRadius: 12,
            elevation: 5,
            marginHorizontal: 8,
          }}
          textStyle={{
            color: '#FFFFFF',
            fontSize: 18,
            fontFamily: 'Urbanist Bold',
            letterSpacing: 0.3,
          }}
        />
      </ScrollView>

      {/* Custom Alert Modal for friendly error messages */}
      <CustomAlertModal
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttonText={alertConfig.buttonText}
        showIcon={true}
        customIcon={alertConfig.type === 'warning' ? 'alert-triangle' : 
                   alertConfig.type === 'success' ? 'check-circle' : 
                   alertConfig.type === 'info' ? 'info' : 'alert-circle'}
        onButtonPress={() => {
          setAlertVisible(false);
          if (alertConfig.buttonText === 'Contact Support') {
            navigation.navigate('CustomerService');
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 0
  },
  card: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: 'Urbanist Bold',
    marginLeft: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  label: { 
    fontFamily: 'Urbanist Medium', 
    fontSize: 16,
    color: '#9CA3AF',
  },
  value: { 
    fontFamily: 'Urbanist Bold', 
    fontSize: 16,
    color: '#1F2937',
  },
  // Blue card at the top
  amountCard: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  amountLabel: {
    fontSize: 16,
    fontFamily: 'Urbanist Regular',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 36,
    fontFamily: 'Urbanist Bold',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  amountDetails: {
    fontSize: 14,
    fontFamily: 'Urbanist Regular',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 16,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Urbanist Bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
});

export default PayoutReviewSummary;