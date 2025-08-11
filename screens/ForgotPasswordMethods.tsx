import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import React, { useState } from 'react';
import { COLORS, SIZES, icons, illustrations } from '../constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import Button from '../components/Button';
import { useTheme } from '../theme/ThemeProvider';
import { useNavigation } from '@react-navigation/native';

type Nav = {
  navigate: (value: string) => void
}

const ForgotPasswordMethods = () => {
  const { navigate } = useNavigation<Nav>();
  const [selectedMethod, setSelectedMethod] = useState('email');
  const { colors, dark } = useTheme();

  const handleMethodPress = (method: any) => {
    setSelectedMethod(method);
  };

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Forgot Password" />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.passwordContainer}>
            <Image
              source={dark ? illustrations.passwordDark : illustrations.password}
              resizeMode='contain'
              style={styles.password}
            />
          </View>
          <Text style={[styles.title, {
            color: dark ? COLORS.white : COLORS.greyscale900
          }]}>Select which contact details
            should we use to reset your password</Text>
          {/* SMS method hidden as requested */}
          <TouchableOpacity
            style={[
              styles.methodContainer,
              selectedMethod === 'email' && { borderColor: COLORS.primary, borderWidth: 2 }, // Customize the border color for Email
            ]}
            onPress={() => handleMethodPress('email')}>
            <View style={styles.iconContainer}>
              <Image
                source={icons.email as ImageSourcePropType}
                resizeMode='contain'
                style={styles.icon} />
            </View>
            <View>
              <Text style={styles.methodTitle}>via Email:</Text>
              <Text style={[styles.methodSubtitle, {
                color: dark ? COLORS.white : COLORS.black
              }]}>and***ley@yourdomain.com</Text>
            </View>
          </TouchableOpacity>
          <Button
            title="Continue"
            filled
            style={styles.button}
            onPress={() => navigate('ForgotPasswordEmail')}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  )
};

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: COLORS.white
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16
  },
  password: {
    width: 276,
    height: 250
  },
  passwordContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 32
  },
  title: {
    fontSize: 18,
    fontFamily: "Urbanist Medium",
    color: COLORS.greyscale900
  },
  methodContainer: {
    width: SIZES.width - 32,
    height: 112,
    borderRadius: 32,
    borderColor: "gray",
    borderWidth: .3,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.tansparentPrimary,
    marginHorizontal: 16
  },
  icon: {
    width: 32,
    height: 32,
    tintColor: COLORS.primary
  },
  methodTitle: {
    fontSize: 14,
    fontFamily: "Urbanist Medium",
    color: COLORS.greyscale600
  },
  methodSubtitle: {
    fontSize: 16,
    fontFamily: "Urbanist Bold",
    color: COLORS.black,
    marginTop: 12
  },
  button: {
    borderRadius: 32,
    marginVertical: 22
  }
})

export default ForgotPasswordMethods