import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import Header from '../components/Header';
import Button from '../components/Button';
import { COLORS, SIZES } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, ActivityIndicator } from 'react-native';

type User = {
    account_number: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_image?: string;
};

type ConfirmPaymentRouteProp = RouteProp<{ params: { user: User; amount: string; note: string; transaction_id: string; status?: string; transaction_type?: string; sender_account_number?: string; reciver_account_number?: string; date?: string; } }, 'params'>;

const ConfirmPayment = () => {
    const navigation = useNavigation<any>();
    const { colors, dark } = useTheme();
    const route = useRoute<ConfirmPaymentRouteProp>();
    const { user, amount, note, transaction_id, status, transaction_type, sender_account_number, reciver_account_number, date } = route.params;

    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);

    const handleKeyPress = (num: string) => {
        if (pin.length < 4) {
            setPin(pin + num);
        }
    };

    const handleDelete = () => {
        setPin(pin.slice(0, -1));
    };

    const handleConfirmPayment = async () => {
        if (pin.length !== 4) {
            Alert.alert('Invalid PIN', 'Please enter a 4-digit PIN.');
            return;
        }

        setLoading(true);

        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Error', 'Authentication token not found. Please log in again.');
                setLoading(false);
                return;
            }

            // Log the request for debugging
            console.log('Sending confirm request:', {
                url: `https://theblupayapi.com/transfer/${transaction_id}/confirm/`,
                body: { pin_number: pin }
            });

            // Confirm the transaction with the PIN and transaction_id
            const response = await fetch(`https://theblupayapi.com/transfer/${transaction_id}/confirm/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ pin_number: pin }),
            });

            if (!response.ok) {
                let errorText = await response.text();
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    errorData = errorText;
                }
                console.log('ConfirmPayment error:', errorData, 'Status:', response.status, 'Request:', {
                    url: `https://theblupayapi.com/transfer/${transaction_id}/confirm/`,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: { pin_number: pin }
                });
                Alert.alert('Confirmation Failed', errorData.message || errorText || 'An unknown error occurred.');
            } else {
                const data = await response.json(); // get the transaction details from the API
                navigation.navigate('SendMoneySuccessful', {
                    transaction_id: data.transaction_id,
                    amount: data.amount,
                    description: data.description,
                    status: data.status,
                    transaction_type: data.transaction_type,
                    sender_account_number: data.sender_account_number,
                    reciver_account_number: data.reciver_account_number,
                    date: data.date,
                });
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'An error occurred while confirming payment. Please try again.');
        } finally {
            setLoading(false);
        }
    };


    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '⌫'];

    return (
        <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Header title="Confirm Payment" />
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} showsVerticalScrollIndicator={false}>
                    <Text style={[styles.title, { color: dark ? COLORS.white : COLORS.black }]}>Enter Your PIN</Text>
                    <Text style={[styles.subtitle, { color: dark ? COLORS.gray : COLORS.gray }]}>Please enter your PIN to confirm payment</Text>
                    <View style={styles.pinInputRow}>
                        {Array(4).fill(0).map((_, i) => (
                            <View key={i} style={[styles.pinBox, { borderColor: pin.length === i ? COLORS.primary : COLORS.greyscale500, backgroundColor: dark ? COLORS.dark2 : COLORS.secondaryWhite }]}>
                                <Text style={[styles.pinDigit, { color: dark ? COLORS.white : COLORS.black }]}>
                                    {pin[i] ? pin[i] : ''}
                                </Text>
                            </View>
                        ))}
                    </View>
                    <View style={{ height: 24 }} />
                    <FlatList
                        data={numbers}
                        numColumns={3}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.numButton, 
                                    item === '⌫' && { backgroundColor: 'transparent', borderColor: 'transparent' },
                                    { 
                                        backgroundColor: dark ? COLORS.dark2 : COLORS.secondaryWhite,
                                        borderColor: dark ? COLORS.grayscale400 : COLORS.greyscale500,
                                    }
                                ]}
                                onPress={() => (item === '⌫' ? handleDelete() : handleKeyPress(item))}
                                disabled={item === '*'}
                            >
                                <Text style={[styles.numText, { color: dark ? COLORS.white : COLORS.black }]}>{item === '*' ? '' : item}</Text>
                            </TouchableOpacity>
                        )}
                        contentContainerStyle={styles.numPad}
                    />
                    <View style={{ height: 24 }} />
                    <Button
                        title="Confirm Payment"
                        filled
                        onPress={handleConfirmPayment}
                        style={styles.confirmButton}
                        disabled={loading}
                        color={COLORS.primary}
                        textColor={COLORS.white}
                    />
                    {loading && <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 16 }} />}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    area: { flex: 1, backgroundColor: COLORS.white },
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: COLORS.white,
    },
    title: {
        fontSize: 24,
        fontFamily: 'Urbanist Bold',
        textAlign: 'center',
        marginTop: 32,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'Urbanist Regular',
        color: COLORS.gray,
        textAlign: 'center',
        marginBottom: 32,
    },
    pinInputRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    pinBox: {
        width: 48,
        height: 48,
        borderRadius: 10,
        borderWidth: 2,
        marginHorizontal: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.secondaryWhite,
    },
    pinDigit: {
        fontSize: 24,
        fontFamily: 'Urbanist Bold',
        textAlign: 'center',
    },
    numPad: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    numButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10,
        backgroundColor: COLORS.secondaryWhite,
        borderWidth: 1,
        borderColor: COLORS.greyscale500,
    },
    numText: {
        fontSize: 28,
        fontFamily: 'Urbanist Bold',
        textAlign: 'center',
    },
    confirmButton: {
        width: SIZES.width - 32,
        borderRadius: 30,
        alignSelf: 'center',
    },
});

export default ConfirmPayment; 