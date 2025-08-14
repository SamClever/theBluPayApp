import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ImageSourcePropType, ActivityIndicator, RefreshControl, Modal, TextInput, Alert, Dimensions, Animated } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
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
import Topup from '../screens/Topup';
import LinearGradient from 'react-native-linear-gradient';
import CustomAlertModal from '../components/CustomAlertModal';


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
  const pinInputs = useRef<(TextInput | null)[]>([]);
  const [pinLoading, setPinLoading] = useState(false);
  const [canSubmitPin, setCanSubmitPin] = useState(true);
  const [pinError, setPinError] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);
  const shakeAnimation = useRef(new Animated.Value(0)).current;

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
      if (!response.ok) {
        const status = response.status;
        let bodyText = '';
        try {
          bodyText = await response.text();
        } catch {}
        console.warn('Dashboard fetch failed', { status, bodyText });
        if (status === 401 || status === 403) {
          // Token invalid/expired – clear and force re-login
          await AsyncStorage.removeItem('token');
          navigate('Login');
          throw new Error('Session expired. Please log in again.');
        }
        const snippet = bodyText ? (bodyText.length > 140 ? bodyText.slice(0, 140) + '…' : bodyText) : '';
        throw new Error(`Failed to fetch user profile (status ${status})${snippet ? `: ${snippet}` : ''}`);
      }
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
      setProfileImageError(false); // Reset profile image error when new data loads
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
    setPinError(false);
    setShowBalance(false); // Always hide balance when opening modal
  };

  const startShakeAnimation = () => {
    shakeAnimation.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handlePinSubmit = () => {
    setPinLoading(true);
    setTimeout(() => {
      setPinLoading(false);
      // Compare both as strings for safety
      if (enteredPin === String(user?.pin)) {
        setShowBalance(true);
        setPinModalVisible(false);
        setPinError(false);
        // Hide balance again after 6 seconds
        setTimeout(() => setShowBalance(false), 6000);
      } else {
        setShowBalance(false); // Hide balance if wrong PIN
        setPinError(true);
        // Shake animation for visual feedback
        startShakeAnimation();
        // Clear PIN inputs after error
        setEnteredPin('');
        // Reset error after 3 seconds
        setTimeout(() => setPinError(false), 3000);
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

    const getInitials = () => {
      if (user?.First_name && user?.Last_name) {
        return `${user.First_name.charAt(0).toUpperCase()}${user.Last_name.charAt(0).toUpperCase()}`;
      }
      if (user?.First_name) {
        return user.First_name.charAt(0).toUpperCase();
      }
      if (user?.Last_name) {
        return user.Last_name.charAt(0).toUpperCase();
      }
      return 'U';
    };

    const getInitialsBackgroundColor = () => {
      const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
      ];
      
      if (user?.First_name) {
        // Use first character to determine color
        const charCode = user.First_name.charCodeAt(0);
        return colors[charCode % colors.length];
      }
      return COLORS.primary;
    };

    const renderProfilePicture = () => {
      // If user has a valid profile image, show it
      if (user?.profile_image && user.profile_image.trim() !== '' && !profileImageError) {
        return (
          <Image
            source={{ uri: user.profile_image }}
            resizeMode='cover'
            style={styles.userIcon}
            onError={(error) => {
              console.log('Profile image error:', error);
              console.log('Setting profileImageError to true');
              setProfileImageError(true);
            }}
            onLoad={() => {
              console.log('Profile image loaded successfully');
              setProfileImageError(false);
            }}
          />
        );
      }

      // Otherwise show initials-based avatar
      return (
        <View style={[styles.userIcon, styles.initialsContainer, { backgroundColor: getInitialsBackgroundColor() }]}>
          <Text style={styles.initialsText}>{getInitials()}</Text>
        </View>
      );
    };

    // Debug log
    if (user) {
      console.log('User state:', user);
      console.log('Profile image value:', user.profile_image);
      console.log('Profile image error state:', profileImageError);
      console.log('Will use initials:', !user.profile_image || user.profile_image.trim() === '' || profileImageError);
      console.log('Initials:', getInitials());
      console.log('Background color:', getInitialsBackgroundColor());
    }
    return (
      <View style={styles.headerContainer}>
        <View style={styles.viewLeft}>
          {renderProfilePicture()}
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
          return `Tsh ${Number(bal).toLocaleString()}`;
        } catch {
          return `Tsh ${user.account_balance}`;
        }
      }
      return 'Tsh 0.00';
    };
    return (
      <LinearGradient
        colors={['#E3ECFF', '#3B82F6', '#232323']}
        style={[styles.cardContainer, { flex: 1, overflow: 'hidden' }]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {/* Abstract lighter gray shapes */}
        <View style={{
          position: 'absolute',
          top: -60,
          left: -80,
          width: 220,
          height: 140,
          backgroundColor: '#353535',
          borderRadius: 120,
          opacity: 0.7,
        }} />
        <View style={{
          position: 'absolute',
          bottom: -40,
          right: -60,
          width: 180,
          height: 120,
          backgroundColor: '#353535',
          borderRadius: 100,
          opacity: 0.7,
        }} />
        <View style={styles.cardTopRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.cardName}>{getFullName()}</Text>
            </View>
          </View>
          <View>
          <Image
              source={require('../assets/images/Blupay_logo.png')}
              style={[styles.blupayLogo, { width: 60, height: 30 }]}
            resizeMode="contain"
          />
          </View>
        </View>
        <View style={styles.cardBalanceSection}>
          <Text style={styles.cardBalanceLabel2}>Available Balance</Text>
          {showBalance ? (
            <View style={styles.balanceRow}>
            <Text style={styles.cardBalanceAmount}>{getBalance()}</Text>
              <TouchableOpacity onPress={handleShowBalance} style={styles.eyeButton}>
                <Image source={icons.eye as ImageSourcePropType} style={styles.cardEyeIcon} />
              </TouchableOpacity>
              </View>
          ) : (
            <TouchableOpacity onPress={handleShowBalance} style={styles.balanceRow}>
              <Text style={[styles.cardBalanceAmount, { letterSpacing: 3 }]}>****</Text>
              <Image source={icons.eye as ImageSourcePropType} style={styles.cardEyeIcon} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.cardAccountRow}>
          <Text style={styles.cardAccountLabel}>Account Number</Text>
          <View style={styles.accountNumberRow}>
          <Text style={styles.cardAccountNumber}>{maskAccountNumber(user?.account_number)}</Text>
            
          </View>
        </View>
      </LinearGradient>
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
        <Image source={icons.mastercard as ImageSourcePropType} style={styles.swipeCardLogo} resizeMode="contain" />
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
        <View style={[styles.actionRowContainer, { backgroundColor: dark ? COLORS.dark2 : COLORS.white }]}>
        <TouchableOpacity
            onPress={() => navigation.navigate("Topup")}
            style={styles.categoryContainer}>
            <View style={[styles.categoryIconContainer, { backgroundColor: dark ? COLORS.primary + '20' : COLORS.primary + '15' }]}>
              <Image
                source={require('../assets/icons/topup.png')}
                resizeMode='contain'
                style={[styles.categoryIcon, { tintColor: COLORS.primary }]}
              />
            </View>
            <Text style={[styles.categoryText, { color: dark ? COLORS.white : COLORS.black }]}>Top Up</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => navigation.navigate('SendMoney')}
            style={styles.categoryContainer}>
            <View style={[styles.categoryIconContainer, { backgroundColor: dark ? '#4F8EF7' + '20' : '#4F8EF7' + '15' }]}>
              <Image
                source={icons.sendMoney as ImageSourcePropType}
                resizeMode='contain'
                style={[styles.categoryIcon, { tintColor: '#4F8EF7' }]}
              />
            </View>
            <Text style={[styles.categoryText, { color: dark ? COLORS.white : COLORS.black }]}>Send</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => navigation.navigate('SelectTransferType')}
            style={styles.categoryContainer}>
            <View style={[styles.categoryIconContainer, { backgroundColor: dark ? '#8F6ED5' + '20' : '#8F6ED5' + '15' }]}>
              <Image
                source={icons.arrowUpSquare as ImageSourcePropType}
                resizeMode='contain'
                style={[styles.categoryIcon, { tintColor: '#8F6ED5' }]}
              />
            </View>
            <Text style={[styles.categoryText, { color: dark ? COLORS.white : COLORS.black }]}>Withdraw</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => navigation.navigate("InOutPaymentHistory")}
            style={styles.categoryContainer}>
            <View style={[styles.categoryIconContainer, { backgroundColor: dark ? '#E91E63' + '20' : '#E91E63' + '15' }]}>
              <Image
                source={icons.nfc as ImageSourcePropType}
                resizeMode='contain'
                style={[styles.categoryIcon, { tintColor: '#E91E63' }]}
              />
            </View>
            <Text style={[styles.categoryText, { color: dark ? COLORS.white : COLORS.black }]}>Nfc</Text>
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
          data={services.slice(0, 8)} // Limit to 8 items for 2 rows of 4
          keyExtractor={(item, index) => index.toString()}
          horizontal={false}
          numColumns={4} // 4 items per row
          style={{ marginTop: 0 }}
          scrollEnabled={false} // Disable scrolling since we want fixed 2 rows
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
        <View style={[
          styles.pinModalContent,
          { backgroundColor: dark ? COLORS.dark2 : COLORS.white }
        ]}>
          <Text style={[
            styles.modalTitle,
            { color: dark ? COLORS.white : COLORS.black, marginBottom: 8 }
          ]}>
            View Balance
          </Text>
          <Text style={[
            styles.modalSubtitle,
            { color: dark ? COLORS.grayscale700 : COLORS.grayscale700, marginBottom: 18 }
          ]}>
            Enter your PIN to view your account balance
          </Text>
          <Animated.View 
            style={[
              styles.pinBoxesRow,
              { transform: [{ translateX: shakeAnimation }] }
            ]}
          >
            {[0,1,2,3].map((i) => (
              <TextInput
                key={i}
                ref={ref => { if (ref) pinInputs.current[i] = ref; }}
                style={[
                  styles.pinBox,
                  {
                    backgroundColor: dark ? COLORS.dark1 : COLORS.secondaryWhite,
                    color: dark ? COLORS.white : COLORS.black,
                    borderColor: pinError ? '#FF3B30' : (dark ? COLORS.grayscale700 : COLORS.gray2),
                    borderWidth: pinError ? 2 : 1.5,
                  }
                ]}
                value={enteredPin[i] || ''}
                onChangeText={text => {
                  if (/^\d?$/.test(text)) {
                    const newPin = enteredPin.split('');
                    newPin[i] = text;
                    setEnteredPin(newPin.join(''));
                    setPinError(false); // Clear error when user starts typing
                    if (!canSubmitPin && text) setCanSubmitPin(true);
                    if (text && i < 3) {
                      pinInputs.current[i+1]?.focus();
                    }
                    if (text === '' && i > 0) {
                      pinInputs.current[i-1]?.focus();
                    }
                  }
                }}
                keyboardType="number-pad"
                maxLength={1}
                secureTextEntry
                placeholder=""
                placeholderTextColor={dark ? COLORS.gray : COLORS.gray}
                autoFocus={i === 0}
                editable={!pinLoading}
                returnKeyType="next"
                onSubmitEditing={() => {
                  if (i < 3) pinInputs.current[i+1]?.focus();
                }}
              />
            ))}
          </Animated.View>
          {pinError && (
            <Text style={[styles.pinErrorText, { color: '#FF3B30', marginTop: 8 }]}>
              Incorrect PIN. Please try again.
            </Text>
          )}
          {pinLoading && (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 18 }} />
          )}
        </View>
      </View>
    </Modal>
  );

  // Auto-submit PIN when 4 digits are entered
  useEffect(() => {
    if (!canSubmitPin) return;
    if (enteredPin.length === 4 && !pinLoading && pinModalVisible) {
      handlePinSubmitDelayed(enteredPin);
    }
  }, [enteredPin, pinLoading, pinModalVisible, canSubmitPin]);

  // Helper for delayed PIN submit
  const handlePinSubmitDelayed = (pin: string) => {
    setPinLoading(true);
    setTimeout(() => {
      setPinLoading(false);
      if (pin === String(user?.pin)) {
        setShowBalance(true);
        setPinModalVisible(false);
        setPinError(false);
        setTimeout(() => setShowBalance(false), 6000);
      } else {
        setShowBalance(false);
        setPinError(true);
        // Shake animation for visual feedback
        startShakeAnimation();
        // Clear PIN inputs after error
        setEnteredPin('');
        // Reset error after 3 seconds
        setTimeout(() => setPinError(false), 3000);
      }
    }, 500);
  };

  // Custom Alert Modal
  const renderCustomAlertModal = () => null;

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
  initialsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: COLORS.white,
    fontSize: 18,
    fontFamily: 'Urbanist Bold',
    textAlign: 'center',
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
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
    marginHorizontal: 0,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardName: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Urbanist Bold',
    marginBottom: 2,
    marginLeft: -10,
  },
  blupayLogo: {
    width: 70,
    height: 35,
  },
  cardBalanceSection: {
    marginVertical: 12,
    marginTop: 0,
    
  },
  cardBalanceLabel: {
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: 12,
      fontFamily: 'Urbanist Medium',
      marginBottom: 10,
    },
    cardBalanceLabel2: {
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: 12,
      fontFamily: 'Urbanist Medium',
      marginTop: 25,
  },
  cardBalanceAmount: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Urbanist Bold',
    letterSpacing: 1,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginTop: 18,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
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
    borderRadius: 20,
    padding: 24,
    width: 280,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Urbanist Bold',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    fontFamily: 'Urbanist Regular',
  },
  pinInputContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  pinInput: {
    width: 180,
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 22,
    textAlign: 'center',
    letterSpacing: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: COLORS.gray2,
  },
  cancelBtnText: {
    fontSize: 16,
    fontFamily: 'Urbanist SemiBold',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: 'Urbanist SemiBold',
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
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyeButton: {
    padding: 5,
  },
  accountNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountNumberMask: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginLeft: 8,
  },
  accountNumberMaskText: {
    fontSize: 16,
    fontFamily: 'Urbanist Bold',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  pinModalContent: {
    width: 270,
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  pinInputOnly: {
    width: 180,
    height: 48,
    borderWidth: 1.5,
    borderRadius: 8,
    fontSize: 22,
    textAlign: 'center',
    letterSpacing: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  pinBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  pinBox: {
    width: 40,
    height: 48,
    borderWidth: 1.5,
    borderRadius: 8,
    fontSize: 22,
    textAlign: 'center',
    letterSpacing: 2,
    marginHorizontal: 6,
  },
  pinErrorText: {
    fontSize: 13,
    fontFamily: 'Urbanist Medium',
    textAlign: 'center',
    marginTop: 8,
  },
})

export default HomeScreen