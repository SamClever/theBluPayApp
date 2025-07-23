import { View, Text, StyleSheet, TextInput, ImageSourcePropType } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-virtualized-view';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import Header from '../components/Header';
import { Image } from 'react-native';
import { COLORS, SIZES } from '../constants';
import Button from '../components/Button';

const DEFAULT_AVATAR = require('../assets/images/default_avatar.png');

type User = {
    account_number: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_image?: string;
};

type ReviewSummaryRouteProp = RouteProp<{ params: { user: User; amount: string; note: string; transaction_id?: string; status?: string; transaction_type?: string; sender_account_number?: string; reciver_account_number?: string; date?: string; } }, 'params'>;

const SendMoneyReviewSummary = () => {
    const navigation = useNavigation<any>();
    const { colors, dark } = useTheme();
    const route = useRoute<ReviewSummaryRouteProp>();
    const { user, amount, note, transaction_id, status, transaction_type, sender_account_number, reciver_account_number, date } = route.params;

    const getImageSource = (img?: string) => {
        if (img && (img.startsWith('http') || img.startsWith('file'))) {
            return { uri: img };
        }
        return DEFAULT_AVATAR;
    };

    const handleConfirm = () => {
        navigation.navigate('ConfirmPayment', {
            user,
            amount,
            note,
            transaction_id,
            status,
            transaction_type,
            sender_account_number,
            reciver_account_number,
            date,
        });
    };

    // Calculate VAT and total
    const vat = 0;
    const total = amount ? parseFloat(amount) : 0;

    return (
        <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Header title="Review Summary" />
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.profileContainer}>
                        <Image
                            source={getImageSource(user.profile_image)}
                            resizeMode='cover'
                            style={styles.avatar}
                        />
                        <Text style={[styles.username, { color: dark ? COLORS.white : COLORS.black }]}>{`${user.first_name} ${user.last_name}`}</Text>
                        <Text style={[styles.useremail, { color: dark ? COLORS.grayscale200 : COLORS.grayscale700 }]}>{user.email}</Text>
                        {/* {transaction_id && (
                            <Text style={{ color: COLORS.primary, fontSize: 16, marginTop: 8, fontFamily: 'Urbanist Bold' }}>
                                Transaction ID: {transaction_id}
                            </Text>
                        )} */}
                        <View style={[styles.viewContainer, {
                            backgroundColor: dark ? COLORS.dark2 : "#FAFAFA",
                        }]}>
                            <View style={styles.view}>
                                <Text style={[styles.viewLeft, { color: dark ? COLORS.grayscale400 : COLORS.grayscale700 }]}>Amount</Text>
                                <Text style={[styles.viewRight, { color: COLORS.primary }]}>{amount ? `$${parseFloat(amount).toFixed(2)}` : '-'}</Text>
                            </View>
                            <View style={styles.view}>
                                <Text style={[styles.viewLeft, { color: dark ? COLORS.grayscale400 : COLORS.grayscale700 }]}>VAT (0%)</Text>
                                <Text style={[styles.viewRight, { color: COLORS.primary }]}>{`$${vat.toFixed(2)}`}</Text>
                            </View>
                            <View style={[styles.separateLine, {
                                backgroundColor: dark ? COLORS.grayscale700 : COLORS.grayscale200
                            }]} />
                            <View style={styles.view}>
                                <Text style={[styles.viewLeft, { color: dark ? COLORS.grayscale400 : COLORS.grayscale700 }]}>Total</Text>
                                <Text style={[styles.viewRight, { color: COLORS.primary }]}>{amount ? `$${total.toFixed(2)}` : '-'}</Text>
                            </View>
                        </View>
                    </View>
                    {/* Description from user input */}
                    {note ? (
                        <>
                            <Text style={[styles.reviewTitle, {
                                color: dark ? COLORS.white : COLORS.greyscale900,
                                marginTop: 16
                            }]}>Description</Text>
                            <TextInput
                                value={note}
                                editable={false}
                                multiline={true}
                                style={[styles.noteInput, {
                                    backgroundColor: dark ? COLORS.dark2 : "#FAFAFA",
                                    color: dark ? COLORS.white : COLORS.greyscale900
                                }]}
                            />
                        </>
                    ) : null}
                </ScrollView>
            </View>
            <View style={styles.bottomContainer}>
                <Button
                    title="Confirm &  Send"
                    style={styles.sendBtn}
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
    profileContainer: {
        alignItems: 'center',
    },
    avatar: {
        height: 100,
        width: 100,
        borderRadius: 50,
        marginVertical: 16
    },
    username: {
        fontSize: 24,
        fontFamily: "Urbanist Bold",
        color: COLORS.black
    },
    useremail: {
        fontSize: 16,
        fontFamily: "Urbanist Medium",
        color: COLORS.grayscale700,
        marginVertical: 4
    },
    viewContainer: {
        width: SIZES.width - 32,
        backgroundColor: "#FAFAFA",
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginVertical: 16
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
    reviewTitle: {
        fontSize: 18,
        fontFamily: "Urbanist Bold",
        color: COLORS.greyscale900,
        marginVertical: 8,
    },
    noteInput: {
        width: SIZES.width - 32,
        minHeight: 80,
        borderRadius: 16,
        backgroundColor: "#FAFAFA",
        fontSize: 16,
        fontFamily: "Urbanist Regular",
        paddingHorizontal: 16,
        paddingVertical: 12,
        color: COLORS.greyscale900
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
});

export default SendMoneyReviewSummary;