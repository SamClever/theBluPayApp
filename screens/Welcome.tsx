import { View, Text, StyleSheet, TouchableOpacity, Image, ImageSourcePropType, ScrollView } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES, icons, images } from "../constants";
import SocialButtonV2 from "../components/SocialButtonV2";
import { useTheme } from "../theme/ThemeProvider";
import { useNavigation } from "@react-navigation/native";

type Nav = {
  navigate: (value: string) => void
}

// Welcome screen
const Welcome = () => {
  const { navigate } = useNavigation<Nav>();
  const { colors, dark } = useTheme();

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Image
            source={require('../assets/images/Blupay_logo.png')}
            resizeMode="contain"
            style={styles.logo}
          />
          <Text style={[styles.title, { color: colors.text }]}>Welcome Back!</Text>
          <Text style={[styles.subtitle, { color: dark ? COLORS.white : "black" }]}>
            Hello there, personalize your financial journey for maximum returns and peace of mind on AllPay.
          </Text>
          <View style={{ marginVertical: 32 }}>
            <SocialButtonV2 title="Continue with Apple" icon={icons.appleLogo} onPress={() => navigate("Signup")}
              iconStyles={{ tintColor: dark ? COLORS.white : COLORS.black }} />
            <SocialButtonV2 title="Continue with Google" icon={icons.google} onPress={() => navigate("Signup")} />
            <SocialButtonV2 title="Continue with Email" icon={icons.email2} onPress={() => navigate("Signup")} />
          </View>
          <View style={{ flexDirection: "row" }}>
            <Text style={[styles.loginTitle, {
              color: dark ? COLORS.white : "black"
            }]}>Already have account? </Text>
            <TouchableOpacity
              onPress={() => navigate("Login")}>
              <Text style={styles.loginSubtitle}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.bottomContainer}>
          <Text style={[styles.bottomTitle, {
            color: dark ? COLORS.white : COLORS.black }]}>
            By continuing, you accept the Terms Of Use and
          </Text>
          <TouchableOpacity onPress={() => navigate("Login")}>
            <Text style={[styles.bottomSubtitle, {
              color: dark ? COLORS.white : COLORS.black
            }]}>Privacy Policy.</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 200,
    height: 140,
    marginBottom: -22,
    marginTop: -22
  },

  logoBlupay_logo2: {
    width: 100,
    height: 100,
    marginBottom: 22,
    marginTop: -22,
    // tintColor: COLORS.primary
  },
  title: {
    fontSize: 28,
    fontFamily: "Urbanist Bold",
    color: COLORS.black,
    marginVertical: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    fontFamily: "Urbanist Regular",
    color: "black",
    textAlign: "center",
    paddingHorizontal: 16,
  },
  loginTitle: {
    fontSize: 14,
    fontFamily: "Urbanist Regular",
    color: "black",
  },
  loginSubtitle: {
    fontSize: 14,
    fontFamily: "Urbanist SemiBold",
    color: COLORS.primary,
  },
  bottomContainer: {
    paddingVertical: 24,
    width: SIZES.width - 32,
    alignSelf: 'center',
    alignItems: "center",
  },
  bottomTitle: {
    fontSize: 12,
    fontFamily: "Urbanist Regular",
    color: COLORS.black,
  },
  bottomSubtitle: {
    fontSize: 12,
    fontFamily: "Urbanist Regular",
    color: COLORS.black,
    textDecorationLine: "underline",
    marginTop: 2,
  },
});

export default Welcome;