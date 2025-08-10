import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageSourcePropType, ViewStyle, TextStyle, ImageStyle, Image } from 'react-native';
import { SIZES, COLORS, icons } from '../constants';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
    title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
    const navigation = useNavigation<NavigationProp<any>>();
    const { colors, dark } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, {
            backgroundColor: dark ? COLORS.dark1 : COLORS.white,
            paddingTop: insets.top + 8,
            minHeight: insets.top + 56,
        }]}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Image
                    source={icons.back as ImageSourcePropType}
                    resizeMode='contain'
                    style={[styles.backIcon, {
                        tintColor: colors.text
                    }]}
                />
            </TouchableOpacity>
            <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.title, { color: colors.text }]}
            >
                {title}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.white,
        width: '100%',
        paddingHorizontal: 16,
        paddingBottom: 12,
        flexDirection: "row",
        alignItems: "center",
    } as ViewStyle,
    backIcon: {
        width: 24,
        height: 24,
        marginRight: 16,
    } as ImageStyle,
    title: {
        fontSize: 22,
        fontFamily: "Urbanist Bold",
        color: COLORS.black,
        flexShrink: 1,
    } as TextStyle,
});

export default Header;