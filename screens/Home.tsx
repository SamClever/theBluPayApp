import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ImageSourcePropType, ActivityIndicator, RefreshControl, Modal, TextInput, Alert, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-virtualized-view';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { COLORS, SIZES, icons, images } from '../constants';
import SubHeaderItem from '../components/SubHeaderItem';
import { services } from '../data';
import Category from '../components/Category';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SelectTransferType from '../screens/SelectTransferType';

type Nav = {
  navigate: (value: string) => void
}

const CARD_WIDTH = Math.round(Dimensions.get('window').width * 0.92);
const CARD_HEIGHT = 220;

const HomeScreen = () => {
  const { dark, colors } = useTheme();
  const navigation = useNavigation<NavigationProp<any>>();
  const { navigate } = useNavigation<Nav>();
  const [user, setUser] = useState<{
    First_name?: string;
    Last_name?: string;
    account_number?: string;
    profile_image?: string;
    account_balance?: string | number;
    pin?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinLoading, setPinLoading] = useState(false);

  const fetchUserProfile = async () => {
    try {
      setError(null);
      const token = await AsyncStorage.getItem('token');
      console.log('Fetched token from AsyncStorage:', token); // Debug log
      if (!token) {
        // Redirect to login if no token
        navigate('Login');
        throw new Error('Session expired. Please log in again.');
      }
      const response = await fetch('https://theblupayapi.com/Account/dashboard/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch user profile');
      const data = await response.json();
      setUser({
        First_name: data.kyc?.First_name,
        Last_name: data.kyc?.Last_name,
        account_number: data.account?.account_number,
        // Fix: Always use the full backend profile_image URL if present
        profile_image: data.kyc?.profile_image ? (data.kyc.profile_image.startsWith('http') ? data.kyc.profile_image : `https://theblupayapi.com${data.kyc.profile_image}`) : undefined,
        account_balance: data.account?.account_balance,
        pin: data.account?.pin_number, // <-- Use pin_number from account
      });
    } catch (e: any) {
      setUser(null);
      setError(e.message || 'Failed to load user profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setShowBalance(false); // Always hide balance on mount or refresh
    fetchUserProfile();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setShowBalance(false); // Hide balance on pull-to-refresh
    fetchUserProfile();
  };

  const handleShowBalance = () => {
    setPinModalVisible(true);
    setEnteredPin('');
    setShowBalance(false); // Always hide balance when opening modal
  };

  const handlePinSubmit = () => {
    setPinLoading(true);
    setTimeout(() => {
      setPinLoading(false);
      // Compare both as strings for safety
      if (enteredPin === String(user?.pin)) {
        setShowBalance(true);
        setPinModalVisible(false);
        // Hide balance again after 6 seconds
        setTimeout(() => setShowBalance(false), 6000);
      } else {
        setShowBalance(false); // Hide balance if wrong PIN
        Alert.alert('Incorrect PIN', 'The PIN you entered is incorrect.');
      }
    }, 500);
  };

  /**
  * Render header
  */
  const renderHeader = () => {
    const getFullName = () => {
      if (user?.First_name && user?.Last_name) {
        return `${user.First_name} ${user.Last_name}`;
      }
      if (user?.First_name) return user.First_name;
      if (user?.Last_name) return user.Last_name;
      return 'User';
    };
    // Debug log
    if (user) console.log('User state:', user);
    return (
      <View style={styles.headerContainer}>
        <View style={styles.viewLeft}>
          <Image
            source={user?.profile_image ? { uri: user.profile_image } : images.user2}
            resizeMode='cover'
            style={styles.userIcon}
            onError={() => {}}
          />
          <View style={styles.viewNameContainer}>
            <Text style={styles.greeeting}>Welcome Back!</Text>
            <Text style={[styles.title, {
              color: dark ? COLORS.white : COLORS.greyscale900
            }]}>{getFullName()}</Text>
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
   * Render main card
   */
  const renderMainCard = () => {
    const maskAccountNumber = (accNum?: string) => {
      if (!accNum || accNum.length < 4) return accNum || '';
      return '.... .... .... ' + accNum.slice(-4);
    };
    const getFullName = () => {
      if (user?.First_name && user?.Last_name) {
        return `${user.First_name} ${user.Last_name}`;
      }
      if (user?.First_name) return user.First_name;
      if (user?.Last_name) return user.Last_name;
      return 'User';
    };
    const getBalance = () => {
      if (user?.account_balance !== undefined && user?.account_balance !== null) {
        try {
          const bal = typeof user.account_balance === 'string' ? parseFloat(user.account_balance) : user.account_balance;
          return `$${Number(bal).toLocaleString()}`;
        } catch {
          return `$${user.account_balance}`;
        }
      }
      return '$0.00';
    };
    return (
      <View style={[styles.cardContainer, { flex: 1 }]}> {/* Ensure flex: 1 for alignment */}
        <View style={styles.cardTopRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.cardName}>{getFullName()}</Text>
            </View>
          </View>
          <Image
            source={images.logo}
            style={styles.mixxLogo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.cardBalanceSection}>
          <Text style={styles.cardBalanceLabel}>Available Balance</Text>
          {showBalance ? (
            <Text style={styles.cardBalanceAmount}>{getBalance()}</Text>
          ) : (
            <TouchableOpacity onPress={handleShowBalance} style={{ alignSelf: 'flex-start' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.cardBalanceAmount, { letterSpacing: 2 }]}>****</Text>
                <Image source={icons.eye as ImageSourcePropType} style={styles.cardEyeIcon} />
              </View>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.cardAccountRow}>
          <Text style={styles.cardAccountLabel}>Account</Text>
          <Text style={styles.cardAccountNumber}>{maskAccountNumber(user?.account_number)}</Text>
        </View>
      </View>
    );
  };

  const renderBlueCard = () => (
    <View style={[styles.swipeCard, { flex: 1 }]}> {/* Ensure flex: 1 for alignment */}
      <Text style={styles.swipeCardName}>{user?.First_name && user?.Last_name ? `${user.First_name} ${user.Last_name}` : 'MAULID ABDALLA'}</Text>
      <Text style={styles.swipeCardMasked}>{'********************'}</Text>
      <View style={styles.swipeCardRow}>
        <Text style={styles.swipeCardExp}>EXP   Cvv  ***</Text>
      </View>
      <View style={styles.swipeCardBottomRow}>
        <Text style={styles.swipeCardDays}>90 Days Only</Text>
        <Image source={icons.mastercard} style={styles.swipeCardLogo} resizeMode="contain" />
      </View>
    </View>
  );

  /**
   * render card
   */
  const renderCard = () => {
    const cards = [
      { key: 'main', render: renderMainCard },
      { key: 'blue', render: renderBlueCard },
    ];
    return (
      <>
        <FlatList
          data={cards}
          keyExtractor={item => item.key}
          renderItem={({ item }) => (
            <View style={styles.cardItemWrapper}>{item.render()}</View>
          )}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToAlignment="center"
          decelerationRate={0.95}
          snapToInterval={CARD_WIDTH}
          contentContainerStyle={{ paddingHorizontal: 0, marginBottom: 12, justifyContent: 'center', alignItems: 'center' }}
          style={{ marginTop: 12, marginBottom: 8 }}
        />
        <View style={styles.actionRowContainer}>
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
            onPress={() => navigation.navigate('SelectTransferType')}
            style={styles.categoryContainer}>
            <View style={styles.categoryIconContainer}>
              <Image
                source={icons.arrowUpSquare as ImageSourcePropType}
                resizeMode='contain'
                style={styles.categoryIcon}
              />
            </View>
            <Text style={styles.categoryText}>Transfer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("InOutPaymentHistory")}
            style={styles.categoryContainer}>
            <View style={styles.categoryIconContainer}>
              <Image
                source={icons.nfc as ImageSourcePropType}
                resizeMode='contain'
                style={styles.categoryIcon}
              />
            </View>
            <Text style={styles.categoryText}>Nfc</Text>
          </TouchableOpacity>
        </View>
      </>
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

  // PIN Modal
  const renderPinModal = () => (
    <Modal
      visible={pinModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setPinModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Enter PIN to view balance</Text>
          <TextInput
            style={styles.pinInput}
            value={enteredPin}
            onChangeText={setEnteredPin}
            keyboardType="number-pad"
            maxLength={6}
            secureTextEntry
            placeholder="Enter PIN"
            autoFocus
          />
          <View style={{ flexDirection: 'row', marginTop: 16 }}>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: COLORS.primary }]}
              onPress={handlePinSubmit}
              disabled={pinLoading || enteredPin.length < 4}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>{pinLoading ? 'Checking...' : 'Submit'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: COLORS.greyscale500, marginLeft: 12 }]}
              onPress={() => setPinModalVisible(false)}
              disabled={pinLoading}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>  
      <View style={[styles.container, { backgroundColor: colors.background }]}>  
        {renderHeader()}
        {renderPinModal()}
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={{ marginTop: 12, color: COLORS.primary }}>Loading profile...</Text>
          </View>
        ) : error ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text>
            <TouchableOpacity onPress={fetchUserProfile} style={{ backgroundColor: COLORS.primary, padding: 10, borderRadius: 8 }}>
              <Text style={{ color: COLORS.white }}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
          >
            {renderCard()}
            {renderCategories()}
          </ScrollView>
        )}
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
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 18, // match swipeCard
    backgroundColor: COLORS.primary,
    // marginTop: 16, // REMOVE to match swipeCard
    paddingHorizontal: 18, // match swipeCard
    paddingTop: 18,
    paddingBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  cardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  cardWelcome: {
    fontSize: 14,
    fontFamily: "Urbanist Regular",
    color: COLORS.white,
    marginBottom: 4,
  },
  cardName: {
    fontSize: 18,
    fontFamily: "Urbanist Bold",
    color: COLORS.white,
  },
  mixxLogo: {
    width: 80,
    height: 24,
  },
  cardBalanceSection: {
    marginVertical: 16,
  },
  cardBalanceLabel: {
    fontSize: 14,
    fontFamily: "Urbanist Regular",
    color: COLORS.white,
    marginBottom: 4,
  },
  cardBalanceAmount: {
    fontSize: 32,
    fontFamily: "Urbanist ExtraBold",
    color: COLORS.white,
  },
  cardAccountRow: {
    marginTop: 8,
    marginBottom: 16,
  },
  cardAccountLabel: {
    fontSize: 14,
    fontFamily: "Urbanist Regular",
    color: COLORS.white,
    marginBottom: 4,
  },
  cardAccountNumber: {
    fontSize: 18,
    fontFamily: "Urbanist Bold",
    color: COLORS.white,
  },
  actionRowContainer: {
    width: SIZES.width - 32,
    height: 90,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginTop: 18,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: 300,
    alignItems: 'center',
  },
  pinInput: {
    width: 180,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 8,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  cardEyeIcon: {
    width: 22,
    height: 22,
    tintColor: '#fff',
    marginLeft: 8,
  },
  // Add styles for blue card
  swipeCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
    marginHorizontal: 0,
    justifyContent: 'space-between',
    backgroundColor: '#1A5AC7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  swipeCardName: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Urbanist Bold',
    marginBottom: 6,
  },
  swipeCardMasked: {
    color: '#FFD600',
    fontSize: 18,
    letterSpacing: 2,
    fontFamily: 'Urbanist Bold',
    marginBottom: 10,
  },
  swipeCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  swipeCardExp: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Urbanist Regular',
  },
  swipeCardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  swipeCardDays: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Urbanist Regular',
  },
  swipeCardLogo: {
    width: 38,
    height: 38,
  },
  cardItemWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
  },
})

export default HomeScreen