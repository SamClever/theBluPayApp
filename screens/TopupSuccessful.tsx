import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { COLORS, SIZES, icons, illustrations } from '../constants';
import Button from '../components/Button';

type TopupSuccessfulRouteProp = RouteProp<{ 
  params: { 
    amount: string; 
    mobileNumber: string; 
    accountNumber: string; 
    accountName?: string;
    remarks?: string; 
    provider?: string;
  } 
}, 'params'>;

const TopupSuccessful = () => {
    const navigation = useNavigation<any>();
    const { colors, dark } = useTheme();
    const route = useRoute<TopupSuccessfulRouteProp>();
    const { amount, mobileNumber, accountNumber, accountName, remarks, provider } = route.params;

    // Get current date and time
    const now = new Date();
    const dateString = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    // Generate transaction reference number similar to SMS format
    const generateTransactionRef = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 10; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    const handleDone = () => {
        navigation.navigate('Home');
    };

    const handleViewReceipt = () => {
        // Navigate to receipt screen if you have one
        navigation.navigate('Home');
    };

    return (
        <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                {/* BluPay Logo */}
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/images/Blupay_logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                {/* Success Icon */}
                <View style={styles.iconContainer}>
                    <View style={[styles.iconBox, { backgroundColor: dark ? COLORS.dark2 : '#E8F5E8' }]}>
                        <Image
                            source={icons.check as ImageSourcePropType}
                            style={[styles.icon, { tintColor: '#22C55E' }]}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={[styles.title, { color: dark ? COLORS.white : COLORS.black }]}>
                        Malipo Yamefanikiwa!
                    </Text>
                    <Text style={[styles.subtitle, { color: dark ? COLORS.grayscale200 : COLORS.grayscale700 }]}>
                        Umefanikiwa kufanya malipo ya TSh {parseFloat(amount).toFixed(2)}
                    </Text>
                </View>

                {/* Date and Time */}
                <View style={[styles.dateTimeContainer, {
                    backgroundColor: dark ? COLORS.dark2 : "#FAFAFA",
                }]}>
                    <Text style={[styles.dateTimeTitle, { color: dark ? COLORS.white : COLORS.black }]}>
                        Maelezo ya Muamala
                    </Text>
                    <View style={styles.dateTimeRow}>
                        <Text style={[styles.dateTimeLabel, { color: dark ? COLORS.grayscale400 : COLORS.grayscale700 }]}>
                            Tarehe
                        </Text>
                        <Text style={[styles.dateTimeValue, { color: COLORS.primary }]}>
                            {dateString}
                        </Text>
                    </View>
                    <View style={styles.dateTimeRow}>
                        <Text style={[styles.dateTimeLabel, { color: dark ? COLORS.grayscale400 : COLORS.grayscale700 }]}>
                            Saa
                        </Text>
                        <Text style={[styles.dateTimeValue, { color: COLORS.primary }]}>
                            {timeString}
                        </Text>
                    </View>
                    <View style={styles.dateTimeRow}>
                        <Text style={[styles.dateTimeLabel, { color: dark ? COLORS.grayscale400 : COLORS.grayscale700 }]}>
                            Kumbukumbu No.
                        </Text>
                        <Text style={[styles.dateTimeValue, { color: COLORS.primary }]}>
                            {generateTransactionRef()}
                        </Text>
                    </View>
                </View>

                {/* Transaction Details */}
                <View style={[styles.detailsContainer, {
                    backgroundColor: dark ? COLORS.dark2 : "#FAFAFA",
                }]}>
                    <Text style={[styles.detailsTitle, { color: dark ? COLORS.white : COLORS.black }]}>
                        Maelezo ya Muamala
                    </Text>
                    
                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: dark ? COLORS.grayscale400 : COLORS.grayscale700 }]}>
                            Kiasi
                        </Text>
                        <Text style={[styles.detailValue, { color: COLORS.primary }]}>
                            Tsh {parseFloat(amount).toFixed(2)}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: dark ? COLORS.grayscale400 : COLORS.grayscale700 }]}>
                            Nambari ya Simu
                        </Text>
                        <Text style={[styles.detailValue, { color: COLORS.primary }]}>
                            {mobileNumber}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: dark ? COLORS.grayscale400 : COLORS.grayscale700 }]}>
                            Nambari ya Akaunti
                        </Text>
                        <Text style={[styles.detailValue, { color: COLORS.primary }]}>
                            {accountNumber}
                        </Text>
                    </View>
                    {accountName && (
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: dark ? COLORS.grayscale400 : COLORS.grayscale700 }]}>
                                Jina la Akaunti
                            </Text>
                            <Text style={[styles.detailValue, { color: COLORS.primary }]}>
                                {accountName}
                            </Text>
                        </View>
                    )}

                    {remarks && (
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: dark ? COLORS.grayscale400 : COLORS.grayscale700 }]}>
                                Maelezo
                            </Text>
                            <Text style={[styles.detailValue, { color: COLORS.primary }]}>
                                {remarks}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <Button
                        title="View Receipt"
                        style={styles.viewReceiptBtn}
                        onPress={handleViewReceipt}
                        filled={false}
                    />
                    <Button
                        title="Done"
                        style={styles.doneBtn}
                        onPress={handleDone}
                        filled
                    />
                </View>
            </View>
        </SafeAreaView>
    );
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
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logo: {
        width: 120,
        height: 40,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    dateTimeContainer: {
        backgroundColor: "#FAFAFA",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    dateTimeTitle: {
        fontSize: 20,
        fontFamily: "Urbanist Bold",
        color: COLORS.black,
        marginBottom: 20,
        textAlign: 'center',
    },
    dateTimeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    dateTimeLabel: {
        fontSize: 16,
        fontFamily: "Urbanist Medium",
        color: COLORS.grayscale700,
    },
    dateTimeValue: {
        fontSize: 16,
        fontFamily: "Urbanist Bold",
        color: COLORS.primary,
        textAlign: 'right',
        flex: 1,
        marginLeft: 20,
    },
    iconBox: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    icon: {
        width: 50,
        height: 50,
    },
    title: {
        fontSize: 28,
        fontFamily: "Urbanist Bold",
        color: COLORS.black,
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        fontFamily: "Urbanist Medium",
        color: COLORS.grayscale700,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    detailsContainer: {
        backgroundColor: "#FAFAFA",
        borderRadius: 16,
        padding: 20,
        marginBottom: 40,
    },
    detailsTitle: {
        fontSize: 20,
        fontFamily: "Urbanist Bold",
        color: COLORS.black,
        marginBottom: 20,
        textAlign: 'center',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    detailLabel: {
        fontSize: 16,
        fontFamily: "Urbanist Medium",
        color: COLORS.grayscale700,
    },
    detailValue: {
        fontSize: 16,
        fontFamily: "Urbanist Bold",
        color: COLORS.primary,
        textAlign: 'right',
        flex: 1,
        marginLeft: 20,
    },
    buttonContainer: {
        gap: 16,
    },
    viewReceiptBtn: {
        width: SIZES.width - 32,
    },
    doneBtn: {
        width: SIZES.width - 32,
    },
});

export default TopupSuccessful; 