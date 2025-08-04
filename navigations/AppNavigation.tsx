import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import { AddNewAddress, AddNewCard, Address, AllServices, ChangeEmail, ChangePIN, ChangePassword, CreateNewPIN, CreateNewPassword, CustomerService, ECardDetails, ECardRefund, ECardTopup, EditProfile, FaceRecognitionScan, FaceRecognitionWalkthrough, FillYourProfile, Fingerprint, ForgotPasswordEmail, ForgotPasswordMethods, ForgotPasswordPhoneNumber, InOutPaymentHistory, InOutPaymentViewEReceipt, Login, Notifications, Onboarding1, Onboarding2, Onboarding3, OtpVerification, PayBillsElectricityCustomerId, PayBillsElectricityReviewSummary, PayBillsInternetCustomerId, PayBillsInternetReviewSummary, PayBillsSuccessful, PayBillsWaterCustomerId, PayBillsWaterReviewSummary, PhotoIdCard, PromoAndDiscount,
   ProofAndResidency, ReasonForUsingAllPay, RequestMoney,
    RequestMoneyAmount, RequestMoneySuccessful, ScanQrCode, SelfieWithIdCard, 
    SendMoney, SendMoneyChoosePaymentType, SendMoneyReviewSummary, 
    SendMoneySuccessful, SendMoneyTypeAmount, SettingsHelpCenter, SettingsInviteFriends, SettingsLanguage,
     SettingsNotifications, SettingsPayment, SettingsPrivacyPolicy, SettingsSecurity, Signup, StatisticsVersion2, StatisticsVersion3, StatisticsVersion4, TransferToBankAmountForm, TransferToBankReviewSummary, TransferToBankSelectBank, TransferToBankSuccessful, UserAllPay, VerifyYourIdentity, Welcome, LoginOtp, ConfirmPayment,
      SelectTransferType, MobileMoneyTransfer, Topup, TopupMobileMoney, ReviewInfo } from '../screens';
import BottomTabNavigation from './BottomTabNavigation';

const Stack = createNativeStackNavigator();

const AppNavigation = () => {
  const [isFirstLaunch, setIsFirstLaunch] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const checkIfFirstLaunch = async () => {
      try {
        const value = await AsyncStorage.getItem('alreadyLaunched')
        if (value === null) {
          await AsyncStorage.setItem('alreadyLaunched', 'true')
          setIsFirstLaunch(true)
        } else {
          setIsFirstLaunch(false)
        }
      } catch (error) {
        setIsFirstLaunch(false)
      }
      setIsLoading(false) // Set loading state to false once the check is complete
    }

    checkIfFirstLaunch()
  }, [])

  if (isLoading) {
    return null // Render a loader or any other loading state component
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        // replace the second onboaring1 with login in order to make the user not to see the onboarding 
        // when login the next time
        initialRouteName={isFirstLaunch ? 'Onboarding1' : 'Welcome'}>
        <Stack.Screen name="Onboarding1" component={Onboarding1} />
        <Stack.Screen name="Onboarding2" component={Onboarding2} />
        <Stack.Screen name="Onboarding3" component={Onboarding3} />
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="ForgotPasswordMethods" component={ForgotPasswordMethods} />
        <Stack.Screen name="ForgotPasswordPhoneNumber" component={ForgotPasswordPhoneNumber}/>
        <Stack.Screen name="ForgotPasswordEmail" component={ForgotPasswordEmail}/>
        <Stack.Screen name="OtpVerification" component={OtpVerification}/>
        <Stack.Screen name="CreateNewPIN" component={CreateNewPIN} />
        <Stack.Screen name="ReasonForUsingAllPay" component={ReasonForUsingAllPay} />
        <Stack.Screen name="VerifyYourIdentity" component={VerifyYourIdentity} />
        <Stack.Screen name="ProofAndResidency" component={ProofAndResidency} />
        <Stack.Screen name="PhotoIdCard" component={PhotoIdCard} />
        <Stack.Screen name="SelfieWithIdCard" component={SelfieWithIdCard} />
        <Stack.Screen name="FaceRecognitionScan" component={FaceRecognitionScan} />
        <Stack.Screen name="FaceRecognitionWalkthrough" component={FaceRecognitionWalkthrough} />
        <Stack.Screen name="ScanQrCode" component={ScanQrCode} />
        <Stack.Screen name="FillYourProfile" component={FillYourProfile} />
        <Stack.Screen name="ReviewInfo" component={ReviewInfo} />
        <Stack.Screen name="Notifications" component={Notifications} />
        <Stack.Screen name="Address" component={Address} />
        <Stack.Screen name="AddNewAddress" component={AddNewAddress} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="SettingsHelpCenter" component={SettingsHelpCenter} />
        <Stack.Screen name="SettingsSecurity" component={SettingsSecurity} />
        <Stack.Screen name="SettingsLanguage" component={SettingsLanguage} />
        <Stack.Screen name="SettingsNotifications" component={SettingsNotifications} />
        <Stack.Screen name="AddNewCard" component={AddNewCard} />
        <Stack.Screen name="ChangeEmail" component={ChangeEmail} />
        <Stack.Screen name="ChangePassword" component={ChangePassword} />
        <Stack.Screen name="ChangePIN" component={ChangePIN} />
        <Stack.Screen name="SettingsPrivacyPolicy" component={SettingsPrivacyPolicy} />
        <Stack.Screen name="SettingsInviteFriends" component={SettingsInviteFriends} />
        <Stack.Screen name="CustomerService" component={CustomerService} />
        <Stack.Screen name="AllServices" component={AllServices} />
        <Stack.Screen name="PromoAndDiscount" component={PromoAndDiscount} />
        <Stack.Screen name="PayBillsElectricityCustomerId" component={PayBillsElectricityCustomerId} />
        <Stack.Screen name="PayBillsElectricityReviewSummary" component={PayBillsElectricityReviewSummary} />
        <Stack.Screen name="PayBillsInternetCustomerId" component={PayBillsInternetCustomerId} />
        <Stack.Screen name="PayBillsInternetReviewSummary" component={PayBillsInternetReviewSummary} />
        <Stack.Screen name="PayBillsWaterCustomerId" component={PayBillsWaterCustomerId} />
        <Stack.Screen name="PayBillsWaterReviewSummary" component={PayBillsWaterReviewSummary} />
        <Stack.Screen name="PayBillsSuccessful" component={PayBillsSuccessful} />
        <Stack.Screen name="RequestMoney" component={RequestMoney} />
        <Stack.Screen name="RequestMoneyAmount" component={RequestMoneyAmount} />
        <Stack.Screen name="RequestMoneySuccessful" component={RequestMoneySuccessful} />
        <Stack.Screen name="TransferToBankAmountForm" component={TransferToBankAmountForm} />
        <Stack.Screen name="TransferToBankSelectBank" component={TransferToBankSelectBank} />
        <Stack.Screen name="TransferToBankReviewSummary" component={TransferToBankReviewSummary} />
        <Stack.Screen name="TransferToBankSuccessful" component={TransferToBankSuccessful} />
        <Stack.Screen name="SendMoney" component={SendMoney} />
        <Stack.Screen name="SendMoneyTypeAmount" component={SendMoneyTypeAmount} />
        <Stack.Screen name="SendMoneyChoosePaymentType" component={SendMoneyChoosePaymentType} />
        <Stack.Screen name="SendMoneyReviewSummary" component={SendMoneyReviewSummary} />
        <Stack.Screen name="SendMoneySuccessful" component={SendMoneySuccessful} />
        <Stack.Screen name="ConfirmPayment" component={ConfirmPayment} />
        <Stack.Screen name="InOutPaymentHistory" component={InOutPaymentHistory} />
        <Stack.Screen name="InOutPaymentViewEReceipt" component={InOutPaymentViewEReceipt} />
        <Stack.Screen name="StatisticsVersion2" component={StatisticsVersion2} />
        <Stack.Screen name="StatisticsVersion3" component={StatisticsVersion3} />
        <Stack.Screen name="StatisticsVersion4" component={StatisticsVersion4} />
        <Stack.Screen name="UserAllPay" component={UserAllPay} />
        <Stack.Screen name="ECardDetails" component={ECardDetails} />
        <Stack.Screen name="ECardRefund" component={ECardRefund} />
        <Stack.Screen name="ECardTopup" component={ECardTopup} />
        <Stack.Screen name="Fingerprint" component={Fingerprint} />
        <Stack.Screen name="CreateNewPassword" component={CreateNewPassword} />
        <Stack.Screen name="Home" component={BottomTabNavigation}/>
        <Stack.Screen name="LoginOtp" component={LoginOtp} />
        <Stack.Screen name="SettingsPayment" component={SettingsPayment} />
        <Stack.Screen name="SelectTransferType" component={SelectTransferType} />
        <Stack.Screen name="MobileMoneyTransfer" component={MobileMoneyTransfer} />
        <Stack.Screen name="Topup" component={Topup} />
        <Stack.Screen name="TopupMobileMoney" component={TopupMobileMoney} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default AppNavigation