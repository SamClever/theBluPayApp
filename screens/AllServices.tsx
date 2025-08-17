import { View, Text, StyleSheet, FlatList } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-virtualized-view';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import { useTheme } from '../theme/ThemeProvider';
import { COLORS } from '../constants';
import Category from '../components/Category';
import { billServices, insuranceServices, optionServices } from '../data';
import { entertainmentServices } from '../data';

type ServiceItem = {
  id: string;
  name: string;
  icon: any;
  iconColor: string;
  backgroundColor: string;
  onPress: string;
};

const AllServices = () => {
  const { colors, dark } = useTheme();
  const navigation = useNavigation<NavigationProp<any>>();

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}> 
      <View style={[styles.container, { backgroundColor: colors.background }]}> 
        <Header title="All Services" />
        <ScrollView contentContainerStyle={{ marginVertical: 12 }} showsVerticalScrollIndicator={false}>
          <View>
            <Text style={[styles.subtitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>Bill</Text>
            <FlatList
              data={billServices as ServiceItem[]}
              keyExtractor={(item, index) => index.toString()}
              horizontal={false}
              numColumns={4}
              style={{ marginTop: 0 }}
              renderItem={({ item }: { item: ServiceItem }) => (
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
            <Text style={[styles.subtitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>Insurance</Text>
            <FlatList
              data={insuranceServices as ServiceItem[]}
              keyExtractor={(item, index) => index.toString()}
              horizontal={false}
              numColumns={4}
              style={{ marginTop: 0 }}
              renderItem={({ item }: { item: ServiceItem }) => (
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
            <Text style={[styles.subtitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>Option</Text>
            <FlatList
              data={optionServices as ServiceItem[]}
              keyExtractor={(item, index) => index.toString()}
              horizontal={false}
              numColumns={4}
              style={{ marginTop: 0 }}
              renderItem={({ item }: { item: ServiceItem }) => (
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
            <Text style={[styles.subtitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>Entertainment</Text>
            <FlatList
              data={entertainmentServices as ServiceItem[]}
              keyExtractor={(item, index) => index.toString()}
              horizontal={false}
              numColumns={4}
              style={{ marginTop: 0 }}
              renderItem={({ item }: { item: ServiceItem }) => (
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
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

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
  subtitle: {
    fontSize: 18,
    fontFamily: "Urbanist Bold",
    color: COLORS.greyscale900,
    marginVertical: 16
  }
})
export default AllServices