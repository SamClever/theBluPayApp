import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
  FlatList,
  Image,
  ActivityIndicator,
  ImageSourcePropType,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabView, TabBar } from 'react-native-tab-view';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import ContactCard from '../components/ContactCard';
import ContactFavouriteCard from '../components/ContactFavouriteCard';
import Header from '../components/Header';
import { COLORS, SIZES, icons } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { PermissionsAndroid } from 'react-native';

const DEFAULT_AVATAR = require('../assets/images/default_avatar.png'); // fallback image

type User = {
  account_id: string;
  account_number: string;
  first_name: string;
  last_name: string;
  email: string;
  account_balance?: string;
  profile_image?: string; // updated field
  is_favourite?: boolean;
  account_type?: string;
};

// Helper function to normalize image prop
const getImageSource = (img?: string) => {
  if (!img) return DEFAULT_AVATAR as ImageSourcePropType;
  if (typeof img === 'string' && (img.startsWith('http') || img.startsWith('file'))) {
    return { uri: img } as ImageSourcePropType;
  }
  return DEFAULT_AVATAR as ImageSourcePropType;
};

const SendMoney = () => {
  const layout = useWindowDimensions();
  const { colors, dark } = useTheme();
  const navigation = useNavigation<NavigationProp<any>>();

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);

  const [routes] = useState([
    { key: 'first', title: 'All' },
    { key: 'second', title: 'Favourite' },
  ]);

  const fetchUsers = async () => {
    try {
      console.log('Fetching users...');
      const start = Date.now();
      let token = await AsyncStorage.getItem('token');
      if (!token) {
        const legacy = await AsyncStorage.getItem('userToken');
        if (legacy) {
          console.warn('Migrating legacy userToken -> token');
          await AsyncStorage.setItem('token', legacy);
          await AsyncStorage.removeItem('userToken');
          token = legacy;
        }
      }
      if (!token) {
        setUsers([]);
        setFilteredUsers([]);
        setLoading(false);
        return;
      }
      const response = await fetch('https://theblupayapi.com/accounts/search/', {
        method: 'GET', // changed to GET
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log('API response time:', Date.now() - start, 'ms');
      // No need to filter by account_balance, just set users
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavourite = (userId: string) => {
    setUsers(prevUsers => {
      const updatedUsers = prevUsers.map(user => {
        if (user.account_id === userId) {
          return { ...user, is_favourite: !user.is_favourite };
        }
        return user;
      });
      // Here you can add the API call to update the backend in the future
      return updatedUsers;
    });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filterOutCurrentUserAndSearch = async () => {
      const currentUserEmail = await AsyncStorage.getItem('userEmail');
      const filtered = users.filter((user: User) =>
        user.email.trim().toLowerCase() !== (currentUserEmail?.trim().toLowerCase() || '') &&
        (`${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
         user.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredUsers(filtered);
    };
    filterOutCurrentUserAndSearch();
  }, [searchQuery, users]);

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: COLORS.primary }}
      activeColor={COLORS.primary}
      inactiveColor={dark ? COLORS.white : COLORS.greyscale900}
      style={{ backgroundColor: dark ? COLORS.dark1 : COLORS.white }}
      renderLabel={({ route, focused }: { route: any; focused: boolean }) => (
        <Text style={{
          color: focused ? COLORS.primary : 'gray',
          fontSize: 16,
          fontFamily: 'Urbanist Bold',
        }}>
          {route.title}
        </Text>
      )}
    />
  );

  const AllContact = () => (
    <FlatList
      data={filteredUsers}
      keyExtractor={(item: User) => item.account_id}
      renderItem={({ item }: { item: User }) => (
        <ContactCard
          name={`${item.first_name} ${item.last_name}`}
          email={item.email}
          image={getImageSource(item.profile_image)}
          onPress={() => navigation.navigate("SendMoneyTypeAmount", { user: item })}
          isFavourite={item.is_favourite || false}
          onToggleFavourite={() => handleToggleFavourite(item.account_id)}
        />
      )}
      showsVerticalScrollIndicator={false}
      style={{ marginVertical: 12 }}
    />
  );

  const FavouriteContact = () => (
    <FlatList
      data={filteredUsers.filter((user: User) => user.is_favourite)}
      keyExtractor={(item: User) => item.account_id}
      renderItem={({ item }: { item: User }) => (
        <ContactFavouriteCard
          name={`${item.first_name} ${item.last_name}`}
          email={item.email}
          image={getImageSource(item.profile_image)}
          onPress={() => navigation.navigate("SendMoneyTypeAmount", { user: item })}
          onToggleFavourite={() => handleToggleFavourite(item.account_id)}
        />
      )}
      showsVerticalScrollIndicator={false}
      style={{ marginVertical: 12 }}
    />
  );

  const BankContact = () => (
    <FlatList
      data={filteredUsers.filter((user: User) => user.account_type === 'bank')}
      keyExtractor={(item: User) => item.account_id}
      renderItem={({ item }: { item: User }) => (
        <ContactCard
          name={`${item.first_name} ${item.last_name}`}
          email={item.email}
          image={getImageSource(item.profile_image)}
          onPress={() => navigation.navigate("SendMoneyTypeAmount", { user: item })}
          isFavourite={item.is_favourite || false}
          onToggleFavourite={() => handleToggleFavourite(item.account_id)}
        />
      )}
      showsVerticalScrollIndicator={false}
      style={{ marginVertical: 12 }}
    />
  );

  const EWalletContact = () => (
    <FlatList
      data={filteredUsers.filter((user: User) => user.account_type === 'ewallet')}
      keyExtractor={(item: User) => item.account_id}
      renderItem={({ item }: { item: User }) => (
        <ContactCard
          name={`${item.first_name} ${item.last_name}`}
          email={item.email}
          image={getImageSource(item.profile_image)}
          onPress={() => navigation.navigate("SendMoneyTypeAmount", { user: item })}
          isFavourite={item.is_favourite || false}
          onToggleFavourite={() => handleToggleFavourite(item.account_id)}
        />
      )}
      showsVerticalScrollIndicator={false}
      style={{ marginVertical: 12 }}
    />
  );

  const renderScene = ({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case 'first': return <AllContact />;
      case 'second': return <FavouriteContact />;
      default: return null;
    }
  };

  const handleShareReceipt = () => {
    const receiptText = `
      Transaction Receipt
      -------------------
      Transaction ID: ${transaction_id}
      Amount: ${amount}
      Description: ${description}
      Status: ${status}
      Type: ${transaction_type}
      Sender: ${sender_full_name}
      Receiver: ${receiver_full_name}
      Date: ${date}
    `;
    Share.open({ message: receiptText });
  };

  const handleDownloadReceipt = async () => {
    const receiptText = `
      Transaction Receipt
      -------------------
      Transaction ID: ${transaction_id}
      Amount: ${amount}
      Description: ${description}
      Status: ${status}
      Type: ${transaction_type}
      Sender: ${sender_full_name}
      Receiver: ${receiver_full_name}
      Date: ${date}
    `;

    const fileName = `receipt_${transaction_id}.txt`;
    const path = `${RNFS.DownloadDirectoryPath}/${fileName}`;

    // For Android, request permission
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permission Denied', 'Cannot save receipt without storage permission.');
        return;
      }
    }

    await RNFS.writeFile(path, receiptText, 'utf8');
    Alert.alert('Success', `Receipt saved to ${path}`);
  };

  const handleShareReceiptFile = async () => {
    const receiptText = `
      Transaction Receipt
      -------------------
      Transaction ID: ${transaction_id}
      Amount: ${amount}
      Description: ${description}
      Status: ${status}
      Type: ${transaction_type}
      Sender: ${sender_full_name}
      Receiver: ${receiver_full_name}
      Date: ${date}
    `;

    const fileName = `receipt_${transaction_id}.txt`;
    const path = `${RNFS.DownloadDirectoryPath}/${fileName}`;

    // For Android, request permission
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permission Denied', 'Cannot save receipt without storage permission.');
        return;
      }
    }

    await RNFS.writeFile(path, receiptText, 'utf8');
    Share.open({ url: 'file://' + path });
  };

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Send Money" />
        <View style={[styles.searchBarContainer, { backgroundColor: dark ? '#23272F' : '#F0F0F0' }]}>
          <TouchableOpacity>
            <Image source={icons.search2 as ImageSourcePropType} resizeMode="contain" style={styles.searchIcon} />
          </TouchableOpacity>
          <TextInput
            placeholder="Search name, username, or email..."
            placeholderTextColor="#9E9E9E"
            style={[styles.searchInput, { color: dark ? '#FFFFFF' : '#212121', backgroundColor: dark ? '#23272F' : '#F0F0F0' }]}
            value={searchQuery}
            onChangeText={text => setSearchQuery(text)}
          />
          <TouchableOpacity>
            <Image source={icons.filter3 as ImageSourcePropType} resizeMode="contain" style={styles.filterIcon} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : (
          <View style={{ flex: 1 }}>
            <TabView
              navigationState={{ index, routes }}
              renderScene={renderScene}
              onIndexChange={setIndex}
              initialLayout={{ width: layout.width }}
              renderTabBar={renderTabBar}
            />
          </View>
        )}
      </View>
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
  },
  searchBarContainer: {
    width: SIZES.width - 32,
    backgroundColor: COLORS.secondaryWhite,
    padding: 16,
    borderRadius: 12,
    height: 52,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
  },
  searchIcon: {
    height: 24,
    width: 24,
    tintColor: COLORS.gray,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontFamily: 'Urbanist Regular',
    // color and backgroundColor set inline for theme
  },
  filterIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.primary,
  },
});

export default SendMoney;
