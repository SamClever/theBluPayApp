import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { COLORS, SIZES, icons } from '../constants';
import Header from '../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';

type TopupPinEntryRouteProp = RouteProp<{ 
  params: { 
    amount: string; 
    mobileNumber: string; 
    accountNumber: string; 
    accountName?: string;
    remarks?: string; 
    provider?: string;
  } 
}, 'params'>;

const TopupPinEntry = () => {
    const navigation = useNavigation<any>();
    const { colors, dark } = useTheme();
    const route = useRoute<TopupPinEntryRouteProp>();
    const { amount, mobileNumber, accountNumber, accountName, remarks, provider } = route.params;

    const [pin, setPin] = useState(['', '', '', '']);
    const [loading, setLoading] = useState(false);
    const pinInputs = useRef<Array<View | null>>([]);

    const handlePinChange = (index: number, value: string) => {
        if (value.length <= 1) {
            const newPin = [...pin];
            newPin[index] = value;
            setPin(newPin);

            // Move to next input if value entered
            if (value.length === 1 && index < 3) {
                pinInputs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyPress = (index: number, key: string) => {
        if (key === 'backspace') {
            if (pin[index] === '') {
                // Move to previous input if current is empty
                if (index > 0) {
                    const newPin = [...pin];
                    newPin[index - 1] = '';
                    setPin(newPin);
                    pinInputs.current[index - 1]?.focus();
                }
            } else {
                // Clear current input
                const newPin = [...pin];
                newPin[index] = '';
                setPin(newPin);
            }
        }
    };

    const handleConfirm = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            
            if (!token) {
                Alert.alert('Error', 'Session expired. Please log in again.');
                navigation.navigate('Login');
                return;
            }

            console.log('Initiating USSD topup for:', {
                amount,
                phone: mobileNumber
            });

            // Call topup API to trigger USSD
            const response = await fetch('https://theblupayapi.com/topup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    amount: amount,
                    phone: mobileNumber,
                }),
            });

            console.log('Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('USSD initiated successfully:', data);
                
                // Show USSD instructions
                Alert.alert(
                    'USSD Prompt Initiated',
                    `A USSD prompt has been sent to your phone (${mobileNumber}).\n\nPlease complete the topup by entering your PIN when prompted.\n\nYou will receive a confirmation SMS once completed.`,
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                // Navigate to success screen (user will complete via USSD)
                                navigation.navigate('TopupSuccessful', {
                                    amount,
                                    mobileNumber,
                                    accountNumber,
                                    accountName,
                                    remarks,
                                    provider
                                });
                            }
                        }
                    ]
                );
            } else {
                let errorMessage = 'Failed to initiate USSD topup. Please try again.';
                try {
                    const errorData = await response.json();
                    console.log('Error response:', errorData);
                    errorMessage = errorData.message || errorData.detail || errorData.error || errorMessage;
                } catch (parseError) {
                    console.log('Could not parse error response:', parseError);
                    if (response.status === 404) {
                        errorMessage = 'API endpoint not found. Please check the server configuration.';
                    } else {
                        errorMessage = `Server error (${response.status}). Please try again.`;
                    }
                }
                Alert.alert('USSD Initiation Failed', errorMessage);
            }
        } catch (error: any) {
            console.error('USSD initiation error:', error);
            console.error('Error details:', {
                message: error?.message || 'Unknown error',
                stack: error?.stack,
                name: error?.name
            });
            
            let errorMessage = 'An error occurred while initiating USSD topup. Please try again.';
            
            if (error?.message?.includes('Network request failed')) {
                errorMessage = 'Network error. Please check your internet connection and try again.';
            } else if (error?.message?.includes('timeout')) {
                errorMessage = 'Request timeout. Please try again.';
            } else if (error?.message?.includes('fetch')) {
                errorMessage = 'Connection error. Please check your internet and try again.';
            }
            
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const isPinComplete = pin.every(digit => digit !== '');

    return (
        <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Header title="Confirm Topup" />
                
                {/* Provider Info */}
                <View style={[styles.providerContainer, {
                    backgroundColor: dark ? COLORS.dark2 : "#FAFAFA",
                }]}>
                    <Image 
                        source={icons.money as any} 
                        style={[styles.providerIcon, { tintColor: COLORS.primary }]} 
                    />
                    <Text style={[styles.providerText, { color: dark ? COLORS.white : COLORS.black }]}>
                        {provider || 'Mobile Money'}
                    </Text>
                    <Text style={[styles.amountText, { color: COLORS.primary }]}>
                        Tsh {parseFloat(amount).toFixed(2)}
                    </Text>
                </View>

                {/* Confirmation Info */}
                <View style={styles.pinContainer}>
                    <Text style={[styles.pinTitle, { color: dark ? COLORS.white : COLORS.black }]}>
                        Confirm Your Topup
                    </Text>
                    <Text style={[styles.pinSubtitle, { color: dark ? COLORS.grayscale200 : COLORS.grayscale700 }]}>
                        You will receive a USSD prompt on {mobileNumber} to complete this topup
                    </Text>

                    <View style={[styles.confirmationCard, {
                        backgroundColor: dark ? COLORS.dark2 : COLORS.white,
                    }]}>
                        <View style={[styles.confirmationRow, {
                            borderBottomColor: dark ? COLORS.grayscale700 : COLORS.gray2,
                        }]}>
                            <Text style={[styles.confirmationLabel, { color: dark ? COLORS.grayscale200 : COLORS.grayscale700 }]}>
                                Amount:
                            </Text>
                            <Text style={[styles.confirmationValue, { color: COLORS.primary }]}>
                                Tsh {parseFloat(amount).toFixed(2)}
                            </Text>
                        </View>
                        <View style={[styles.confirmationRow, {
                            borderBottomColor: dark ? COLORS.grayscale700 : COLORS.gray2,
                        }]}>
                            <Text style={[styles.confirmationLabel, { color: dark ? COLORS.grayscale200 : COLORS.grayscale700 }]}>
                                Phone Number:
                            </Text>
                            <Text style={[styles.confirmationValue, { color: dark ? COLORS.white : COLORS.black }]}>
                                {mobileNumber}
                            </Text>
                        </View>
                        <View style={[styles.confirmationRow, {
                            borderBottomColor: dark ? COLORS.grayscale700 : COLORS.gray2,
                        }]}>
                            <Text style={[styles.confirmationLabel, { color: dark ? COLORS.grayscale200 : COLORS.grayscale700 }]}>
                                Provider:
                            </Text>
                            <Text style={[styles.confirmationValue, { color: dark ? COLORS.white : COLORS.black }]}>
                                {provider || 'Mobile Money'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Confirm Button */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[
                            styles.confirmButton,
                            {
                                backgroundColor: COLORS.primary,
                            }
                        ]}
                        onPress={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.confirmButtonText}>
                                Initiate USSD Topup
                            </Text>
                        )}
                    </TouchableOpacity>
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
    },
    providerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    providerIcon: {
        width: 24,
        height: 24,
        marginRight: 12,
    },
    providerText: {
        fontSize: 16,
        fontFamily: "Urbanist Medium",
        flex: 1,
    },
    amountText: {
        fontSize: 18,
        fontFamily: "Urbanist Bold",
    },
    pinContainer: {
        flex: 1,
        alignItems: 'center',
    },
    pinTitle: {
        fontSize: 24,
        fontFamily: "Urbanist Bold",
        marginBottom: 8,
        textAlign: 'center',
    },
    pinSubtitle: {
        fontSize: 16,
        fontFamily: "Urbanist Medium",
        textAlign: 'center',
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    confirmationCard: {
        borderRadius: 16,
        padding: 20,
        marginTop: 20,
        width: '100%',
        maxWidth: 320,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    confirmationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    confirmationLabel: {
        fontSize: 16,
        fontFamily: "Urbanist Medium",
        flex: 1,
    },
    confirmationValue: {
        fontSize: 16,
        fontFamily: "Urbanist Bold",
        textAlign: 'right',
        flex: 1,
    },
    pinInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: 280,
        marginBottom: 40,
    },
    pinInput: {
        width: 60,
        height: 60,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 8,
    },
    pinDigit: {
        fontSize: 24,
        fontFamily: "Urbanist Bold",
    },
    keypadContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: 300,
    },
    keypadButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 8,
        borderWidth: 1,
        borderColor: COLORS.gray2,
    },
    keypadText: {
        fontSize: 24,
        fontFamily: "Urbanist Bold",
    },
    buttonContainer: {
        paddingVertical: 20,
    },
    confirmButton: {
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 16,
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontFamily: "Urbanist Bold",
    },
});

export default TopupPinEntry; 