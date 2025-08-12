import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, FONTS } from '../constants';
import Header from '../components/Header';
import Button from '../components/Button';
import { useTheme } from '../theme/ThemeProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Feather from "react-native-vector-icons/Feather";

type NavigationProps = { 
  navigate: (screen: string, params?: any) => void; 
  goBack: () => void;
};

interface UserInfo {
  identity_image_url: string;
  selfie_image_url: string;
  identity_type: string;
  country: string;
  First_name: string;
  Last_name: string;
  date_of_birth: string;
  gender: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  zip_code: string;
  mobile: string;
  email: string;
  account_number: string;
  kyc_submitted: boolean;
  kyc_confirmed: boolean;
  account_status: string;
}

const ReviewInfo = () => {
  const navigation = useNavigation<NavigationProps>();
  const { colors, dark } = useTheme();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Custom Alert States
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('Information');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info' | 'custom'>('custom');
  const [alertCallback, setAlertCallback] = useState<(() => void) | null>(null);
  const [successData, setSuccessData] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  useEffect(() => {
    fetchUserInfo();
  }, []);

    const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      console.log('Fetching user info with token:', token ? 'Token exists' : 'No token');
      
      if (!token) {
        Alert.alert('Authentication Error', 'Please log in to view your information');
        navigation.goBack();
        return;
      }

      console.log('Token length:', token.length);
      console.log('Token starts with:', token.substring(0, 20) + '...');

      // For development/testing - show mock data if API is not ready
      if (__DEV__ && false) { // Disabled for now to test real API
        console.log('Development mode: Showing mock data for testing');
        const mockData: UserInfo = {
          identity_image_url: "https://theblupayapi.com/media/user_84/e4974a22-26ab-4566-924d-2f518ae8fc45_jpg",
          selfie_image_url: "https://theblupayapi.com/media/user_84/e4974a22-26ab-4566-924d-2f518ae8fc45_jpg_RbBZSC0",
          identity_type: "national_id_card",
          country: "TZ",
          First_name: "sam",
          Last_name: "Ali",
          date_of_birth: "1979-07-31",
          gender: "male",
          address_line1: "magogoni",
          address_line2: "",
          city: "Amani",
          state: "zanzibar",
          zip_code: "0000",
          mobile: "0779791909",
          email: "salumalbattawy94@gmail.com",
          account_number: "2178621339029",
          kyc_submitted: true,
          kyc_confirmed: false,
          account_status: "pending"
        };
        setUserInfo(mockData);
        setLoading(false);
        return;
      }
      
      const response = await fetch('https://theblupayapi.com/Account/kyc/step5/', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'User-Agent': 'AllPay-Mobile-App',
        },
      });

      console.log('API Response status:', response.status);
      console.log('API Response headers:', Object.fromEntries(response.headers.entries()));
      console.log('Request URL:', response.url);
      console.log('Request method:', response.type);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Response data:', data);
        setUserInfo(data);
      } else {
        const errorData = await response.text();
        console.log('❌ API Error response:', errorData);
        console.log('❌ Response status:', response.status);
        console.log('❌ Response status text:', response.statusText);
        
        // Show specific error message based on status
        let errorMsg = `Failed to fetch user information (Status: ${response.status})`;
        
        if (response.status === 401) {
          errorMsg = 'Authentication failed. Please log in again.';
        } else if (response.status === 404) {
          errorMsg = 'KYC Step 5 not available yet. Please complete all previous KYC steps first.';
        } else if (response.status === 500) {
          errorMsg = 'Server error. Please try again later.';
        } else if (response.status === 403) {
          errorMsg = 'Access denied. You may not have permission to view this information.';
        }
        
        setErrorMessage(errorMsg);
        console.log('Error message:', errorMsg);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      setErrorMessage('Network error occurred. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not provided';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatGender = (gender: string) => {
    return gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : 'Not provided';
  };

  const formatIdentityType = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'national_id_card': 'National ID Card',
      'passport': 'Passport',
      'drivers_license': 'Driver\'s License',
    };
    return typeMap[type] || type;
  };

  const formatAccountStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pending',
      'approved': 'Approved',
      'rejected': 'Rejected',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return COLORS.success;
      case 'rejected':
        return COLORS.error;
      case 'pending':
        return COLORS.warning;
      default:
        return COLORS.gray;
    }
  };

  // handleConfirm removed: KYC confirm API now only called in CreateNewPIN screen

  const handleEdit = () => {
    navigation.goBack();
  };

  const InfoRow = ({ label, value, icon }: { label: string; value: string; icon: string }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLabelContainer}>
        <MaterialCommunityIcons name={icon as any} size={20} color={COLORS.primary} />
        <Text style={[styles.infoLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );

  const InfoSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <View style={[styles.sectionContent, { 
        backgroundColor: dark ? COLORS.dark2 : COLORS.greyscale500,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
      }]}>
        {children}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.area, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading your information...</Text>
        </View>
      </View>
    );
  }

  if (!userInfo) {
    return (
      <View style={[styles.area, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={64} color={COLORS.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>Failed to load information</Text>
          <Text style={[styles.errorSubtext, { color: colors.text }]}>
            {errorMessage || 'Please make sure you have completed your profile information'}
          </Text>
          <View style={styles.errorButtonContainer}>
            <Button
              title="Retry"
              onPress={fetchUserInfo}
              style={styles.retryButton}
            />
            <Button
              title="Go Back"
              onPress={navigation.goBack}
              filled={false}
              textColor={COLORS.primary}
              style={styles.backButton}
            />
            {errorMessage.includes('KYC Step 5 not available') && (
              <Button
                title="Complete KYC Steps"
                onPress={() => navigation.navigate('ReasonForUsingAllPay')}
                filled={false}
                textColor={COLORS.primary}
                style={styles.completeKycButton}
              />
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.area, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {!showErrorAlert && (
          <>
            <View style={styles.headerContainer}>
              <Header title="Review Information" />
            </View>
        
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Status Banner */}
          <View style={[styles.statusBanner, { 
            backgroundColor: getStatusColor(userInfo.account_status) + '15',
            borderColor: getStatusColor(userInfo.account_status) + '30',
          }]}>
            <View style={styles.statusContent}>
              <View style={[styles.statusIconContainer, { 
                backgroundColor: getStatusColor(userInfo.account_status) + '20' 
              }]}>
                <MaterialCommunityIcons 
                  name="account-check" 
                  size={24} 
                  color={getStatusColor(userInfo.account_status)} 
                />
              </View>
              <View style={styles.statusTextContainer}>
                <Text style={[styles.statusTitle, { color: getStatusColor(userInfo.account_status) }]}>
                  Account Status: {formatAccountStatus(userInfo.account_status)}
                </Text>
                <Text style={[styles.statusSubtitle, { color: colors.text }]}>
                  KYC {userInfo.kyc_submitted ? 'Submitted' : 'Not Submitted'} • 
                  {userInfo.kyc_confirmed ? ' Confirmed' : ' Not Confirmed'}
                </Text>
              </View>
            </View>
          </View>

          {/* Personal Information */}
          <InfoSection title="Personal Information">
            <InfoRow label="First Name" value={userInfo.First_name} icon="account" />
            <InfoRow label="Last Name" value={userInfo.Last_name} icon="account" />
            <InfoRow label="Date of Birth" value={formatDate(userInfo.date_of_birth)} icon="calendar" />
            <InfoRow label="Gender" value={formatGender(userInfo.gender)} icon="gender-male-female" />
            <InfoRow label="Email" value={userInfo.email} icon="email" />
            <InfoRow label="Mobile" value={userInfo.mobile} icon="phone" />
          </InfoSection>

          {/* Address Information */}
          <InfoSection title="Address Information">
            <InfoRow label="Address Line 1" value={userInfo.address_line1} icon="map-marker" />
            {userInfo.address_line2 && (
              <InfoRow label="Address Line 2" value={userInfo.address_line2} icon="map-marker" />
            )}
            <InfoRow label="City" value={userInfo.city} icon="city" />
            <InfoRow label="State" value={userInfo.state} icon="map" />
            <InfoRow label="Zip Code" value={userInfo.zip_code} icon="postal-code" />
            <InfoRow label="Country" value={userInfo.country} icon="flag" />
          </InfoSection>

          {/* Account Information */}
          <InfoSection title="Account Information">
            <InfoRow label="Account Number" value={userInfo.account_number} icon="credit-card" />
            <InfoRow label="Identity Type" value={formatIdentityType(userInfo.identity_type)} icon="card-account-details" />
          </InfoSection>

          {/* Identity Images */}
          <InfoSection title="Identity Documents">
            <View style={styles.imageContainer}>
              <View style={styles.imageItem}>
                <Text style={[styles.imageLabel, { color: colors.text }]}>Identity Document</Text>
                {userInfo.identity_image_url ? (
                  <View style={styles.imageWrapper}>
                    <Image 
                      source={{ uri: userInfo.identity_image_url }} 
                      style={styles.documentImage}
                      resizeMode="cover"
                    />
                  </View>
                ) : (
                  <View style={[styles.noImage, { backgroundColor: dark ? COLORS.dark3 : COLORS.grayscale200 }]}>
                    <MaterialCommunityIcons name="file-image" size={32} color={COLORS.gray} />
                    <Text style={[styles.noImageText, { color: colors.text }]}>No image</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.imageItem}>
                <Text style={[styles.imageLabel, { color: colors.text }]}>Selfie with ID</Text>
                {userInfo.selfie_image_url ? (
                  <View style={styles.imageWrapper}>
                    <Image 
                      source={{ uri: userInfo.selfie_image_url }} 
                      style={styles.documentImage}
                      resizeMode="cover"
                    />
                  </View>
                ) : (
                  <View style={[styles.noImage, { backgroundColor: dark ? COLORS.dark3 : COLORS.grayscale200 }]}>
                    <MaterialCommunityIcons name="camera" size={32} color={COLORS.gray} />
                    <Text style={[styles.noImageText, { color: colors.text }]}>No image</Text>
                  </View>
                )}
              </View>
            </View>
          </InfoSection>
        </ScrollView>

        {/* Action Buttons: Only Edit and Continue */}
        <View style={styles.buttonContainer}>
          <Button
            title="Update Information"
            onPress={handleEdit}
            filled={false}
            textColor={COLORS.primary}
            style={styles.editButton}
          />
          <Button
            title="Continue"
            onPress={() => navigation.navigate('CreateNewPIN')}
            filled={true}
            style={styles.confirmButton}
          />
        </View>
          </>
        )}
      </View>


<<<<<<< HEAD
            {/* Title */}
            <Text style={[styles.successTitle, { color: colors.text }]}>
              Account Activated!
            </Text>

            {/* Message */}
            <Text style={[styles.successMessage, { color: colors.text }]}>
              {successData?.message || 'Your account is active! We\'re reviewing your KYC now.'}
            </Text>

            {/* Account Information */}
            {successData?.account && (
              <View style={[styles.accountInfoContainer, { backgroundColor: dark ? COLORS.dark2 : COLORS.greyscale500 }]}>
                <Text style={[styles.accountInfoTitle, { color: colors.text }]}>
                  Account Details
                </Text>
                
                <View style={styles.accountInfoRow}>
                  <Text style={[styles.accountInfoLabel, { color: colors.text }]}>Account Number:</Text>
                  <Text style={[styles.accountInfoValue, { color: COLORS.primary }]}>
                    {successData.account.account_number}
                  </Text>
                </View>

                <View style={styles.accountInfoRow}>
                  <Text style={[styles.accountInfoLabel, { color: colors.text }]}>PIN:</Text>
                  <Text style={[styles.accountInfoValue, { color: COLORS.primary }]}>
                    {successData.account.pin_number}
                  </Text>
                </View>

                <View style={styles.accountInfoRow}>
                  <Text style={[styles.accountInfoLabel, { color: colors.text }]}>Red Code:</Text>
                  <Text style={[styles.accountInfoValue, { color: COLORS.primary }]}>
                    {successData.account.red_code}
                  </Text>
                </View>

                <View style={styles.accountInfoRow}>
                  <Text style={[styles.accountInfoLabel, { color: colors.text }]}>Status:</Text>
                  <View style={[styles.statusBadge, { backgroundColor: COLORS.success + '20' }]}>
                    <Text style={[styles.statusText, { color: COLORS.success }]}>
                      {successData.account.account_status}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Action Button */}
            <Button
              title="Continue"
              onPress={() => {
                setAlertVisible(false);
                navigation.navigate('CreateNewPIN');
              }}
              filled={true}
              style={styles.successButton}
            />
          </View>
        </View>
      </Modal>
=======
>>>>>>> 47a2ff4a (move activete account to create new pin)
    </View>
  );
};

const styles = StyleSheet.create({
  area: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  scrollContent: {
    paddingHorizontal: SIZES.padding3,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SIZES.padding2,
    fontSize: 16,
    fontFamily: 'Urbanist Medium',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding3,
  },
  errorText: {
    marginTop: SIZES.padding2,
    fontSize: 16,
    fontFamily: 'Urbanist Medium',
    textAlign: 'center',
  },
  errorSubtext: {
    marginTop: SIZES.padding,
    fontSize: 14,
    fontFamily: 'Urbanist Regular',
    textAlign: 'center',
    opacity: 0.8,
  },
  errorButtonContainer: {
    marginTop: SIZES.padding3,
    gap: SIZES.padding2,
    alignItems: 'center',
  },
  retryButton: {
    width: 120,
  },
  backButton: {
    width: 120,
  },
  completeKycButton: {
    width: 120,
  },
  statusBanner: {
    marginBottom: SIZES.padding3,
    borderRadius: 12,
    padding: SIZES.padding3,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTextContainer: {
    marginLeft: SIZES.padding2,
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontFamily: 'Urbanist Bold',
    marginBottom: 2,
  },
  statusSubtitle: {
    fontSize: 14,
    fontFamily: 'Urbanist Regular',
  },
  section: {
    marginBottom: SIZES.padding3,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Urbanist Bold',
    marginBottom: SIZES.padding2,
  },
  sectionContent: {
    borderRadius: 12,
    padding: SIZES.padding3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Urbanist Medium',
    marginLeft: SIZES.padding,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Urbanist Regular',
    textAlign: 'right',
    flex: 1,
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SIZES.padding2,
  },
  imageItem: {
    flex: 1,
    alignItems: 'center',
  },
  imageLabel: {
    fontSize: 14,
    fontFamily: 'Urbanist Medium',
    marginBottom: SIZES.padding,
    textAlign: 'center',
  },
  imageWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  documentImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
  },
  noImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  noImageText: {
    fontSize: 12,
    fontFamily: 'Urbanist Regular',
    marginTop: 4,
  },
  buttonContainer: {
    paddingHorizontal: SIZES.padding3,
    paddingBottom: SIZES.padding3,
    gap: SIZES.padding2,
  },
  editButton: {
    height: 48,
    borderRadius: 12,
  },
  confirmButton: {
    height: 48,
    borderRadius: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding3,
  },
  successAlert: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: SIZES.padding3,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  successIconContainer: {
    marginBottom: SIZES.padding2,
  },
  successTitle: {
    fontSize: 24,
    fontFamily: 'Urbanist Bold',
    marginBottom: SIZES.padding,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    fontFamily: 'Urbanist Regular',
    textAlign: 'center',
    marginBottom: SIZES.padding3,
    lineHeight: 22,
  },
  accountInfoContainer: {
    width: '100%',
    borderRadius: 12,
    padding: SIZES.padding3,
    marginBottom: SIZES.padding3,
  },
  accountInfoTitle: {
    fontSize: 18,
    fontFamily: 'Urbanist Bold',
    marginBottom: SIZES.padding2,
    textAlign: 'center',
  },
  accountInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  accountInfoLabel: {
    fontSize: 14,
    fontFamily: 'Urbanist Medium',
    flex: 1,
  },
  accountInfoValue: {
    fontSize: 14,
    fontFamily: 'Urbanist Bold',
    flex: 1,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: SIZES.padding2,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Urbanist Bold',
    textTransform: 'uppercase',
  },
  successButton: {
    width: '100%',
    height: 48,
    borderRadius: 12,
  },
});

export default ReviewInfo; 