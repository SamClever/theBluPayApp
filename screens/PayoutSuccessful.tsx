import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Dimensions, StatusBar } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { COLORS } from '../constants';
import Button from '../components/Button';

const { width, height } = Dimensions.get('window');

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
  
  // Animation values
  const scaleAnim = React.useRef(new Animated.Value(0.5)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Run animations when component mounts
    StatusBar.setBarStyle('light-content');
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start();

    return () => {
      StatusBar.setBarStyle('default');
    };
  }, []);

  const onDone = () => {
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      navigation.navigate('Home');
    });
  };

  const DetailRow = ({ label, value }: { label: string; value?: string | number | boolean }) => (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: dark ? COLORS.gray3 : COLORS.gray }]}>
        {label}
      </Text>
      <Text style={[styles.detailValue, { color: colors.text }]}>
        {String(value ?? '-')}
      </Text>
    </View>
  );

  return (
    <View style={styles.containerOverlay}>
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" translucent={true} />
      
      <Animated.View 
        style={[
          styles.modal,
          { 
            backgroundColor: dark ? '#1A1A1A' : '#FFFFFF',
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onDone}
        >
          <Image 
            source={require('../assets/icons/arrow-left.png')} 
            style={{
              width: 22, 
              height: 22, 
              tintColor: colors.text
            }}
          />
        </TouchableOpacity>
        
        <View style={styles.successIconContainer}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
            <Image
              source={require('../assets/icons/check.png')}
              style={styles.checkIcon}
              resizeMode="contain"
            />
          </View>
        </View>
        
        <Text style={[styles.title, { color: colors.text }]}>
          Payout Successful
        </Text>
        
        <Text style={[styles.subtitle, { color: dark ? COLORS.gray3 : '#666666' }]}>
          Your payout is on the way
        </Text>
        
        <View style={[styles.card, { 
          backgroundColor: dark ? '#222222' : '#F8F9FA',
          shadowColor: dark ? 'rgba(0,0,0,0)' : '#000'
        }]}>
          <DetailRow label="Order Reference" value={p.order_reference} />
          <DetailRow label="Amount" value={`${p.amount} (Total ${p.total_amount || '-'})`} />
          <DetailRow label="Phone" value={p.phone} />
          <DetailRow label="Status" value={p.status || 'AUTHORIZED'} />
          <DetailRow label="Provider" value={p.channel_provider || '-'} />
          <DetailRow label="ETA" value={p.estimated_completion || '5-15 minutes'} />
        </View>
        
        <TouchableOpacity 
          style={[styles.doneButton, { backgroundColor: colors.primary }]}
          onPress={onDone}
          activeOpacity={0.9}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  containerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modal: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 28,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  successIconContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4285F4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  checkIcon: {
    width: 50,
    height: 50,
    tintColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Urbanist Bold',
    marginTop: 24,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Urbanist Medium',
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
    opacity: 0.8,
  },
  card: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  detailLabel: {
    fontFamily: 'Urbanist Medium',
    fontSize: 14,
    opacity: 0.8,
  },
  detailValue: {
    fontFamily: 'Urbanist Bold',
    fontSize: 15,
    textAlign: 'right',
    maxWidth: '60%',
  },
  doneButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#4285F4',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Urbanist Bold',
    letterSpacing: 0.5,
  },
});

export default PayoutSuccessful;