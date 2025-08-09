import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { COLORS, icons } from '../constants';
import Header from '../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '../components/Button';


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

  const confirmPayout = async () => {
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
        Alert.alert('Payout Failed', msg);
        return;
      }

      const orderRef = initData.order_reference || initData.orderReference;
      if (!orderRef) {
        Alert.alert('Payout Error', 'No order reference returned from API.');
        return;
      }

      // Webhook: mark payout success to update balances
      const webhookResp = await fetch('https://theblupayapi.com/webhooks/clickpesa-payout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ orderReference: orderRef, status: 'SUCCESS' }),
      });

      const webhookData = await webhookResp.json().catch(() => ({}));
      if (!webhookResp.ok) {
        const msg = webhookData?.message || webhookData?.detail || 'Payout completed but webhook failed.';
        Alert.alert('Webhook Error', msg);
        return;
      }

      navigation.navigate('PayoutSuccessful', {
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
      Alert.alert('Network Error', e?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const Row = ({ label, value }: { label: string; value?: string | number | boolean }) => (
    <View style={[
      styles.row,
      {
        borderBottomColor: colors.border,
        paddingVertical: 10,
        alignItems: 'center',
        minHeight: 38,
      }
    ]}>
      <Text
        style={[
          styles.label,
          {
            color: dark ? COLORS.gray3 : COLORS.grayscale500, // softer, more neutral label color
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
      <Text
        style={[
          styles.value,
          {
            color: dark ? COLORS.white : COLORS.grayscale900, // strong contrast for value
            flex: 1.2,
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
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Review Payout Summary" />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card || (dark ? COLORS.dark2 : COLORS.white),
              borderColor: colors.border || (dark ? COLORS.grayscale700 : COLORS.gray2),
              marginTop: 24,
              marginBottom: 16,
              paddingVertical: 18,
              paddingHorizontal: 18,
              shadowOpacity: 0.04,
              elevation: 2,
            }
          ]}
        >
          <View style={styles.cardHeader}>
            <Image
              source={require('../assets/icons/wallet.png')}
              style={{
                width: 22,
                height: 22,
                tintColor: colors.primary,
                marginRight: 6,
              }}
            />
            <Text style={[styles.cardTitle, { color: colors.text, fontSize: 17 }]}>Summary</Text>
          </View>
          <Row label="Amount" value={`${p.currency || 'TZS'} ${p.amount}`} />
          <Row label="Fee" value={p.fee} />
          <Row label="Total" value={p.total_amount} />
          <Row label="Provider" value={p.channel_provider} />
          <Row label="Balance" value={p.account_balance} />
          <Row label="Sufficient Balance" value={p.sufficient_balance ? 'Yes' : 'No'} />
          <Row label="Phone" value={p.phone} />
          <Row label="ETA" value={p.estimated_completion} />
        </View>
        <Button
          title="Confirm Payout"
          filled
          isLoading={loading}
          onPress={confirmPayout}
          style={{
            marginTop: 8,
            backgroundColor: colors.primary,
            borderRadius: 24,
            height: 52,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: colors.primary,
            shadowOpacity: 0.13,
            shadowRadius: 8,
            elevation: 2,
          }}
          textStyle={{
            color: colors.buttonText,
            fontSize: 17,
            fontFamily: 'Urbanist Bold',
            letterSpacing: 0.2,
          }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: {
    borderRadius: 20,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Urbanist Bold',
    marginLeft: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  label: { fontFamily: 'Urbanist Medium', fontSize: 14 },
  value: { fontFamily: 'Urbanist Bold', fontSize: 15 },
});

export default PayoutReviewSummary;