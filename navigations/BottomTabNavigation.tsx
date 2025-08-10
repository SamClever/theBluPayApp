import { View, Platform, Image, Text, ImageSourcePropType } from 'react-native';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS, FONTS, SIZES, icons } from '../constants';
import { useTheme } from '../theme/ThemeProvider';
import { Home, MyCard, Profile, ScanQrCode, Statistics } from '../screens';

const Tab = createBottomTabNavigator();

const BottomTabNavigation = () => {
    const { dark } = useTheme();

    return (
        <Tab.Navigator screenOptions={{
            tabBarShowLabel: false,
            headerShown: false,
            tabBarStyle: {
                position: 'absolute',
                justifyContent: "center",
                bottom: 0,
                right: 0,
                left: 0,
                elevation: 0,
                height: Platform.OS === 'ios' ? 90 : 64,
                backgroundColor: dark ? COLORS.dark1 : COLORS.white,
                borderTopColor: "transparent",
            }
        }}>
            <Tab.Screen
                name="Home"
                component={Home}
                options={{
                    tabBarIcon: ({ focused }: { focused: boolean }) => {
                        return (
                            <View style={{
                                alignItems: "center",
                                paddingTop: 12,
                                width: SIZES.width/5
                            }}>
                                <Image
                                    source={focused ? icons.home4 as ImageSourcePropType : icons.home4Outline as ImageSourcePropType}
                                    resizeMode="contain"
                                    style={{
                                        width: 24,
                                        height: 24,
                                        tintColor: focused ? COLORS.primary : dark ? COLORS.gray3 : COLORS.gray3,
                                    }}
                                />
                                <Text style={{
                                    ...FONTS.body4,
                                    color: focused ? COLORS.primary : dark ? COLORS.gray3 : COLORS.gray3,
                                }}>Home</Text>
                            </View>
                        )
                    },
                }}
            />
            <Tab.Screen
                name="In & Out"
                component={Statistics}
                options={{
                    tabBarIcon: ({ focused }: { focused: boolean }) => {
                        return (
                            <View style={{
                                alignItems: "center",
                                paddingTop: 12,
                                width: SIZES.width/5
                            }}>
                                <Image
                                    source={icons.swapUpDown as ImageSourcePropType}
                                    resizeMode="contain"
                                    style={{
                                        width: 24,
                                        height: 24,
                                        tintColor: focused ? COLORS.primary : dark ? COLORS.gray3 : COLORS.gray3,
                                    }}
                                />
                                <Text style={{
                                    ...FONTS.body4,
                                    color: focused ? COLORS.primary : dark ? COLORS.gray3 : COLORS.gray3,
                                }}>In & Out</Text>
                            </View>
                        )
                    },
                }}
            />
            <Tab.Screen
                name="ScanQrCode"
                component={ScanQrCode}
                options={{
                    tabBarIcon: () => {
                        return (
                            <View style={{
                                height: 60,
                                width: 60,
                                borderRadius: 30,
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor: COLORS.primary,
                                marginBottom: 12
                            }}>
                                <Image
                                    source={icons.scan2 as ImageSourcePropType}
                                    resizeMode="contain"
                                    style={{
                                        width: 24,
                                        height: 24,
                                        tintColor: COLORS.white
                                    }}
                                />
                            </View>
                        )
                    }
                }}
            />
            <Tab.Screen
                name="MyCard"
                component={MyCard}
                options={{
                    tabBarIcon: ({ focused }: { focused: boolean }) => {
                        return (
                            <View style={{
                                alignItems: "center",
                                paddingTop: 12,
                                width: SIZES.width/5
                            }}>
                                <Image
                                    source={focused ? icons.wallet2 as ImageSourcePropType : icons.wallet2Outline as ImageSourcePropType}
                                    resizeMode="contain"
                                    style={{
                                        width: 24,
                                        height: 24,
                                        tintColor: focused ? COLORS.primary : dark ? COLORS.gray3 : COLORS.gray3,
                                    }}
                                />
                                <Text style={{
                                    ...FONTS.body4,
                                    color: focused ? COLORS.primary : dark ? COLORS.gray3 : COLORS.gray3,
                                }}>My Card</Text>
                            </View>
                        )
                    }
                }}
            />
            <Tab.Screen
                name="Profile"
                component={Profile}
                options={{
                    tabBarIcon: ({ focused }: { focused: boolean }) => {
                        return (
                            <View style={{
                                alignItems: "center",
                                paddingTop: 12,
                                width: SIZES.width/5
                            }}>
                                <Image
                                    source={focused ? icons.profile2 as ImageSourcePropType : icons.profile2Outline as ImageSourcePropType}
                                    resizeMode="contain"
                                    style={{
                                        width: 24,
                                        height: 24,
                                        tintColor: focused ? COLORS.primary : dark ? COLORS.gray3 : COLORS.gray3,
                                    }}
                                />
                                <Text style={{
                                    ...FONTS.body4,
                                    color: focused ? COLORS.primary : dark ? COLORS.gray3 : COLORS.gray3,
                                }}>Profile</Text>
                            </View>
                        )
                    },
                }}
            />
        </Tab.Navigator>
    )
}

export default BottomTabNavigation