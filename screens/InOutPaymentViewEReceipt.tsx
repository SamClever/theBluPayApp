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

    const handleCopyToClipboard = () => {
      Clipboard.setString(transactionId);
      Alert.alert('Copied!', 'Transaction ID copied to clipboard.');
    };

    return (
      <View style={{ marginVertical: 22 }}>
        <Barcode
          format="EAN13"
          value="0123456789012"
          text="0123456789012"
          width={SIZES.width - 64}
          height={72}
          style={{
            marginBottom: 4,
            backgroundColor: dark ? COLORS.dark1 : COLORS.white,
          }}
          lineColor={dark ? COLORS.white : COLORS.black}
          textStyle={{
            color: dark ? COLORS.white : COLORS.black
          }}
          maxWidth={SIZES.width - 64}
        />
          <View style={[styles.summaryContainer, {
          backgroundColor: dark ? COLORS.dark2 : COLORS.white,
          borderRadius: 6,
        }]}>
          <View style={styles.viewContainer}>
            <Text style={[styles.viewLeft, { color: dark ? COLORS.grayscale400 : "gray" }]}>Amount</Text>
            <Text style={[styles.viewRight, { color: dark ? COLORS.white : COLORS.black }]}>
              {formatMoney((item as any)?.amount)} {(item as any)?.currency}
            </Text>
          </View>
          <View style={styles.viewContainer}>
            <Text style={[styles.viewLeft, { color: dark ? COLORS.grayscale400 : "gray" }]}>{isTopup ? 'Channel' : 'Provider'}</Text>
            <Text style={[styles.viewRight, { color: dark ? COLORS.white : COLORS.black }]}>{providerOrChannel || '—'}</Text>
          </View>
          <View style={styles.viewContainer}>
            <Text style={[styles.viewLeft, { color: dark ? COLORS.grayscale400 : "gray" }]}>Account</Text>
            <Text style={[styles.viewRight, { color: dark ? COLORS.white : COLORS.black }]}>{(item as any)?.account_number || '—'}</Text>
          </View>
          <View style={styles.viewContainer}>
            <Text style={[styles.viewLeft, { color: dark ? COLORS.grayscale400 : "gray" }]}>Date</Text>
            <Text style={[styles.viewRight, { color: dark ? COLORS.white : COLORS.black }]}>{formatDateTime((item as any)?.created_at) || '—'}</Text>
          </View>
          {isTopup ? (
            <>
              <View style={styles.viewContainer}>
                <Text style={[styles.viewLeft, { color: dark ? COLORS.grayscale400 : "gray" }]}>Customer</Text>
                <Text style={[styles.viewRight, { color: dark ? COLORS.white : COLORS.black }]}>
                  {(item as TopupDetail)?.customer_name || '—'}
                </Text>
              </View>
              <View style={styles.viewContainer}>
                <Text style={[styles.viewLeft, { color: dark ? COLORS.grayscale400 : "gray" }]}>Mobile</Text>
                <Text style={[styles.viewRight, { color: dark ? COLORS.white : COLORS.black }]}>
                  {(item as TopupDetail)?.customer_phone || '—'}
                </Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.viewContainer}>
                <Text style={[styles.viewLeft, { color: dark ? COLORS.grayscale400 : "gray" }]}>Beneficiary</Text>
                <Text style={[styles.viewRight, { color: dark ? COLORS.white : COLORS.black }]}>
                  {(item as PayoutDetail)?.beneficiary_name || (item as PayoutDetail)?.preview_data?.receiver?.accountName || '—'}
                </Text>
              </View>
              <View style={styles.viewContainer}>
                <Text style={[styles.viewLeft, { color: dark ? COLORS.grayscale400 : "gray" }]}>Mobile</Text>
                <Text style={[styles.viewRight, { color: dark ? COLORS.white : COLORS.black }]}>
                  {(item as PayoutDetail)?.beneficiary_phone || (item as PayoutDetail)?.preview_data?.receiver?.accountNumber || '—'}
                </Text>
              </View>
            </>
          )}
        </View>

        <View style={[styles.summaryContainer, {
          backgroundColor: dark ? COLORS.dark2 : COLORS.white,
          borderRadius: 6,
        }]}>
          <View style={styles.viewContainer}>
            <Text style={[styles.viewLeft, { color: dark ? COLORS.grayscale400 : "gray" }]}>Reference</Text>
            <Text style={[styles.viewRight, { color: dark ? COLORS.white : COLORS.black }]}>
              {isTopup ? (item as TopupDetail)?.payment_reference : (item as PayoutDetail)?.payout_reference || '—'}
            </Text>
          </View>
          <View style={styles.viewContainer}>
            <Text style={[styles.viewLeft, { color: dark ? COLORS.grayscale400 : "gray" }]}>Order Ref</Text>
            <Text style={[styles.viewRight, { color: dark ? COLORS.white : COLORS.black }]}>
              {isTopup ? (item as TopupDetail)?.order_reference : (item as PayoutDetail)?.order_reference || '—'}
            </Text>
          </View>
          <View style={styles.viewContainer}>
            <Text style={[styles.viewLeft, { color: dark ? COLORS.grayscale400 : "gray" }]}>Status</Text>
            <TouchableOpacity style={styles.statusBtn}>
              <Text style={styles.statusBtnText}>{(item as any)?.status || '—'}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={[styles.summaryContainer, {
          backgroundColor: dark ? COLORS.dark2 : COLORS.white,
          borderRadius: 6,
        }]}>
          <View style={styles.viewContainer}>
            <Text style={[styles.viewLeft, { color: dark ? COLORS.grayscale400 : "gray" }]}>{isTopup ? 'Collected' : 'Total'}</Text>
            <Text style={[styles.viewRight, { color: dark ? COLORS.white : COLORS.black }]}>
              {formatMoney((item as any)?.total_amount || (item as any)?.collected_amount || (item as any)?.amount)} {(item as any)?.currency || (item as any)?.collected_currency || ''}
            </Text>
          </View>
          <View style={styles.viewContainer}>
            <Text style={[styles.viewLeft, { color: dark ? COLORS.grayscale400 : "gray" }]}>{isTopup ? 'Method' : 'Fee'}</Text>
            <Text style={[styles.viewRight, { color: dark ? COLORS.white : COLORS.black }]}>
              {isTopup ? ((item as TopupDetail)?.payment_method || '—') : `${formatMoney((item as PayoutDetail)?.fee || 0)} ${(item as PayoutDetail)?.currency || ''}`}
            </Text>
          </View>
          <View style={styles.viewContainer}>
            <Text style={[styles.viewLeft, { color: dark ? COLORS.grayscale400 : "gray" }]}>Message</Text>
            <Text style={[styles.viewRight, { color: dark ? COLORS.white : COLORS.black }]} numberOfLines={2}>
              {(item as any)?.message || '—'}
            </Text>
          </View>
          <View style={styles.viewContainer}>
            <Text style={[styles.viewLeft, {
              color: dark ? COLORS.grayscale400 : "gray"
            }]}>Transaction ID</Text>
            <View style={styles.copyContentContainer}>
              <Text style={styles.viewRight}>{transactionId}</Text>
              <TouchableOpacity style={{ marginLeft: 8 }} onPress={handleCopyToClipboard}>
                <MaterialCommunityIcons name="content-copy" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
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
  summaryContainer: {
    width: SIZES.width - 32,
    backgroundColor: COLORS.white,
    alignItems: "center",
    padding: 16,
    marginVertical: 8
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