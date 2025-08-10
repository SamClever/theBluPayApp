import { StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../constants';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    illustration: {
        width: SIZES.width * 0.9,
        aspectRatio: 1,
        maxHeight: SIZES.height * 0.45,
    },
    ornament: {
        zIndex: -99,
        width: SIZES.width * 0.7,
    },
    titleContainer: {
        marginVertical: 18,
        alignItems: 'center',
    },
    title: {
        ...FONTS.h3,
        color: COLORS.black,
        textAlign: "center",
    },
    subTitle: {
        ...FONTS.h3,
        color: COLORS.primary,
        textAlign: "center",
        marginTop: 8,
    },
    description: {
        ...FONTS.body3,
        color: COLORS.black,
        textAlign: 'center',
        marginBottom: 16
    },
    dotsContainer: {
        marginBottom: 20,
        marginTop: 8,
    },
    buttonContainer: {
        width: '100%',
        padding: 22,
        borderTopLeftRadius: SIZES.radius,
        borderTopRightRadius: SIZES.radius,
        backgroundColor: 'transparent',
    },
    nextButton: {
        alignSelf: 'center',
        width: '100%',
        maxWidth: SIZES.width - 44,
        marginBottom: SIZES.padding,
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
        marginTop: 22
    },
    skipButton: {
        alignSelf: 'center',
        width: '100%',
        maxWidth: SIZES.width - 44,
        marginBottom: SIZES.padding,
        backgroundColor: 'transparent',
        borderColor: COLORS.primary
    },
});

export default styles;