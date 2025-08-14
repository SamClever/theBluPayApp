import { View, Text, StyleSheet, TouchableOpacity, Image, ImageSourcePropType, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-virtualized-view';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { COLORS, SIZES, icons } from '../constants';
import { InOutPaymentRequested } from '../tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InOutPaymentHistoryCard from '../components/InOutPaymentHistoryCard';

type Tab = 'All' | 'Topup' | 'Payouts';

const InOutPaymentHistory = () => {
  const { colors, dark } = useTheme();
  const navigation = useNavigation<NavigationProp<any>>();
  const [selectedTab, setSelectedTab] = useState<Tab>('All');

  const renderContent = () => {
    switch (selectedTab) {
      case 'All':
        return <AllTransactionsContent />;
      case 'Topup':
        return <HistoryContent initialKind="Topups" showSegment={false} />;
      case 'Payouts':
        return <HistoryContent initialKind="Payouts" showSegment={false} />;
      default:
        return null;
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
              style={[styles.headerLogo, { 
                tintColor: dark? COLORS.white : COLORS.greyscale900
              }]}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, {
            color: dark ? COLORS.white : COLORS.greyscale900
          }]}>In & Out Payment</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity>
            <Image
              source={icons.moreCircle as ImageSourcePropType}
              resizeMode='contain'
              style={[styles.searchIcon, {
                tintColor: dark ? COLORS.secondaryWhite : COLORS.greyscale900
              }]}
            />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.viewContainer}>
            <View style={[styles.tabContainer, { 
              backgroundColor: dark ? COLORS.dark1 : COLORS.white }]}>
              {['All', 'Topup', 'Payouts'].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setSelectedTab(tab as Tab)}
                  style={[
                    styles.tabButton,
                    selectedTab === tab && styles.activeTabButton,
                  ]}>
                  <Text style={[
                    styles.tabButtonText,
                    selectedTab === tab && styles.activeTabButtonText,
                  ]}>{tab}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.contentContainer}>
              {renderContent()}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
};

// ===== All Transactions Content =====
// Fetches and combines data from both topup and payout APIs to show ALL transaction types
const AllTransactionsContent: React.FC = () => {
  const { dark } = useTheme();
  const navigation = useNavigation<NavigationProp<any>>();
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [allTransactions, setAllTransactions] = useState<AllTransactionItem[]>([]);
  const [stats, setStats] = useState<any>(null);

  const fetchAllTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      // Fetch from both topup and payout APIs to get ALL transactions
      const [topupResp, payoutResp] = await Promise.all([
        fetch('https://theblupayapi.com/topup/history/', {
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        }),
        fetch('https://theblupayapi.com/payout/history/', {
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!topupResp.ok) {
        const t = await topupResp.text().catch(() => '');
        throw new Error(`Topup history failed (${topupResp.status}) ${t}`);
      }
      if (!payoutResp.ok) {
        const t = await payoutResp.text().catch(() => '');
        throw new Error(`Payout history failed (${payoutResp.status}) ${t}`);
      }

      const topupJson: HistoryApiResponse<AllTransactionItem> = await topupResp.json();
      const payoutJson: HistoryApiResponse<PayoutItem> = await payoutResp.json();

      // Convert payouts to AllTransactionItem format and combine with topups
      const topupTransactions = Array.isArray(topupJson?.results) ? topupJson.results : [];
      const payoutTransactions = Array.isArray(payoutJson?.results) ? payoutJson.results.map((payout): AllTransactionItem => ({
        id: payout.id,
        payment_reference: payout.payout_reference,
        transaction_type: 'WITHDRAWAL', // Mark payouts as withdrawals
        amount: payout.amount,
        currency: payout.currency,
        status: payout.status,
        created_at: payout.created_at,
        metadata: { channel: payout.channel_provider },
        account_number: payout.account_number || undefined,
        customer_name: payout.preview_data?.receiver?.accountName || null,
      })) : [];

      // Combine and sort by created_at (newest first)
      const allTransactions = [...topupTransactions, ...payoutTransactions].sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA; // Newest first
      });

      setAllTransactions(allTransactions);
      
      // Calculate combined statistics
      const combinedStats: any = {
        total_amount: (topupJson?.statistics?.total_amount || 0) + (payoutJson?.statistics?.total_amount || 0),
        total_transactions: (topupJson?.statistics?.total_transactions || 0) + (payoutJson?.statistics?.total_transactions || 0),
        successful_transactions: (topupJson?.statistics?.successful_transactions || 0) + (payoutJson?.statistics?.successful_transactions || 0),
        currency: 'TZS'
      };
      
      if (combinedStats.total_transactions > 0) {
        combinedStats.success_rate = (combinedStats.successful_transactions / combinedStats.total_transactions) * 100;
      }
      
      setStats(combinedStats);
    } catch (e: any) {
      setError(e?.message || 'Failed to load all transactions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllTransactions();
  }, [fetchAllTransactions]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAllTransactions();
  }, [fetchAllTransactions]);

  const renderHeader = useMemo(() => {
    return (
      <View style={[styles.historyHeaderRow, { backgroundColor: dark ? COLORS.dark2 : COLORS.white }]}>
        <View />
        {stats ? (
          <View style={[styles.statsCard, { backgroundColor: dark ? COLORS.dark3 : COLORS.tansparentPrimary }]}>
            <Text style={styles.statsText}>Total: {formatMoney(stats.total_amount)} {stats?.currency || 'TZS'}</Text>
            {'success_rate' in stats && (
              <Text style={styles.statsSubText}>Success rate: {Number(stats.success_rate || 0).toFixed(0)}%</Text>
            )}
          </View>
        ) : null}
      </View>
    );
  }, [stats, dark]);

  if (loading && !refreshing) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: dark ? COLORS.dark1 : COLORS.secondaryWhite }]}> 
        {renderHeader}
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: dark ? COLORS.dark1 : COLORS.secondaryWhite }]}> 
        {renderHeader}
        <Text style={[styles.errorText, { color: dark ? COLORS.greyscale300 : COLORS.error }]}>{error}</Text>
        <TouchableOpacity onPress={fetchAllTransactions} style={[styles.retryBtn, { backgroundColor: COLORS.primary }]}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, width: '100%' }}>
      {renderHeader}
      <FlatList
        data={allTransactions}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: dark ? COLORS.greyscale300 : COLORS.greyscale900 }]}>No transactions yet</Text>
            <Text style={[styles.emptySubtitle, { color: dark ? COLORS.grayscale400 : COLORS.grayscale700 }]}>Your recent transactions will appear here</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const isDeposit = item.transaction_type === 'DEPOSIT';
          const isWithdrawal = item.transaction_type === 'WITHDRAWAL';
          const isTransfer = item.transaction_type === 'TRANSFER';
          
          let displayName = '';
          let iconSource = icons.download3 as ImageSourcePropType;
          let pricePrefix = '+';
          let transactionType = 'Income';
          
          if (isDeposit) {
            displayName = `Deposit ${item?.metadata?.channel ? `• ${item.metadata.channel}` : ''}`.trim();
            iconSource = icons.download3 as ImageSourcePropType;
            pricePrefix = '+';
            transactionType = 'Income';
          } else if (isWithdrawal) {
            const provider = cleanProviderName(item?.metadata?.channel || undefined);
            displayName = `Withdrawal ${provider ? `• ${provider}` : ''}`.trim();
            iconSource = icons.upload as ImageSourcePropType;
            pricePrefix = '-';
            transactionType = 'Expense';
          } else if (isTransfer) {
            displayName = `Transfer ${item?.metadata?.channel ? `• ${item.metadata.channel}` : ''}`.trim();
            iconSource = icons.arrowUpSquare as ImageSourcePropType;
            pricePrefix = '-';
            transactionType = 'Expense';
          } else {
            // Default fallback for other transaction types
            displayName = `${item.transaction_type} ${item?.metadata?.channel ? `• ${item.metadata.channel}` : ''}`.trim();
            iconSource = icons.download3 as ImageSourcePropType;
            pricePrefix = '+';
            transactionType = 'Income';
          }
          
          return (
            <InOutPaymentHistoryCard
              name={displayName}
              image={iconSource}
              date={formatDate(item?.created_at)}
              time={formatTime(item?.created_at)}
              price={`${pricePrefix} ${formatMoney(item.amount)} ${item.currency}`}
              type={transactionType}
              status={normalizeStatus(item.status)}
              onPress={() => navigation.navigate('InOutPaymentViewEReceipt', { kind: 'All', item })}
            />
          );
        }}
        contentContainerStyle={{ paddingVertical: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      />
    </View>
  );
};

// ===== History Content (Topups or Payouts) =====
type TopupItem = {
  id: string;
  amount: string; // e.g. "1000.00"
  currency: string; // e.g. "TZS"
  status: string; // SUCCESS | PROCESSING | ...
  payment_method?: string;
  metadata?: { channel?: string | null } | null;
  created_at?: string;
  payment_reference?: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  account_number?: string | null;
};

type PayoutItem = {
  id: string;
  amount: string;
  currency: string;
  fee?: string;
  total_amount?: string;
  status: string; // SUCCESS | PENDING | ...
  channel_provider?: string | null;
  created_at?: string;
  payout_reference?: string;
  account_number?: string | null;
  preview_data?: {
    receiver?: {
      accountName?: string;
      accountNumber?: string;
    };
  } | null;
};

type AllTransactionItem = {
  id: string;
  payment_reference?: string;
  order_reference?: string;
  account_number?: string;
  user_email?: string;
  transaction_type: string; // DEPOSIT | WITHDRAWAL | etc.
  payment_method?: string;
  mobile_provider?: string | null;
  amount: string;
  currency: string;
  collected_amount?: string;
  collected_currency?: string;
  status: string;
  message?: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string;
  metadata?: { channel?: string | null } | null;
  created_at?: string;
  updated_at?: string;
};

type HistoryApiResponse<T> = {
  count: number;
  page: number;
  page_size: number;
  results: T[];
  statistics?: any;
};

type HistoryKind = 'Topups' | 'Payouts';

type HistoryContentProps = {
  initialKind?: HistoryKind;
  showSegment?: boolean;
};

const HistoryContent: React.FC<HistoryContentProps> = ({ initialKind = 'Topups', showSegment = true }) => {
  const { dark } = useTheme();
  const navigation = useNavigation<NavigationProp<any>>();
  const [kind, setKind] = useState<HistoryKind>(initialKind);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [topups, setTopups] = useState<TopupItem[]>([]);
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [topupStats, setTopupStats] = useState<any>(null);
  const [payoutStats, setPayoutStats] = useState<any>(null);

  const fetchHistories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }
      const [topupResp, payoutResp] = await Promise.all([
        fetch('https://theblupayapi.com/topup/history/', {
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        }),
        fetch('https://theblupayapi.com/payout/history/', {
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!topupResp.ok) {
        const t = await topupResp.text().catch(() => '');
        throw new Error(`Topup history failed (${topupResp.status}) ${t}`);
      }
      if (!payoutResp.ok) {
        const t = await payoutResp.text().catch(() => '');
        throw new Error(`Payout history failed (${payoutResp.status}) ${t}`);
      }

      const topupJson: HistoryApiResponse<TopupItem> = await topupResp.json();
      const payoutJson: HistoryApiResponse<PayoutItem> = await payoutResp.json();

      setTopups(Array.isArray(topupJson?.results) ? topupJson.results : []);
      setPayouts(Array.isArray(payoutJson?.results) ? payoutJson.results : []);
      setTopupStats(topupJson?.statistics ?? null);
      setPayoutStats(payoutJson?.statistics ?? null);
    } catch (e: any) {
      setError(e?.message || 'Failed to load history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistories();
  }, [fetchHistories]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHistories();
  }, [fetchHistories]);

  const data = kind === 'Topups' ? topups : payouts;
  const stats = kind === 'Topups' ? topupStats : payoutStats;

  const renderHeader = useMemo(() => {
    return (
      <View style={[styles.historyHeaderRow, { backgroundColor: dark ? COLORS.dark2 : COLORS.white }]}>
        {showSegment ? (
          <View style={[styles.segment, { backgroundColor: dark ? COLORS.dark3 : COLORS.grayscale100 }]}>
            {(['Topups', 'Payouts'] as HistoryKind[]).map((k) => (
              <TouchableOpacity
                key={k}
                onPress={() => setKind(k)}
                style={[styles.segmentPill, kind === k && { backgroundColor: COLORS.primary }]}
              >
                <Text style={[styles.segmentText, { color: kind === k ? COLORS.white : COLORS.greyscale900 }]}> {k} </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : <View />}
        {stats ? (
          <View style={[styles.statsCard, { backgroundColor: dark ? COLORS.dark3 : COLORS.tansparentPrimary }]}>
            <Text style={styles.statsText}>Total: {formatMoney(stats.total_amount)} {stats?.currency || ''}</Text>
            {'success_rate' in stats && (
              <Text style={styles.statsSubText}>Success rate: {Number(stats.success_rate || 0).toFixed(0)}%</Text>
            )}
          </View>
        ) : null}
      </View>
    );
  }, [kind, stats, dark, showSegment]);

  if (loading && !refreshing) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: dark ? COLORS.dark1 : COLORS.secondaryWhite }]}> 
        {renderHeader}
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: dark ? COLORS.dark1 : COLORS.secondaryWhite }]}> 
        {renderHeader}
        <Text style={[styles.errorText, { color: dark ? COLORS.greyscale300 : COLORS.error }]}>{error}</Text>
        <TouchableOpacity onPress={fetchHistories} style={[styles.retryBtn, { backgroundColor: COLORS.primary }]}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, width: '100%' }}>
      {renderHeader}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: dark ? COLORS.greyscale300 : COLORS.greyscale900 }]}>No {kind.toLowerCase()} yet</Text>
            <Text style={[styles.emptySubtitle, { color: dark ? COLORS.grayscale400 : COLORS.grayscale700 }]}>Your recent {kind.toLowerCase()} will appear here</Text>
          </View>
        )}
        renderItem={({ item }) => {
          if (kind === 'Topups') {
            const t = item as TopupItem;
            return (
              <InOutPaymentHistoryCard
                name={`Topup ${t?.metadata?.channel ? `• ${t.metadata.channel}` : ''}`.trim()}
                image={icons.download3 as ImageSourcePropType}
                date={formatDate(t?.created_at)}
                time={formatTime(t?.created_at)}
                price={`+ ${formatMoney(t.amount)} ${t.currency}`}
                type={'Income'}
                status={normalizeStatus(t.status)}
                onPress={() => navigation.navigate('InOutPaymentViewEReceipt', { kind: 'Topup', item: t })}
              />
            );
          }
          const p = item as PayoutItem;
          const provider = cleanProviderName(p?.channel_provider || undefined);
          return (
            <InOutPaymentHistoryCard
              name={`Payout ${provider ? `• ${provider}` : ''}`.trim()}
              image={icons.upload as ImageSourcePropType}
              date={formatDate(p?.created_at)}
              time={formatTime(p?.created_at)}
              price={`- ${formatMoney(p.amount)} ${p.currency}`}
              type={'Expense'}
              status={normalizeStatus(p.status)}
              onPress={() => navigation.navigate('InOutPaymentViewEReceipt', { kind: 'Payout', item: p })}
            />
          );
        }}
        contentContainerStyle={{ paddingVertical: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      />
    </View>
  );
};

function formatMoney(value: any): string {
  if (value === null || value === undefined) return '0';
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  if (Number.isNaN(num)) return String(value);
  return new Intl.NumberFormat(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(num);
}

function formatDate(iso?: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
  } catch { return ''; }
}

function formatTime(iso?: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

function normalizeStatus(status?: string): string | undefined {
  if (!status) return undefined;
  const s = String(status).toUpperCase();
  if (s === 'PROCESSING') return 'PROCESSING';
  if (s === 'AUTHORIZED') return 'AUTHORIZED';
  if (s === 'SUCCESS' || s === 'COMPLETED' || s === 'success') return 'SUCCESS';
  if (s === 'PENDING') return 'PENDING';
  if (s.includes('FAIL') || s === 'CANCELLED' || s === 'ERROR') return 'FAILED';
  return s;
}

function cleanProviderName(name?: string): string | undefined {
  if (!name) return undefined;
  // Remove trailing " TANZANIA" if present and trim
  return name.replace(/\s*TANZANIA\s*$/i, '').trim();
}

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
    width: SIZES.width - 32,
    justifyContent: "space-between",
    marginBottom: 12
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center"
  },
  headerLogo: {
    height: 24,
    width: 24,
    tintColor: COLORS.greyscale900
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Urbanist Bold",
    color: COLORS.black,
    marginLeft: 12
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center"
  },
  searchIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.black
  },
  moreCircleIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.black,
    marginLeft: 12
  },
  viewContainer: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.primary,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: COLORS.primary,
  },
  tabButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontFamily: "Urbanist Bold"
  },
  activeTabButtonText: {
    color: COLORS.white,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'stretch',
  },
  contentText: {
    fontSize: 18,
    color: COLORS.black,
  },
  // History content styles
  segment: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 999,
  },
  segmentPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    marginHorizontal: 4,
  },
  segmentText: {
    fontFamily: 'Urbanist Bold',
    fontSize: 14,
  },
  historyHeaderRow: {
    width: SIZES.width - 32,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  statsCard: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  statsText: {
    fontFamily: 'Urbanist Bold',
    fontSize: 12,
    color: COLORS.greyscale900,
  },
  statsSubText: {
    fontFamily: 'Urbanist Regular',
    fontSize: 11,
    color: COLORS.grayscale700,
    marginTop: 2,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  errorText: {
    fontFamily: 'Urbanist Regular',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  retryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 22,
  },
  retryBtnText: {
    color: COLORS.white,
    fontFamily: 'Urbanist Bold',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 36,
  },
  emptyTitle: {
    fontFamily: 'Urbanist Bold',
    fontSize: 16,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: 'Urbanist Regular',
    fontSize: 12,
  },
})

export default InOutPaymentHistory