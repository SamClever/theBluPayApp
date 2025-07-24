import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageSourcePropType, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, icons, illustrations } from '../constants';
import Header from '../components/Header';
import { useTheme } from '../theme/ThemeProvider';
import bankSuccess from '../assets/illustrations/bank_success.png'; // or your preferred illustration

const SelectTransferType = () => {
  const navigation = useNavigation<any>();
  const { dark } = useTheme();
  const backgroundColor = dark ? COLORS.dark1 : COLORS.white;
  const cardBackground = dark ? COLORS.dark2 : COLORS.white;
  const mobileBorder = dark ? '#2ecc4060' : '#1DB95420';
  const bankBorder = dark ? '#1877F260' : '#1877F220';
  const optionTextColor = dark ? COLORS.white : COLORS.greyscale900;
  const subtitleColor = dark ? COLORS.grayscale300 : COLORS.grayscale700;

  const moneyIconColor = dark ? '#1DB954' : '#1DB954'; // You can use a lighter green for dark mode if you want
  const bankIconColor = dark ? '#4F8EF7' : '#1877F2'; // Use a lighter blue for dark mode if you want
  const iconBoxGreenBg = dark ? '#1a3d2b' : '#D1FADF';
  const iconBoxBlueBg = dark ? '#1a2940' : '#D1E9FF';

  const illustration = illustrations.onboarding1;
  const illustrationContainerBg = dark ? COLORS.dark2 : '#F3F6FB';

  const headerBg = dark ? 'transparent' : '#F3F6FB'; // or any light color you prefer

  return (
    <View style={[styles.area, { backgroundColor }]}>
      <View style={[styles.container, { backgroundColor }]}>
        <View style={{ backgroundColor: headerBg, borderRadius: 10, marginBottom: 10 }}>
          <Header title="Select Transfer Type" style={{ backgroundColor: headerBg }} />
        </View>
        {/* <Text style={[styles.subtitle, { color: subtitleColor }]}>Choose how you want to send money</Text> */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[styles.option, { backgroundColor: cardBackground, borderColor: mobileBorder, marginBottom: 32 }]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('MobileMoneyTransfer')}
          >
            <View style={[styles.iconBoxGreen, { backgroundColor: iconBoxGreenBg }]}>
              <Image
                source={icons.money as ImageSourcePropType}
                style={[styles.icon, { tintColor: moneyIconColor }]}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.optionText, { color: optionTextColor }]}>Mobile Money</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.option, { backgroundColor: cardBackground, borderColor: bankBorder }]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('BankTransfer')}
          >
            <View style={[styles.iconBoxBlue, { backgroundColor: iconBoxBlueBg }]}>
              <Image
                source={icons.bank as ImageSourcePropType}
                style={[styles.icon, { tintColor: bankIconColor }]}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.optionText, { color: optionTextColor }]}>Bank Transfer</Text>
          </TouchableOpacity>
        </View>
        {/* Illustration container below options */}
        <View style={[styles.illustrationContainer, { backgroundColor: illustrationContainerBg }]}>
          <Image
            source={illustration}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  area: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.grayscale700 || '#555',
    marginBottom: 36,
    textAlign: 'center',
    fontFamily: 'Urbanist Medium',
    marginTop: 15,
  },
  optionsContainer: {
    width: '100%',
    marginTop: 50,
  },
  option: {
    backgroundColor: COLORS.white || '#fff',
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 28,
    paddingVertical: 22,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    width: '100%',
  },
  iconBoxGreen: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#D1FADF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
  },
  iconBoxBlue: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#D1E9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
  },
  icon: {
    width: 28,
    height: 28,
  },
  optionText: {
    fontSize: 22,
    fontFamily: 'Urbanist Bold',
    color: COLORS.greyscale900 || '#222',
    letterSpacing: 0.2,
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  illustrationContainer: {
    width: 330,
    height: 350,
    backgroundColor: '#F3F6FB',
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 5,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 6,
    padding: 12,
  },
});

export default SelectTransferType; 