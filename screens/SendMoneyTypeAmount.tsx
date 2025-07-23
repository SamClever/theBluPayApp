import { View, StyleSheet, Text, TouchableOpacity, TextInput, ImageSourcePropType, Alert, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-virtualized-view';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import Header from '../components/Header';
import { Image } from 'react-native';
import { COLORS, SIZES, icons, images } from '../constants';
import Button from '../components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_AVATAR = require('../assets/images/default_avatar.png');

type User = {
    account_number: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_image?: string;
};

type SendMoneyRouteProp = RouteProp<{ params: { user: User } }, 'params'>;

const SendMoneyTypeAmount = () => {
    const { navigate } = useNavigation<any>();
    const { colors, dark } = useTheme();
    const route = useRoute<SendMoneyRouteProp>();
    const { user } = route.params;

    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    const getImageSource = (img?: string) => {
        if (img && (img.startsWith('http') || img.startsWith('file'))) {
            return { uri: img };
        }
        return DEFAULT_AVATAR;
    };

    const handleContinue = async () => {
        if (!amount) {
            Alert.alert('Error', 'Please enter an amount.');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Error', 'Authentication token not found. Please log in again.');
                return;
            }

            const response = await fetch('https://theblupayapi.com/transfer/initiate/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    account_number: user.account_number,
                    amount: amount,
                    description: note || 'Sent via BluPay',
                }),
            });

            if (response.ok) {
                const txData = await response.json();
                navigate('SendMoneyReviewSummary', {
                    user,
                    amount: txData.amount,
                    note: txData.description,
                    transaction_id: txData.transaction_id,
                    status: txData.status,
                    transaction_type: txData.transaction_type,
                    sender_account_number: txData.sender_account_number,
                    reciver_account_number: txData.reciver_account_number,
                    date: txData.date,
                });
            } else {
                const errorData = await response.json();
                Alert.alert('Transfer Failed', errorData.message || 'An unknown error occurred.');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'An error occurred while initiating the transfer. Please try again.');
        }
    };

    return (
        <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Header title="Send Money to" />
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    <View style={styles.userCard}>
                        <View style={styles.userLeftCard}>
                            <Image
                                source={getImageSource(user.profile_image)}
                                resizeMode='cover'
                                style={styles.avatar}
                            />
                            <View>
                                <Text style={[styles.username, {
                                    color: dark ? COLORS.white : COLORS.greyscale900,
                                }]}>{`${user.first_name} ${user.last_name}`}</Text>
                                <Text style={[styles.useremail, {
                                    color: dark ? COLORS.grayscale400 : COLORS.grayscale700
                                }]}>{user.email}</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => navigate("SendMoney")}>
                            <Image
                                source={icons.edit as ImageSourcePropType}
                                resizeMode='contain'
                                style={styles.editIcon}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.separateLine, {
                        backgroundColor: dark ? COLORS.grayscale700 : COLORS.grayscale200
                    }]}/>
                    <View style={styles.accountSection}>
                        <Text style={[styles.sectionLabel, {
                            color: dark ? COLORS.grayscale400 : COLORS.greyScale800,
                        }]}>Account number</Text>
                        <View style={[styles.accountValueBox, { backgroundColor: dark ? COLORS.dark2 : COLORS.secondaryWhite, borderColor: COLORS.primary }]}>
                            <Text style={[styles.accountValue, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>{user.account_number}</Text>
                        </View>
                    </View>
                    <Text style={[styles.sectionLabel, {
                        color: dark ? COLORS.grayscale400 : COLORS.greyScale800,
                    }]}>Amount</Text>
                    <TextInput
                        placeholder='$0.00'
                        placeholderTextColor={dark ? COLORS.grayscale400 : COLORS.gray}
                        style={[styles.amountInput, {
                            backgroundColor: dark ? COLORS.dark2 : COLORS.secondaryWhite,
                            color: dark ? COLORS.white : COLORS.greyscale900,
                            borderColor: COLORS.primary,
                        }]}
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                    />
                    <Text style={[styles.sectionLabel, {
                        color: dark ? COLORS.grayscale400 : COLORS.greyScale800,
                    }]}>Add a note (optional)</Text>
                    <TextInput
                        placeholder='Add a note (optional)'
                        multiline={true}
                        placeholderTextColor={dark ? COLORS.grayscale700 : COLORS.greyscale900}
                        style={[styles.noteInput, {
                            backgroundColor: dark ? COLORS.dark2 : COLORS.secondaryWhite,
                            color: dark ? COLORS.white : COLORS.grayscale700,
                            minHeight: 80,
                            maxHeight: 200,
                            textAlignVertical: 'top',
                        }]}
                        value={note}
                        onChangeText={setNote}
                        returnKeyType="done"
                        blurOnSubmit={true}
                    />
                </ScrollView>
            </View>
            <View style={styles.bottomContainer}>
                <Button
                    title="Continue"
                    style={styles.sendBtn}
                    onPress={handleContinue}
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
    userCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 16
    },
    userLeftCard: {
        flexDirection: "row",
        alignItems: "center"
    },
    editIcon: {
        width: 24,
        height: 24,
        tintColor: COLORS.primary
    },
    avatar: {
        height: 60,
        width: 60,
        borderRadius: 999,
        marginRight: 12
    },
    username: {
        fontSize: 18,
        fontFamily: "Urbanist Bold",
        color: COLORS.greyscale900,
        marginBottom: 6
    },
    useremail: {
        fontSize: 14,
        fontFamily: "Urbanist Medium",
        color: COLORS.grayscale700
    },
    separateLine: {
        width: "100%",
        height: 1,
        backgroundColor: COLORS.grayscale200
    },
    sectionLabel: {
        fontSize: 16,
        fontFamily: "Urbanist Bold",
        marginTop: 18,
        marginBottom: 6,
        color: COLORS.greyscale900,
    },
    accountSection: {
        marginTop: 18,
        marginBottom: 8,
    },
    accountValueBox: {
        borderWidth: 1.5,
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },
    accountValue: {
        fontSize: 20,
        fontFamily: 'Urbanist Bold',
        letterSpacing: 1,
        textAlign: 'center',
    },
    accountInput: {
        fontSize: 18,
        fontFamily: "Urbanist Bold",
        color: COLORS.greyscale900,
        textAlign: "center",
        backgroundColor: COLORS.secondaryWhite,
        padding: 12,
        borderRadius: 10,
        marginBottom: 4,
    },
    amountInput: {
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: 60,
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderRadius: 12,
        fontSize: 28,
        fontFamily: "Urbanist Bold",
        textAlign: "center",
        marginBottom: 4,
        backgroundColor: COLORS.secondaryWhite,
        marginTop: 0,
    },
    noteInput: {
        width: "100%",
        minHeight: 80,
        borderRadius: 10,
        backgroundColor: COLORS.secondaryWhite,
        fontSize: 16,
        fontFamily: "Urbanist Regular",
        paddingHorizontal: 16,
        paddingVertical: 12,
        color: COLORS.grayscale700,
        marginBottom: 16,
        marginTop: 0,
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
    sendBtn: {
        width: SIZES.width - 32
    }
})

export default SendMoneyTypeAmount