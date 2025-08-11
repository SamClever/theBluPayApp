import React from 'react';
import { View, Text, StyleSheet, ImageSourcePropType, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { COLORS, SIZES } from '../constants';
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";

interface InOutPaymentHistoryCardProps {
    name: string;
    image: ImageSourcePropType;
    date: string;
    time: string;
    price: string;
    type: string;
    status?: string; // SUCCESS | PENDING | PROCESSING | FAILED
    onPress: () => void;
}

const InOutPaymentHistoryCard: React.FC<InOutPaymentHistoryCardProps> = ({
    name,
    image,
    date,
    time,
    price,
    type,
    status,
    onPress
}) => {
    const { dark } = useTheme();
    const { badgeBg, badgeFg, badgeText } = getStatusColors(status);

    return (
        <TouchableOpacity onPress={onPress} style={[styles.container, {
            backgroundColor: dark ? COLORS.dark2 : COLORS.white
        }]}>
            <View style={styles.viewLeftContainer}>
                <Image
                    source={image}
                    resizeMode='contain'
                    style={styles.avatar}
                />
                <View>
                    <Text style={[styles.name, {
                        color: dark ? COLORS.white : COLORS.greyscale900
                    }]}>{name}</Text>
                    <Text style={[styles.date, {
                        color: dark ? COLORS.greyscale300 : COLORS.grayscale700
                    }]}>{date} | {time}</Text>
                </View>
            </View>
            <View style={styles.viewContainer}>
                <Text style={[styles.price, {
                    color: type === "Income" ? COLORS.primary : COLORS.red
                }]}>{price}</Text>
                {!!status && (
                  <View style={[styles.statusBadge, { backgroundColor: badgeBg, borderColor: badgeFg }]}> 
                    <Text style={[styles.statusBadgeText, { color: badgeText }]}>{status}</Text>
                  </View>
                )}
                <View style={styles.typeContainer}>
                    <SimpleLineIcons name={
                        type === "Income" ?
                            "arrow-down-circle" : 'arrow-up-circle'
                    }
                        size={14}
                        color={type === "Income" ? COLORS.primary : COLORS.red} />
                    <Text style={[styles.type, {
                        color: dark ? COLORS.greyscale300 : COLORS.grayscale700
                    }]}>{type}</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
};

function getStatusColors(status?: string) {
    const normalized = (status || '').toUpperCase();
    if (normalized === 'SUCCESS' || normalized === 'COMPLETED') {
        return { badgeBg: 'rgba(10, 190, 117, 0.12)', badgeFg: COLORS.success, badgeText: COLORS.success };
    }
    if (normalized === 'PENDING' || normalized === 'PROCESSING' || normalized === 'AUTHORIZED') {
        return { badgeBg: 'rgba(250, 204, 21, 0.12)', badgeFg: COLORS.warning, badgeText: COLORS.warning };
    }
    if (normalized === 'FAILED' || normalized === 'CANCELLED' || normalized === 'ERROR') {
        return { badgeBg: 'rgba(247, 85, 85, 0.12)', badgeFg: COLORS.error, badgeText: COLORS.error };
    }
    return { badgeBg: COLORS.tansparentPrimary, badgeFg: COLORS.primary, badgeText: COLORS.primary };
}

const styles = StyleSheet.create({
    container: {
        width: SIZES.width - 40,
        height: 86,
        borderRadius: 22,
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: COLORS.white,
        alignItems: "center",
        marginBottom: 16,
        paddingHorizontal: 12,
        marginHorizontal: 4
    },
    viewLeftContainer: {
        flexDirection: "row",
        alignItems: "center"
    },
    avatar: {
        height: 58,
        width: 58,
        borderRadius: 999
    },
    name: {
        fontSize: 18,
        fontFamily: "Urbanist Bold",
        color: COLORS.greyscale900,
        marginLeft: 12,
        marginBottom: 6
    },
    date: {
        fontSize: 14,
        fontFamily: "Urbanist Regular",
        color: COLORS.grayscale700,
        marginLeft: 12
    },
    price: {
        fontSize: 16,
        fontWeight: "bold",
        color: COLORS.primary,
        marginLeft: 12,
        marginBottom: 6
    },
    type: {
        fontSize: 12,
        fontFamily: "Urbanist Regular",
        color: COLORS.grayscale700,
        marginLeft: 6
    },
    typeContainer: {
        flexDirection: "row",
    },
    viewContainer: {
        flexDirection: "column",
        alignItems: "flex-end"
    },
    statusBadge: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 999,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
        alignSelf: 'flex-end'
    },
    statusBadgeText: {
        fontSize: 10,
        fontFamily: 'Urbanist Bold'
    }
});

export default InOutPaymentHistoryCard;
