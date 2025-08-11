import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Modal, TouchableWithoutFeedback, FlatList, ImageSourcePropType } from 'react-native';
import React, { useMemo, useState } from 'react';
import { COLORS, SIZES, icons } from '../constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-virtualized-view';
import Barcode from '@kichiyaki/react-native-barcode-generator';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Clipboard from '@react-native-clipboard/clipboard';
import { useTheme } from '../theme/ThemeProvider';
import { NavigationProp, useNavigation } from '@react-navigation/native';

type TopupDetail = {
  id: string;
  amount: string;
  currency: string;
  status?: string;
  message?: string;
  payment_reference?: string;
  order_reference?: string;
  account_number?: string;
  metadata?: { channel?: string | null } | null;
  created_at?: string;
  customer_name?: string | null;
  customer_phone?: string | null;
};

type PayoutDetail = {
  id: string;
  amount: string;
  currency: string;
  fee?: string;
  total_amount?: string;
  status?: string;
  message?: string;
  payout_reference?: string;
  order_reference?: string;
  account_number?: string;
  channel_provider?: string | null;
  created_at?: string;
  beneficiary_name?: string | null;
  beneficiary_phone?: string | null;
  preview_data?: {
    receiver?: { accountName?: string; accountNumber?: string }
  } | null;
};

const InOutPaymentViewEreceipt = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const { colors, dark } = useTheme();
  const route = (navigation as any).getState?.().routes?.slice(-1)?.[0];
  const params = route?.params || {};
  const kind: 'Topup' | 'Payout' | undefined = params.kind;
  const item: TopupDetail | PayoutDetail | undefined = params.item;

  const isTopup = kind === 'Topup';
  const providerOrChannel = useMemo(() => {
    if (isTopup) {
      return (item as TopupDetail)?.metadata?.channel || undefined;
    }
    const p = (item as PayoutDetail)?.channel_provider || undefined;
    return p ? p.replace(/\s*TANZANIA\s*$/i, '').trim() : undefined;
  }, [isTopup, item]);

  const dropdownItems = [
    { label: 'Share E-Receipt', value: 'share', icon: icons.shareOutline },
    { label: 'Download E-Receipt', value: 'downloadEReceipt', icon: icons.download2 },
    { label: 'Print', value: 'print', icon: icons.documentOutline },
  ];

  const handleDropdownSelect = (item: any) => {
    setSelectedItem(item.value);
    setModalVisible(false);

    // Perform actions based on the selected item
    switch (item.value) {
      case 'share':
        // Handle Share action
        setModalVisible(false);
        navigation.navigate("Home")
        break;
      case 'downloadEReceipt':
        // Handle Download E-Receipt action
        setModalVisible(false);
        navigation.navigate("Home")
        break;
      case 'print':
        // Handle Print action
        setModalVisible(false)
        navigation.navigate("Home")
        break;
      default:
        break;
    }
  };

  /**
  * Render header
  */
  const renderHeader = () => {
    return (
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}>
            <Image
              source={icons.back as ImageSourcePropType}
              resizeMode='contain'
              style={[styles.backIcon, {
                tintColor: dark ? COLORS.white : COLORS.black
              }]} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, {
            color: dark ? COLORS.white : COLORS.black
          }]}>E-Receipt</Text>
        </View>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Image
            source={icons.moreCircle as ImageSourcePropType}
            resizeMode='contain'
            style={[styles.moreIcon, {
              tintColor: dark ? COLORS.secondaryWhite : COLORS.black
            }]}
          />
        </TouchableOpacity>
      </View>
    )
  }
  /**
   * Render content
   */
  const renderContent = () => {
    const transactionId = (isTopup ? (item as TopupDetail)?.payment_reference : (item as PayoutDetail)?.payout_reference) || '—';
    const amountText = `${formatMoney((item as any)?.amount)} ${(item as any)?.currency}`;
    const statusText = String((item as any)?.status || '—').toUpperCase();
    const { bg: statusBg, fg: statusFg, text: statusColor } = getStatusColors(statusText);

    const handleCopyToClipboard = () => {
      Clipboard.setString(transactionId);
      Alert.alert('Copied!', 'Transaction ID copied to clipboard.');
    };

    return (
      <View style={{ marginVertical: 22 }}>
        {/* Barcode card */}
        <View style={[styles.card, { backgroundColor: dark ? COLORS.dark2 : COLORS.white }]}> 
          <Barcode
            format="EAN13"
            value="0123456789012"
            text="0123456789012"
            width={SIZES.width - 64}
            height={72}
            style={{ marginBottom: 8, backgroundColor: 'transparent' }}
            lineColor={dark ? COLORS.white : COLORS.black}
            textStyle={{ color: dark ? COLORS.white : COLORS.black }}
            maxWidth={SIZES.width - 64}
          />
        </View>

        {/* Summary header card */}
        <View style={[styles.card, { backgroundColor: dark ? COLORS.dark2 : COLORS.white }]}> 
          <View style={styles.summaryHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
                {isTopup ? 'Topup' : 'Payout'} {providerOrChannel ? `• ${providerOrChannel}` : ''}
              </Text>
              <Text style={[styles.dateSmall, { color: dark ? COLORS.grayscale400 : COLORS.grayscale700 }]}>
                {formatDateTime((item as any)?.created_at) || '—'}
              </Text>
            </View>
            <View style={[styles.statusChip, { backgroundColor: statusBg, borderColor: statusFg }]}> 
              <Text style={[styles.statusChipText, { color: statusColor }]}>{statusText}</Text>
            </View>
          </View>
          <Text style={[styles.amountText, { color: isTopup ? COLORS.primary : COLORS.red }]}>{amountText}</Text>
          <Text style={[styles.subtleText, { color: dark ? COLORS.grayscale400 : COLORS.grayscale700 }]}>Account { (item as any)?.account_number || '—' }</Text>
        </View>

        {/* Parties and account card */}
        <View style={[styles.card, { backgroundColor: dark ? COLORS.dark2 : COLORS.white }]}> 
          <InfoRow label={isTopup ? 'Customer' : 'Beneficiary'} value={(isTopup ? (item as TopupDetail)?.customer_name : (item as PayoutDetail)?.beneficiary_name) || (isTopup ? undefined : (item as PayoutDetail)?.preview_data?.receiver?.accountName) || '—'} />
          <InfoRow label="Mobile" value={(isTopup ? (item as TopupDetail)?.customer_phone : (item as PayoutDetail)?.beneficiary_phone) || (!isTopup ? (item as PayoutDetail)?.preview_data?.receiver?.accountNumber : undefined) || '—'} />
          <View style={styles.divider} />
          <InfoRow label={isTopup ? 'Channel' : 'Provider'} value={providerOrChannel || '—'} />
        </View>

        {/* References card */}
        <View style={[styles.card, { backgroundColor: dark ? COLORS.dark2 : COLORS.white }]}> 
          <InfoRow label="Reference" value={(isTopup ? (item as TopupDetail)?.payment_reference : (item as PayoutDetail)?.payout_reference) || '—'} />
          <InfoRow label="Order Ref" value={(isTopup ? (item as TopupDetail)?.order_reference : (item as PayoutDetail)?.order_reference) || '—'} />
          <View style={styles.divider} />
          <View style={styles.viewContainer}>
            <Text style={[styles.viewLeft, { color: dark ? COLORS.grayscale400 : 'gray' }]}>Transaction ID</Text>
            <View style={styles.copyContentContainer}>
              <Text style={styles.viewRight}>{transactionId}</Text>
              <TouchableOpacity style={{ marginLeft: 8 }} onPress={handleCopyToClipboard}>
                <MaterialCommunityIcons name="content-copy" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Payment card */}
        <View style={[styles.card, { backgroundColor: dark ? COLORS.dark2 : COLORS.white }]}> 
          <InfoRow label={isTopup ? 'Collected' : 'Total'} value={`${formatMoney((item as any)?.total_amount || (item as any)?.collected_amount || (item as any)?.amount)} ${ (item as any)?.currency || (item as any)?.collected_currency || '' }`} />
          <InfoRow label={isTopup ? 'Method' : 'Fee'} value={isTopup ? ((item as TopupDetail)?.payment_method || '—') : `${formatMoney((item as PayoutDetail)?.fee || 0)} ${(item as PayoutDetail)?.currency || ''}`} />
          <InfoRow label="Message" value={(item as any)?.message || '—'} />
        </View>
      </View>
    )
  }
  return (
    <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}
        <ScrollView
          style={[styles.scrollView, { backgroundColor: dark ? COLORS.dark1 : COLORS.tertiaryWhite }]}
          showsVerticalScrollIndicator={false}>
          {renderContent()}
        </ScrollView>
      </View>
      {/* Modal for dropdown selection */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={{ position: "absolute", top: 112, right: 12 }}>
            <View style={{
              width: 202,
              padding: 16,
              backgroundColor: dark ? COLORS.dark2 : COLORS.tertiaryWhite,
              borderRadius: 8
            }}>
              <FlatList
                data={dropdownItems}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: 'center',
                      marginVertical: 12
                    }}
                    onPress={() => handleDropdownSelect(item)}>
                    <Image
                      source={item.icon as ImageSourcePropType}
                      resizeMode='contain'
                      style={{
                        width: 20,
                        height: 20,
                        marginRight: 16,
                        tintColor: dark ? COLORS.white : COLORS.black
                      }}
                    />
                    <Text style={{
                      fontSize: 14,
                      fontFamily: "Urbanist SemiBold",
                      color: dark ? COLORS.white : COLORS.black
                    }}>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
    padding: 16
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 16
  },
  scrollView: {
    backgroundColor: COLORS.tertiaryWhite
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center"
  },
  backIcon: {
    height: 24,
    width: 24,
    tintColor: COLORS.black,
    marginRight: 16
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Urbanist Bold",
    color: COLORS.black
  },
  moreIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.black
  },
  card: {
    width: SIZES.width - 32,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    alignSelf: 'center'
  },
  viewContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginVertical: 12
  },
  viewLeft: {
    fontSize: 12,
    fontFamily: "Urbanist Regular",
    color: "gray"
  },
  viewRight: {
    fontSize: 14,
    fontFamily: "Urbanist Medium",
    color: COLORS.black
  },
  copyContentContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  statusBtn: {
    width: 72,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.tansparentPrimary,
    borderRadius: 6
  },
  statusBtnText: {
    fontSize: 12,
    fontFamily: "Urbanist Medium",
    color: COLORS.primary
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  cardTitle: {
    fontFamily: 'Urbanist Bold',
    fontSize: 16,
    marginBottom: 4
  },
  dateSmall: {
    fontFamily: 'Urbanist Regular',
    fontSize: 12
  },
  statusChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statusChipText: {
    fontFamily: 'Urbanist Bold',
    fontSize: 12
  },
  amountText: {
    fontFamily: 'Urbanist Bold',
    fontSize: 24,
    marginTop: 8
  },
  subtleText: {
    fontFamily: 'Urbanist Regular',
    fontSize: 12,
    marginTop: 6
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: COLORS.grayscale100,
    marginVertical: 8
  }
})

export default InOutPaymentViewEreceipt

function formatMoney(value: any): string {
  if (value === null || value === undefined) return '0';
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  if (Number.isNaN(num)) return String(value);
  return new Intl.NumberFormat(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(num);
}

function formatDateTime(iso?: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const date = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
    const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    return `${date} | ${time}`;
  } catch { return ''; }
}

function getStatusColors(status?: string) {
  const s = String(status || '').toUpperCase();
  if (s === 'SUCCESS' || s === 'COMPLETED') {
    return { bg: 'rgba(10, 190, 117, 0.12)', fg: COLORS.success, text: COLORS.success };
  }
  if (s === 'PENDING' || s === 'PROCESSING' || s === 'AUTHORIZED') {
    return { bg: 'rgba(250, 204, 21, 0.12)', fg: COLORS.warning, text: COLORS.warning };
  }
  if (s.includes('FAIL') || s === 'FAILED' || s === 'CANCELLED' || s === 'ERROR') {
    return { bg: 'rgba(247, 85, 85, 0.12)', fg: COLORS.error, text: COLORS.error };
  }
  return { bg: COLORS.tansparentPrimary, fg: COLORS.primary, text: COLORS.primary };
}

// Reusable label/value row
const InfoRow: React.FC<{ label: string; value?: any }> = ({ label, value }) => {
  const { dark } = useTheme();
  return (
    <View style={styles.viewContainer}>
      <Text style={[styles.viewLeft, { color: dark ? COLORS.grayscale400 : 'gray' }]}>{label}</Text>
      {typeof value === 'string' || typeof value === 'number' ? (
        <Text style={[styles.viewRight, { color: dark ? COLORS.white : COLORS.black }]} numberOfLines={2}>{String(value)}</Text>
      ) : (
        value || <Text style={[styles.viewRight, { color: dark ? COLORS.white : COLORS.black }]}>—</Text>
      )}
    </View>
  );
};