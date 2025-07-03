import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ImageSourcePropType } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-virtualized-view';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { COLORS, SIZES, icons, images } from '../constants';
import SubHeaderItem from '../components/SubHeaderItem';
import { services } from '../data';
import Category from '../components/Category';

type Nav = {
  navigate: (value: string) => void
}

const HomeScreen = () => {
  const { dark, colors } = useTheme();
  const navigation = useNavigation<NavigationProp<any>>();
  const { navigate } = useNavigation<Nav>();

  /**
  * Render header
  */
  const renderHeader = () => {
    return (
      <View style={styles.headerContainer}>
        <View style={styles.viewLeft}>
          <Image
            source={images.user2}
            resizeMode='contain'
            style={styles.userIcon}
          />
          <View style={styles.viewNameContainer}>
            <Text style={styles.greeeting}>Good Morning👋</Text>
            <Text style={[styles.title, {
              color: dark ? COLORS.white : COLORS.greyscale900
            }]}>SamClever</Text>
          </View>
        </View>
        <View style={styles.viewRight}>
          <TouchableOpacity
            onPress={() => navigation.navigate("PromoAndDiscount")}>
            <Image
              source={icons.discount3 as ImageSourcePropType}
              resizeMode='contain'
              style={[styles.bookmarkIcon, { tintColor: dark ? COLORS.white : COLORS.greyscale900 }]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("Notifications")}>
            <Image
              source={icons.notificationBell2 as ImageSourcePropType}
              resizeMode='contain'
              style={[styles.bellIcon, { tintColor: dark ? COLORS.white : COLORS.greyscale900 }]}
            />
          </TouchableOpacity>
        </View>
      </View>
    )
  }
  /**
   * Render card
   */
  const renderCard = () => {
    return (
      <View style={styles.cardContainer}>
        <View style={styles.topCardContainer}>
          <View>
            <Text style={styles.username}>Salum M Salum</Text>
            <Text style={styles.cardNum}>.... .... .... 7919</Text>
          </View>
          <Image
            source={icons.mastercard as ImageSourcePropType}
            resizeMode='contain'
            style={styles.cardIcon}
          />
        </View>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceText}>Your balance</Text>
          <Text style={styles.balanceAmount}>$12,689</Text>
        </View>
        <View style={styles.bottomCardContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate("TransferToBankSelectBank")}
            style={styles.categoryContainer}>
            <View style={styles.categoryIconContainer}>
              <Image
                source={icons.send as ImageSourcePropType}
                resizeMode='contain'
                style={styles.categoryIcon}
              />
            </View>
            <Text style={styles.categoryText}>Transfer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("SendMoney")}
            style={styles.categoryContainer}>
            <View style={styles.categoryIconContainer}>
              <Image
                source={icons.sendMoney as ImageSourcePropType}
                resizeMode='contain'
                style={styles.categoryIcon}
              />
            </View>
            <Text style={styles.categoryText}>Send</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("RequestMoney")}
            style={styles.categoryContainer}>
            <View style={styles.categoryIconContainer}>
              <Image
                source={icons.arrowDownSquare as ImageSourcePropType}
                resizeMode='contain'
                style={styles.categoryIcon}
              />
            </View>
            <Text style={styles.categoryText}>Request</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("InOutPaymentHistory")}
            style={styles.categoryContainer}>
            <View style={styles.categoryIconContainer}>
              <Image
                source={icons.swapUpDown as ImageSourcePropType}
                resizeMode='contain'
                style={styles.categoryIcon}
              />
            </View>
            <Text style={styles.categoryText}>In & Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
  /**
   * render category
   */
  const renderCategories = () => {
    return (
      <View>
        <SubHeaderItem
          title="Services"
          navTitle="See all"
          onPress={() => navigate("AllServices")}
        />
        <FlatList
          data={services.slice(0, 12)}
          keyExtractor={(item, index) => index.toString()}
          horizontal={false}
          numColumns={4} // Render two items per row
          style={{ marginTop: 0 }}
          renderItem={({ item, index }) => (
            <Category
              name={item.name}
              icon={item.icon}
              iconColor={item.iconColor}
              backgroundColor={item.backgroundColor}
              onPress={() => {
                if (item.onPress !== "") {
                  navigation.navigate(item.onPress);
                }
              }}
            />
          )}
        />
      </View>
    )
  }

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderCard()}
          {renderCategories()}
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
  headerContainer: {
    flexDirection: "row",
    width: SIZES.width - 32,
    justifyContent: "space-between",
    alignItems: "center"
  },
  userIcon: {
    width: 48,
    height: 48,
    borderRadius: 32
  },
  viewLeft: {
    flexDirection: "row",
    alignItems: "center"
  },
  greeeting: {
    fontSize: 12,
    fontFamily: "Urbanist Regular",
    color: "gray",
    marginBottom: 4
  },
  title: {
    fontSize: 20,
    fontFamily: "Urbanist Bold",
    color: COLORS.greyscale900
  },
  viewNameContainer: {
    marginLeft: 12
  },
  viewRight: {
    flexDirection: "row",
    alignItems: "center"
  },
  bellIcon: {
    height: 24,
    width: 24,
    tintColor: COLORS.black,
    marginRight: 8
  },
  bookmarkIcon: {
    height: 24,
    width: 24,
    tintColor: COLORS.black
  },
  cardContainer: {
    width: SIZES.width - 32,
    height: 340,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    marginTop: 16,
    paddingHorizontal: 22,
  },
  topCardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16
  },
  username: {
    fontSize: 20,
    fontFamily: "Urbanist Bold",
    color: COLORS.white,
    marginBottom: 8
  },
  cardNum: {
    fontSize: 18,
    fontFamily: "Urbanist Bold",
    color: COLORS.white
  },
  cardIcon: {
    height: 45,
    width: 72,
  },
  balanceContainer: {
    marginVertical: 32
  },
  balanceText: {
    fontSize: 16,
    fontFamily: "Urbanist Regular",
    color: COLORS.white,
    marginBottom: 8
  },
  balanceAmount: {
    fontSize: 48,
    fontFamily: "Urbanist ExtraBold",
    color: COLORS.white
  },
  bottomCardContainer: {
    width: "100%",
    height: 90,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12
  },
  categoryContainer: {
    alignItems: "center",
  },
  categoryIconContainer: {
    height: 52,
    width: 52,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.tansparentPrimary,
    marginBottom: 4
  },
  categoryIcon: {
    height: 24,
    width: 24,
    tintColor: COLORS.primary
  },
  categoryText: {
    fontSize: 14,
    fontFamily: "Urbanist SemiBold",
    color: COLORS.primary
  }
})

export default HomeScreen