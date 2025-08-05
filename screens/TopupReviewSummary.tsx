import { View, Text, StyleSheet, TextInput, ImageSourcePropType, Alert, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-virtualized-view';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import Header from '../components/Header';
import { Image } from 'react-native';
import { COLORS, SIZES, icons } from '../constants';
import Button from '../components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';

type TopupReviewSummaryRouteProp = RouteProp<{ 
  params: { 
    amount: string; 
    mobileNumber: string; 
    accountNumber: string; 
    accountName?: string;
    remarks?: string; 
    provider?: string;
  } 
}, 'params'>;

const TopupReviewSummary = () => {
    const navigation = useNavigation<any>();
    const { colors, dark } = useTheme();
    const route = useRoute<TopupReviewSummaryRouteProp>();
    const { amount, mobileNumber, accountNumber, accountName, remarks, provider } = route.params;



    const handleConfirm = () => {
        // Navigate to PIN entry screen
        navigation.navigate('TopupPinEntry', {
            amount,
            mobileNumber,
            accountNumber,
            accountName,
            remarks,
            provider
        });
    };

    // Calculate VAT based on ClickPesa API (Tsh 15 for 1000Tsh)
    const calculateVAT = (amount: string) => {
        const amountNum = parseFloat(amount) || 0;
        // VAT is Tsh 15 for 1000Tsh, so it's 1.5% of the amount
        return Math.round(amountNum * 0.015);
    };
    
    const vat = calculateVAT(amount);
    const total = amount ? parseFloat(amount) + vat : 0;

    return (
        <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Header title="Review Topup Summary" />
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Topup Icon and Title */}
                    <View style={styles.iconContainer}>
                        <View style={[styles.iconBox, { backgroundColor: dark ? COLORS.dark2 : '#E8F5E8' }]}>
                            <Image
                                source={icons.money as ImageSourcePropType}
                                style={[styles.icon, { tintColor: COLORS.primary }]}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={[styles.title, { color: dark ? COLORS.white : COLORS.black }]}>
                            Mobile Money Topup
                        </Text>
                        <Text style={[styles.subtitle, { color: dark ? COLORS.grayscale200 : COLORS.grayscale700 }]}>
                            Review your topup details
                        </Text>
                    </View>

                    {/* Account Information */}
                    <View style={[styles.sectionContainer, {
                        backgroundColor: dark ? COLORS.dark2 : "#FAFAFA",
                    }]}>
                        <Text style={[styles.sectionTitle, { color: dark ? COLORS.white : COLORS.black }]}>
                            Account Information
                        </Text>
                        <View style={styles.infoRow}>
                            <View style={styles.infoLeft}>
                                <Image source={icons.creditCard as ImageSourcePropType} style={[styles.infoIcon, { tintColor: COLORS.primary }]} />
                                <Text style={[styles.infoLabel, { color: dark ? COLORS.grayscale400 : COLORS.grayscale700 }]}>
                                    Account Number
                                </Text>
                            </View>
                            <Text style={[styles.infoValue, { color: COLORS.primary }]}>
                                {accountNumber}
                            </Text>
                        </View>
                        {accountName && (
                            <View style={styles.infoRow}>
                                <View style={styles.infoLeft}>
                                    <Image source={icons.user as ImageSourcePropType} style={[styles.infoIcon, { tintColor: COLORS.primary }]} />
                                    <Text style={[styles.infoLabel, { color: dark ? COLORS.grayscale400 : COLORS.grayscale700 }]}>
                                        Account Name
                                    </Text>
                                </View>
                                <Text style={[styles.infoValue, { color: COLORS.primary }]}>
                                    {accountName}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Mobile Money Information */}
                    <View style={[styles.sectionContainer, {
                        backgroundColor: dark ? COLORS.dark2 : "#FAFAFA",
                    }]}>
                        <Text style={[styles.sectionTitle, { color: dark ? COLORS.white : COLORS.black }]}>
                            Mobile Money Details
                        </Text>
                        <View style={styles.infoRow}>
                            <View style={styles.infoLeft}>
                                <Image source={icons.call as ImageSourcePropType} style={[styles.infoIcon, { tintColor: COLORS.primary }]} />
                                <Text style={[styles.infoLabel, { color: dark ? COLORS.grayscale400 : COLORS.grayscale700 }]}>
                                    Mobile Number
                                </Text>
                            </View>
                            <Text style={[styles.infoValue, { color: COLORS.primary }]}>
                                {mobileNumber}
                            </Text>
                        </View>
                        {provider && (
                            <View style={styles.infoRow}>
                                <View style={styles.infoLeft}>
                                    <Image source={icons.bank as ImageSourcePropType} style={[styles.infoIcon, { tintColor: COLORS.primary }]} />
                                    <Text style={[styles.infoLabel, { color: dark ? COLORS.grayscale400 : COLORS.grayscale700 }]}>
                                        Provider
                                    </Text>
                                </View>
                                <Text style={[styles.infoValue, { color: COLORS.primary }]}>
                                    {provider}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Transaction Details */}
                    <View style={[styles.sectionContainer, {
                        backgroundColor: dark ? COLORS.dark2 : "#FAFAFA",
                    }]}>
                        <Text style={[styles.sectionTitle, { color: dark ? COLORS.white : COLORS.black }]}>
                            Transaction Details
                        </Text>
                        <View style={styles.view}>
                            <Text style={[styles.viewLeft, { color: dark ? COLORS.grayscale400 : COLORS.grayscale700 }]}>
                                Amount
                            </Text>
                            <Text style={[styles.viewRight, { color: COLORS.primary }]}>
                                {amount ? `Tsh ${parseFloat(amount).toFixed(0)}` : '-'}
                            </Text>
                        </View>
                        <View style={styles.view}>
                            <Text style={[styles.viewLeft, { color: dark ? COLORS.grayscale400 : COLORS.grayscale700 }]}>
                                VAT
                            </Text>
                            <Text style={[styles.viewRight, { color: COLORS.primary }]}>
                                {`Tsh ${vat.toFixed(0)}`}
                            </Text>
                        </View>
                        <View style={[styles.separateLine, {
                            backgroundColor: dark ? COLORS.grayscale700 : COLORS.grayscale200
                        }]} />
                        <View style={styles.view}>
                            <Text style={[styles.viewLeft, { color: dark ? COLORS.grayscale400 : COLORS.grayscale700 }]}>
                                Total
                            </Text>
                            <Text style={[styles.viewRight, { color: COLORS.primary }]}>
                                {amount ? `Tsh ${total.toFixed(0)}` : '-'}
                            </Text>
                        </View>
                    </View>

                    {/* Remarks */}
                    {remarks ? (
                        <View style={[styles.sectionContainer, {
                            backgroundColor: dark ? COLORS.dark2 : "#FAFAFA",
                        }]}>
                            <Text style={[styles.sectionTitle, { color: dark ? COLORS.white : COLORS.black }]}>
                                Remarks
                            </Text>
                            <TextInput
                                value={remarks}
                                editable={false}
                                multiline={true}
                                style={[styles.noteInput, {
                                    backgroundColor: dark ? COLORS.dark2 : "#FAFAFA",
                                    color: dark ? COLORS.white : COLORS.greyscale900
                                }]}
                            />
                        </View>
                    ) : null}

                    {/* Important Notice */}
                    <View style={[styles.noticeContainer, {
                        backgroundColor: dark ? COLORS.dark2 : "#FFF3CD",
                        borderColor: dark ? COLORS.grayscale700 : "#FFEAA7"
                    }]}>
                        <Image source={icons.bell as ImageSourcePropType} style={[styles.noticeIcon, { tintColor: '#856404' }]} />
                        <Text style={[styles.noticeText, { color: '#856404' }]}>
                            Please ensure you have sufficient balance in your mobile money account before proceeding.
                        </Text>
                    </View>
                </ScrollView>
            </View>
            <View style={styles.bottomContainer}>
                <Button
                    title="Confirm Topup"
                    style={styles.confirmBtn}
                    onPress={handleConfirm}
                    filled
                />
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
        padding: 16,
    },
    iconContainer: {
        alignItems: 'center',
        marginVertical: 24,
    },
    iconBox: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    icon: {
        width: 40,
        height: 40,
    },
    title: {
        fontSize: 24,
        fontFamily: "Urbanist Bold",
        color: COLORS.black,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: "Urbanist Medium",
        color: COLORS.grayscale700,
    },
    sectionContainer: {
        width: SIZES.width - 32,
        backgroundColor: "#FAFAFA",
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginVertical: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: "Urbanist Bold",
        color: COLORS.black,
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 8,
    },
    infoLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    infoIcon: {
        width: 20,
        height: 20,
        marginRight: 12,
    },
    infoLabel: {
        fontSize: 14,
        fontFamily: "Urbanist Medium",
        color: COLORS.grayscale700,
    },
    infoValue: {
        fontSize: 16,
        fontFamily: "Urbanist Bold",
        color: COLORS.primary,
        textAlign: 'right',
        flex: 1,
    },
    view: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 12
    },
    viewLeft: {
        fontSize: 14,
        fontFamily: "Urbanist Medium",
        color: COLORS.grayscale700
    },
    viewRight: {
        fontSize: 16,
        fontFamily: "Urbanist Bold",
        color: COLORS.primary,
    },
    separateLine: {
        width: "100%",
        height: 1,
        backgroundColor: COLORS.grayscale200
    },
    noteInput: {
        width: "100%",
        minHeight: 60,
        borderRadius: 12,
        backgroundColor: "#FAFAFA",
        fontSize: 16,
        fontFamily: "Urbanist Regular",
        paddingHorizontal: 16,
        paddingVertical: 12,
        color: COLORS.greyscale900
    },
    noticeContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginVertical: 16,
    },
    noticeIcon: {
        width: 20,
        height: 20,
        marginRight: 12,
        marginTop: 2,
    },
    noticeText: {
        fontSize: 14,
        fontFamily: "Urbanist Medium",
        flex: 1,
        lineHeight: 20,
    },
    bottomContainer: {
        position: "absolute",
        bottom: 28,
        right: 0,
        left: 0,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16
    },
    confirmBtn: {
        width: SIZES.width - 32
    }
});

export default TopupReviewSummary; 