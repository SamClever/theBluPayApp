import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { COLORS, SIZES } from '../constants';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../theme/ThemeProvider';

interface CustomAlertModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
  onButtonPress?: () => void;
  icon?: any; // image source
  type?: 'success' | 'error' | 'warning' | 'info' | 'custom';
  showCloseButton?: boolean;
  autoClose?: boolean;
  autoCloseDelay?: number;
  showIcon?: boolean;
  buttonStyle?: 'primary' | 'secondary' | 'danger';
  customIcon?: string; // icon name for react-native-vector-icons
}

const CustomAlertModal: React.FC<CustomAlertModalProps> = ({
  visible,
  onClose,
  title,
  message,
  buttonText = 'Okay',
  onButtonPress,
  icon,
  type = 'custom',
  showCloseButton = true,
  autoClose = false,
  autoCloseDelay = 3000,
  showIcon = true,
  buttonStyle = 'primary',
  customIcon,
}) => {
  const { colors, dark } = useTheme();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      if (autoClose) {
        const timer = setTimeout(() => {
          onClose();
        }, autoCloseDelay);
        return () => clearTimeout(timer);
      }
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim, autoClose, autoCloseDelay, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: dark ? '#0F172A' : '#F0FDF4',
          borderColor: '#22C55E',
          iconColor: '#22C55E',
          titleColor: dark ? '#4ADE80' : '#166534',
          defaultIcon: 'check-circle',
        };
      case 'error':
        return {
          backgroundColor: dark ? '#1F2937' : '#FEF2F2',
          borderColor: '#EF4444',
          iconColor: '#EF4444',
          titleColor: dark ? '#F87171' : '#991B1B',
          defaultIcon: 'alert-circle',
        };
      case 'warning':
        return {
          backgroundColor: dark ? '#1F2937' : '#FFFBEB',
          borderColor: '#F59E0B',
          iconColor: '#F59E0B',
          titleColor: dark ? '#FBBF24' : '#92400E',
          defaultIcon: 'alert-triangle',
        };
      case 'info':
        return {
          backgroundColor: dark ? '#0F172A' : '#EFF6FF',
          borderColor: '#3B82F6',
          iconColor: '#3B82F6',
          titleColor: dark ? '#60A5FA' : '#1E40AF',
          defaultIcon: 'info',
        };
      default:
        return {
          backgroundColor: dark ? '#1F2937' : '#FFFFFF',
          borderColor: COLORS.primary,
          iconColor: COLORS.primary,
          titleColor: COLORS.primary,
          defaultIcon: 'message-circle',
        };
    }
  };

  const getButtonStyle = () => {
    switch (buttonStyle) {
      case 'secondary':
        return {
          backgroundColor: 'transparent',
          borderColor: COLORS.primary,
          borderWidth: 2,
        };
      case 'danger':
        return {
          backgroundColor: '#EF4444',
        };
      default:
        return {
          backgroundColor: COLORS.primary,
        };
    }
  };

  const getButtonTextStyle = () => {
    switch (buttonStyle) {
      case 'secondary':
        return {
          color: COLORS.primary,
        };
      case 'danger':
        return {
          color: '#FFFFFF',
        };
      default:
        return {
          color: '#FFFFFF',
        };
    }
  };

  const typeStyles = getTypeStyles();
  const buttonStyles = getButtonStyle();
  const buttonTextStyles = getButtonTextStyle();

  const renderIcon = () => {
    if (!showIcon) return null;
    
    if (icon) {
      return <Image source={icon} style={[styles.icon, { tintColor: typeStyles.iconColor }]} resizeMode="contain" />;
    }
    
    if (customIcon) {
      return (
        <View style={[styles.iconContainer, { backgroundColor: typeStyles.iconColor + '20' }]}>
          <Icon name={customIcon} size={40} color={typeStyles.iconColor} />
        </View>
      );
    }
    
    return (
      <View style={[styles.iconContainer, { backgroundColor: typeStyles.iconColor + '20' }]}>
        <Icon name={typeStyles.defaultIcon} size={40} color={typeStyles.iconColor} />
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View 
          style={[
            styles.modalContent, 
            { 
              transform: [{ scale: scaleAnim }],
              backgroundColor: typeStyles.backgroundColor,
              borderColor: typeStyles.borderColor,
              borderWidth: 2,
            }
          ]}
        >
          {showCloseButton && (
            <TouchableOpacity 
              style={[
                styles.closeBtn, 
                { 
                  backgroundColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                }
              ]} 
              onPress={onClose}
            >
              <Icon name="x" size={22} color={dark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          )}
          
          {renderIcon()}
          
          <Text style={[styles.title, { color: typeStyles.titleColor }]}>{title}</Text>
          <Text style={[styles.message, { color: dark ? '#D1D5DB' : '#374151' }]}>{message}</Text>
          
          <TouchableOpacity
            style={[styles.button, buttonStyles]}
            onPress={onButtonPress || onClose}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, buttonTextStyles]}>{buttonText}</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 12,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 2,
    padding: 8,
    borderRadius: 20,
  },
  icon: {
    width: 80,
    height: 80,
    marginBottom: 20,
    marginTop: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Urbanist Bold',
    textAlign: 'center',
    marginBottom: 12,
    marginTop: 8,
    lineHeight: 32,
  },
  message: {
    fontSize: 16,
    fontFamily: 'Urbanist Regular',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
    minHeight: 56,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Urbanist Bold',
    textAlign: 'center',
  },
});

export default CustomAlertModal; 