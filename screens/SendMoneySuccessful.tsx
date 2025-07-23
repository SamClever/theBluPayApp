import React, { useRef } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { Image } from 'react-native';
import { COLORS, SIZES, illustrations } from '../constants';
import Button from '../components/Button';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { Alert, Platform, PermissionsAndroid, Linking } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather'; // or any icon set you prefer
import CameraRoll from '@react-native-camera-roll/camera-roll';

type Nav = {
    navigate: (value: string) => void
}

type SuccessRouteProp = RouteProp<{
    params: {
        transaction_id?: string;
        amount?: string;
        description?: string;
        status?: string;
        transaction_type?: string;
        sender_account_number?: string;
        reciver_account_number?: string;
        date?: string;
    }
}, 'params'>;

// Fix RoundIconButton typing and style naming

type RoundIconButtonProps = {
  icon: string;
  label: string;
  onPress: () => void;
};

const roundButtonStyles = StyleSheet.create({
  roundButton: {
    width: 140, // fixed width for both buttons
    height: 48, // fixed height for both buttons
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
});

const RoundIconButton = ({ icon, label, onPress }: RoundIconButtonProps) => (
  <TouchableOpacity style={roundButtonStyles.roundButton} onPress={onPress}>
    <Icon name={icon} size={24} color="#1A237E" />
    <Text style={roundButtonStyles.buttonLabel}>{label}</Text>
  </TouchableOpacity>
);

const requestImagePermission = async () => {
  if (Platform.OS === 'android') {
    if (Platform.Version >= 33) {
      // Android 13+
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      // Android 12 and below
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  }
  return true;
};

const SendMoneySuccessful = () => {
    const { navigate } = useNavigation<Nav>();
    const { colors, dark } = useTheme();
    const route = useRoute<SuccessRouteProp>();
    const {
        transaction_id,
        amount,
        description,
        status,
        transaction_type,
        sender_account_number,
        reciver_account_number,
        date
    } = route.params || {};

    const receiptRef = useRef<ViewShot>(null);

    // Remove all storage permission logic

    const handleSaveReceiptImage = async () => {
      const hasPermission = await requestImagePermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Cannot save image without permission.');
        return;
      }
      try {
        if (receiptRef.current) {
          const uri = await (receiptRef.current as any).capture({ format: 'jpg', quality: 1.0 });
          console.log('Captured URI:', uri);

          // Check if file exists
          const filePath = uri.startsWith('file://') ? uri : `file://${uri}`;
          const exists = await RNFS.exists(filePath.replace('file://', ''));
          console.log('File exists:', exists);

          if (!exists) {
            Alert.alert('Error', 'Receipt image file does not exist.');
            return;
          }

          await CameraRoll.save(filePath, { type: 'photo' });
          Alert.alert('Success', 'Receipt image saved to your Gallery!');
        } else {
          Alert.alert('Error', 'Receipt view is not available.');
        }
      } catch (error) {
        const errorMsg = error && error.message ? error.message : String(error);
        console.log('Save error:', errorMsg);
        Alert.alert('Error', `Failed to save receipt image.\n${errorMsg}`);
      }
    };

    const handleShareReceiptImage = async () => {
      try {
        if (receiptRef.current) {
          const uri = await (receiptRef.current as any).capture({ format: 'jpg', quality: 1.0 });
          const fileName = `receipt_${transaction_id}.jpg`;
          const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;
          await RNFS.moveFile(uri.replace('file://', ''), path);
          await Share.open({ url: 'file://' + path });
        } else {
          Alert.alert('Error', 'Receipt view is not available.');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to share receipt image.');
      }
    };

    // Format the date for display
    const formattedDate = date ? new Date(date).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }) : '';

    return (
        <View style={[styles.container, { backgroundColor: dark ? '#181A20' : '#F5F6FA' }]}>
            <ViewShot ref={receiptRef} options={{ format: 'jpg', quality: 1.0 }}>
                <Image
                    source={require('../assets/images/Blupay_logo.png')}
                    resizeMode='contain'
                    style={styles.successImage}
                />
                <Image
                    source={require('../assets/icons/star2.png')}
                    style={styles.starIcon}
                />
                <Text
  style={[
    styles.title,
    { color: dark ? '#fff' : '#1A237E' } // white in dark mode, blue in light mode
  ]}
>
  Successful Sent!
</Text>
                <View style={[
  styles.detailsContainer,
  { backgroundColor: dark ? '#23262F' : '#fff' }
]}>
  <View style={styles.detailRow}>
    <Text style={[
    styles.detailLabel,
    { color: dark ? '#90A4AE' : '#1A237E' }
  ]}>Transaction ID:</Text>
    <Text style={[
    styles.detailValue,
    { color: dark ? '#fff' : '#333' }
  ]}>{transaction_id}</Text>
  </View>
  <View style={styles.detailRow}>
    <Text style={[
    styles.detailLabel,
    { color: dark ? '#90A4AE' : '#1A237E' }
  ]}>Amount:</Text>
    <Text style={[
    styles.detailValue,
    { color: dark ? '#fff' : '#333' }
  ]}>{amount}</Text>
  </View>
  <View style={styles.detailRow}>
    <Text style={[
    styles.detailLabel,
    { color: dark ? '#90A4AE' : '#1A237E' }
  ]}>Description:</Text>
    <Text style={[
    styles.detailValue,
    { color: dark ? '#fff' : '#333' }
  ]}>{description}</Text>
  </View>
  <View style={styles.detailRow}>
    <Text style={[
    styles.detailLabel,
    { color: dark ? '#90A4AE' : '#1A237E' }
  ]}>Status:</Text>
    <Text style={[
    styles.detailValue,
    { color: dark ? '#fff' : '#333' }
  ]}>{status}</Text>
  </View>
  <View style={styles.detailRow}>
    <Text style={[
    styles.detailLabel,
    { color: dark ? '#90A4AE' : '#1A237E' }
  ]}>Type:</Text>
    <Text style={[
    styles.detailValue,
    { color: dark ? '#fff' : '#333' }
  ]}>{transaction_type}</Text>
  </View>
  <View style={styles.divider} />
  <View style={styles.detailRow}>
    <Text style={[
    styles.detailLabel,
    { color: dark ? '#90A4AE' : '#1A237E' }
  ]}>Sender:</Text>
    <Text style={[
    styles.detailValue,
    { color: dark ? '#fff' : '#333' }
  ]}>{sender_account_number}</Text>
  </View>
  <View style={styles.detailRow}>
    <Text style={[
    styles.detailLabel,
    { color: dark ? '#90A4AE' : '#1A237E' }
  ]}>Receiver:</Text>
    <Text style={[
    styles.detailValue,
    { color: dark ? '#fff' : '#333' }
  ]}>{reciver_account_number}</Text>
  </View>
  <View style={styles.divider} />
  <View style={styles.detailRow}>
    <Text style={[
    styles.detailLabel,
    { color: dark ? '#90A4AE' : '#1A237E' }
  ]}>Date:</Text>
    <Text style={[
    styles.detailValue,
    { color: dark ? '#fff' : '#333' }
  ]}>{formattedDate}</Text>
  </View>
</View>
            </ViewShot>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
  <RoundIconButton icon="download" label="Download" onPress={handleSaveReceiptImage} />
  <RoundIconButton icon="share-2" label="Share" onPress={handleShareReceiptImage} />
</View>
<TouchableOpacity style={styles.okButton} onPress={() => navigate("Home")}>
  <Text style={styles.okButtonText}>OK</Text>
</TouchableOpacity>
        </View>
    )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor is set inline in JSX
  },
  successImage: {
    width: 200,
    height: 100,
    alignSelf: 'center',
    marginVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 12,
    // color is set inline
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Urbanist Regular",
    color: COLORS.greyscale900,
    textAlign: 'center',
    marginTop: 6
  },
  bottomContainer: {
    position: "absolute",
    bottom: 28,
    right: 0,
    left: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16
  },
  sendBtn: {
    width: SIZES.width - 32,
  },
  okButton: {
    backgroundColor: '#1A237E',
    borderRadius: 24,
    paddingVertical: 12,
    width: 300, // 140 (Download) + 140 (Share) + 2*8 (margins)
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
  detailsContainer: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    // backgroundColor is set inline in JSX
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    // color is set inline in JSX
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'normal',
    // color is set inline in JSX
  },
  divider: {
    height: 1,
    marginVertical: 10,
    // backgroundColor is set inline in JSX
  },
  starIcon: {
    width: 32,
    height: 32,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
});

export default SendMoneySuccessful