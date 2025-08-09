import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { COLORS } from '../constants';
import Header from '../components/Header';
import Button from '../components/Button';


type PayoutSuccessRoute = RouteProp<{ params: {
  order_reference: string;
  amount: string;
  fee?: string;
  total_amount?: string;
  phone: string;
  status?: string;
  channel_provider?: string;
  estimated_completion?: string;
}}, 'params'>;

const PayoutSuccessful = () => {
  const { colors, dark } = useTheme();
  const route = useRoute<PayoutSuccessRoute>();
  const navigation = useNavigation<any>();
  const p = route.params;

  const Row = ({ label, value }: { label: string; value?: string | number | boolean }) => (
    <View style={[
      styles.row,
      { borderBottomColor: colors.border } // use theme border color
    ]}>
      <Text style={[
        styles.label,
        { color: colors.textSecondary } // use theme secondary text color
      ]}>
        {label}
      </Text>
      <Text style={[
        styles.value,
        { color: colors.text } // use theme main text color
      ]}>
        {String(value ?? '-')}
      </Text>
    </View>
  );

  return (
    <View style={[
      styles.container,
      { backgroundColor: colors.background }
    ]}>
      <Header title="Payout Successful" />
      <View style={{ alignItems: 'center', marginTop: 16 }}>
        <Image
          source={require('../assets/icons/check.png')}
          style={{
            width: 80,
            height: 80,
            tintColor: colors.primary, // use theme primary color
            opacity: 0.95
          }}
        />
        <Text style={[
          styles.successTitle,
          { color: colors.text }
        ]}>
          Your payout is on the way
        </Text>
      </View>
      <View style={[
        styles.card,
        {
          backgroundColor: colors.card, // use theme card color
          borderColor: colors.border // use theme border color
        }
      ]}>
        <Row label="Order Reference" value={p.order_reference} />
        <Row label="Amount" value={`${p.amount} (Total ${p.total_amount || '-'})`} />
        <Row label="Phone" value={p.phone} />
        <Row label="Status" value={p.status || 'SUCCESS'} />
        <Row label="Provider" value={p.channel_provider || '-'} />
        <Row label="ETA" value={p.estimated_completion || '-'} />
      </View>

      <Button
        title="Done"
        filled
        onPress={() => navigation.navigate('Home')}
        style={{
          marginTop: 18,
          backgroundColor: colors.primary // ensure button uses theme primary color
        }}
        textStyle={{
          color: colors.buttonText // ensure button text is visible
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { borderRadius: 20, padding: 16, marginTop: 12, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, elevation: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 },
  label: { fontFamily: 'Urbanist Medium', fontSize: 14 },
  value: { fontFamily: 'Urbanist Bold', fontSize: 15 },
  successTitle: { marginTop: 8, fontSize: 18, fontFamily: 'Urbanist Bold' },
});

export default PayoutSuccessful;