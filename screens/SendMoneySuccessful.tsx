import React, { useRef } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import ViewShot from 'react-native-view-shot';
import Icon from 'react-native-vector-icons/Feather';
import CameraRoll from '@react-native-camera-roll/camera-roll';

import { COLORS, SIZES } from '../constants';
import Button from '../components/Button';

type RootStackParamList = {
  SendMoneySuccessful: {
    transaction_id?: string;
    amount?: string;
    description?: string;
    status?: string;
    transaction_type?: string;
    sender_account_number?: string;
    receiver_account_number?: string;
    date?: string;
  };
  Home: undefined;
};

type SuccessScreenRouteProp = RouteProp<RootStackParamList, 'SendMoneySuccessful'>;

const SendMoneySuccessful = () => {
  const navigation = useNavigation();
  const route = useRoute<SuccessScreenRouteProp>();
  const { colors, dark } = useTheme();
  const receiptRef = useRef<ViewShot>(null);

  const {
    transaction_id,
    amount,
    description,
    status,
    transaction_type,
    sender_account_number,
    receiver_account_number,
    date,
  } = route.params || {};

  const requestImagePermission = async () => {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    }
    return true;
  };

  const handleSaveReceiptImage = async () => {
    const hasPermission = await requestImagePermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Cannot save receipt without storage permission.');
      return;
    }

    try {
      if (receiptRef.current) {
        const uri = await receiptRef.current.capture();
        const filePath = uri.startsWith('file://') ? uri : `file://${uri}`;
        const exists = await RNFS.exists(filePath.replace('file://', ''));

        if (!exists) {
          Alert.alert('Error', 'Receipt image file does not exist.');
          return;
        }

        await CameraRoll.save(filePath, { type: 'photo' });
        Alert.alert('Success', 'Receipt saved to your Gallery!');
      } else {
        Alert.alert('Error', 'Receipt view is not available.');
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save receipt image.');
    }
  };

  const handleShareReceiptImage = async () => {
    try {
      if (receiptRef.current) {
        const uri = await receiptRef.current.capture();
        const fileName = `receipt_${transaction_id}.jpg`;
        const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;
        await RNFS.moveFile(uri.replace('file://', ''), path);
        await Share.open({ url: 'file://' + path });
      } else {
        Alert.alert('Error', 'Receipt view is not available.');
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share receipt image.');
    }
  };

  const formattedDate = date
    ? new Date(date).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '';

  return (
    <View style={[styles.container, { backgroundColor: dark ? '#181A20' : '#F5F6FA' }]}>
      <ViewShot ref={receiptRef} options={{ format: 'jpg', quality: 1.0 }}>
        <Image
          source={require('../assets/images/Blupay_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Image
          source={require('../assets/icons/star2.png')}
          style={styles.starIcon}
        />
        <Text style={[styles.title, { color: dark ? '#fff' : '#1A237E' }]}>
          Successful Sent!
        </Text>
        <View
          style={[
            styles.detailsContainer,
            { backgroundColor: dark ? '#23262F' : '#fff' },
          ]}
        >
          {[
            { label: 'Transaction ID', value: transaction_id },
            { label: 'Amount', value: amount },
            { label: 'Description', value: description },
            { label: 'Status', value: status },
            { label: 'Type', value: transaction_type },
            { label: 'Sender', value: sender_account_number },
            { label: 'Receiver', value: receiver_account_number },
            { label: 'Date', value: formattedDate },
          ].map((item, index) => (
            <View key={index} style={styles.detailRow}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: dark ? '#90A4AE' : '#1A237E' },
                ]}
              >
                {item.label}:
              </Text>
              <Text
                style={[
                  styles.detailValue,
                  { color: dark ? '#fff' : '#333' },
                ]}
              >
                {item.value || '--'}
              </Text>
            </View>
          ))}
        </View>
      </ViewShot>

      <View style={styles.buttonRow}>
        <RoundIconButton icon="download" label="Download" onPress={handleSaveReceiptImage} />
        <RoundIconButton icon="share-2" label="Share" onPress={handleShareReceiptImage} />
      </View>

      <TouchableOpacity
        style={styles.okButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.okButtonText}>OK</Text>
      </TouchableOpacity>
    </View>
  );
};

type RoundIconButtonProps = {
  icon: string;
  label: string;
  onPress: () => void;
};

const RoundIconButton = ({ icon, label, onPress }: RoundIconButtonProps) => (
  <TouchableOpacity style={styles.roundButton} onPress={onPress}>
    <Icon name={icon} size={24} color="#1A237E" />
    <Text style={styles.buttonLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logo: {
    width: 200,
    height: 100,
    alignSelf: 'center',
    marginVertical: 16,
  },
  starIcon: {
    width: 32,
    height: 32,
    alignSelf: 'center',
    marginVertical: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 12,
  },
  detailsContainer: {
    borderRadius: 16,
    padding: 20,
    margin: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  detailValue: {
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  roundButton: {
    width: 140,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1A237E',
    borderRadius: 24,
    marginHorizontal: 8,
    backgroundColor: '#fff',
  },
  buttonLabel: {
    color: '#1A237E',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  okButton: {
    backgroundColor: '#1A237E',
    borderRadius: 24,
    paddingVertical: 12,
    width: 300,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    alignSelf: 'center',
  },
  okButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default SendMoneySuccessful;
