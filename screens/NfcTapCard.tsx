import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated, Modal } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';
import { COLORS } from '../constants';
import Header from '../components/Header';
import NfcManager, {NfcTech, Ndef} from 'react-native-nfc-manager';

const styles = StyleSheet.create({
  nfcIcon: {
    width: 64,
    height: 64,
    tintColor: '#2563eb'
  },
  nfcPulseWrap: {
    marginTop: 12,
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardModern: {
    width: 320,
    height: 180,
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 22,
    marginBottom: 28,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8
  },
  swipeCardName: {
    color: '#fff',
    fontSize: 17,
    fontFamily: 'Urbanist Bold',
    marginBottom: 8
  },
  swipeCardMasked: {
    color: '#FFD600',
    fontSize: 20,
    letterSpacing: 2,
    fontFamily: 'Urbanist Bold',
    marginBottom: 18
  },
  swipeCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  swipeCardExp: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Urbanist Regular'
  },
  swipeCardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  swipeCardDays: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Urbanist Regular'
  },
  mastercardLogo: {
    width: 56,
    height: 36,
    marginLeft: 8
  },
  gradientBg: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: COLORS.primary
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 24,
    textAlign: 'center'
  },
  nfcButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 28,
    marginBottom: 18
  },
  nfcButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold'
  },
  infoText: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 12,
    textAlign: 'center'
  }
});

const NfcTapCard = () => {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [transaction, setTransaction] = React.useState<any>(null);
  // Initialize NFC on mount
  React.useEffect(() => {
    NfcManager.start();
    return () => {
      NfcManager.cancelTechnologyRequest();
    };
  }, []);

  // NFC scan handler
  const handleNfcScan = async () => {
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      // Simulate transaction details for demo
      setTransaction({
        amount: 'TZS 25,000',
        merchant: 'POS: Shoprite Mlimani',
        time: new Date().toLocaleString(),
        card: '**** 1234',
        tagId: tag?.id || 'N/A'
      });
      setModalVisible(true);
    } catch (ex) {
      setTransaction(null);
      setModalVisible(true);
    } finally {
      NfcManager.cancelTechnologyRequest();
    }
  };
  const nfcAnim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(nfcAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(nfcAnim, { toValue: 0, duration: 900, useNativeDriver: true })
      ])
    ).start();
  }, [nfcAnim]);

  const nfcPulseStyle = {
    transform: [{ scale: nfcAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] }) }],
    opacity: nfcAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.7] })
  };

  return (
    <LinearGradient colors={["#E3ECFF", "#3B82F6"]} style={styles.gradientBg}>
  <Header title="POS Payment (NFC)" />
      <View style={styles.content}>
        <Animated.View style={[styles.nfcPulseWrap, nfcPulseStyle]}>
          <Image source={require('../assets/icons/nfc.png')} style={styles.nfcIcon} resizeMode="contain" />
        </Animated.View>
  <Text style={[styles.title, {color: '#1e293b'}]}>Pay Instantly at POS</Text>
  <Text style={[styles.subtitle, {color: '#334155'}]}>Hold your phone close to the POS terminal and tap the button below to send payment via NFC. Make sure your card and phone support NFC.</Text>
        <LinearGradient colors={["#1A5AC7", "#3B82F6"]} style={styles.cardModern}>
          <Text style={styles.swipeCardName}>Salum Maulid</Text>
          <Text style={styles.swipeCardMasked}>{'********************'}</Text>
          <View style={styles.swipeCardRow}>
            <Text style={styles.swipeCardExp}>EXP   Cvv  ***</Text>
          </View>
          <View style={styles.swipeCardBottomRow}>
            <Text style={styles.swipeCardDays}>90 Days Only</Text>
            <Image source={require('../assets/icons/mastercard.png')} style={styles.mastercardLogo} resizeMode="contain" />
          </View>
        </LinearGradient>
        <TouchableOpacity style={styles.nfcButton} onPress={handleNfcScan}>
          <Text style={styles.nfcButtonText}>Send Payment to POS</Text>
        </TouchableOpacity>
  <Text style={[styles.infoText, {color: '#334155'}]}>NFC lets you pay securely and instantly at supported POS terminals. Enable NFC in your phone settings if needed.</Text>
      </View>
      {/* Payment Success Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(30,41,59,0.32)' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 18, padding: 28, width: 340, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 18, elevation: 8 }}>
            <Image source={require('../assets/icons/nfc.png')} style={[styles.nfcIcon, { tintColor: '#22c55e', marginBottom: 12 }]} />
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#2563eb', marginBottom: 8 }}>POS Payment Sent</Text>
            {transaction ? (
              <>
                <Text style={{ fontSize: 17, color: '#1e293b', marginBottom: 6 }}>Amount: <Text style={{ fontWeight: 'bold', color: '#2563eb' }}>{transaction.amount}</Text></Text>
                <Text style={{ fontSize: 17, color: '#1e293b', marginBottom: 6 }}>POS Terminal: <Text style={{ fontWeight: 'bold', color: '#2563eb' }}>{transaction.merchant}</Text></Text>
                <Text style={{ fontSize: 17, color: '#1e293b', marginBottom: 6 }}>Date & Time: <Text style={{ fontWeight: 'bold', color: '#2563eb' }}>{transaction.time}</Text></Text>
                <Text style={{ fontSize: 17, color: '#1e293b', marginBottom: 6 }}>Card Used: <Text style={{ fontWeight: 'bold', color: '#2563eb' }}>{transaction.card}</Text></Text>
                <Text style={{ fontSize: 14, color: '#334155', marginBottom: 6 }}>NFC Tag ID: <Text style={{color:'#2563eb'}}>{transaction.tagId}</Text></Text>
                <Text style={{ fontSize: 15, color: '#2563eb', marginTop: 8, marginBottom: 2 }}>Your payment was sent securely via NFC.</Text>
              </>
            ) : (
              <Text style={{ fontSize: 17, color: '#ef4444', marginBottom: 6, textAlign: 'center' }}>NFC Scan failed or cancelled. Please try again.</Text>
            )}
            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 18, backgroundColor: '#3B82F6', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 32 }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};
// ...existing code...
export default NfcTapCard;
