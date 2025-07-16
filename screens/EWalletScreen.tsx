import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import { COLORS, SIZES, icons, images } from '../constants';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';

const CARD_WIDTH = Dimensions.get('window').width * 0.85;
const CARD_HEIGHT = 200;

const cardsData = [
  {
   
    type: 'Mastercard',
    number: '**** **** **** 1234',
    name: 'MAULID ABDALLA',
    balance: 1200.50,
    logo: icons.mastercard,
    bgColor: '#1E3A8A',
  },
 
];

const EWalletScreen = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const renderCard = ({ item }: any) => (
    <View style={[styles.card, { backgroundColor: item.bgColor }]}> 
      <View style={styles.cardHeader}>
        <Text style={styles.cardType}>{item.type}</Text>
        <Image source={item.logo} style={styles.cardLogo} resizeMode="contain" />
      </View>
      <Text style={styles.cardNumber}>{item.number}</Text>
      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.cardLabel}>Card Holder</Text>
          <Text style={styles.cardName}>{item.name}</Text>
        </View>
        <View>
          <Text style={styles.cardLabel}>Balance</Text>
          <Text style={styles.cardBalance}>${item.balance.toLocaleString()}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <FlatList
          data={cardsData}
          keyExtractor={item => item.id}
          renderItem={renderCard}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={e => {
            const index = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
            setActiveIndex(index);
          }}
          snapToInterval={CARD_WIDTH}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: (SIZES.width - CARD_WIDTH) / 2 }}
        />
        <View style={styles.pagination}>
          {cardsData.map((_, idx) => (
            <View
              key={idx}
              style={[styles.dot, activeIndex === idx && styles.activeDot]}
            />
          ))}
        </View>
        {/* Add more wallet features below */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: COLORS.background || '#F5F6FA',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 24,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    marginHorizontal: 8,
    padding: 24,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardType: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  cardLogo: {
    width: 48,
    height: 32,
  },
  cardNumber: {
    color: '#fff',
    fontSize: 22,
    letterSpacing: 4,
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardLabel: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  cardName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  cardBalance: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: COLORS.primary || '#2563EB',
    width: 16,
  },
});

export default EWalletScreen;
