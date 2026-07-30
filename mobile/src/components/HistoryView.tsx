import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { PiggyBank, TrendingUp, Calendar, Store, ChevronRight, Copy } from 'lucide-react-native';
import { ShoppingSession } from '../types';
import { formatBRL } from '../utils/calculator';

interface HistoryViewProps {
  sessions: ShoppingSession[];
  onStartNewShopping: () => void;
  onCloneSession?: (session: ShoppingSession) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  sessions,
  onStartNewShopping,
  onCloneSession,
}) => {
  const totalSpentAllTime = sessions.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalSavedAllTime = sessions.reduce((sum, s) => sum + s.totalSavings, 0);

  // Radar inflacionário de itens frequentes
  const inflationItems = [
    { name: 'Café Orfeu 250g', oldPrice: 21.90, newPrice: 24.90, percent: 13.6 },
    { name: 'Arroz Tio João 5kg', oldPrice: 25.50, newPrice: 28.00, percent: 9.8 },
    { name: 'Detergente Ypê 500ml', oldPrice: 1.99, newPrice: 2.15, percent: 8.0 },
    { name: 'Feijão Camil 1kg', oldPrice: 8.50, newPrice: 7.80, percent: -8.2 },
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Context Header */}
      <View style={styles.header}>
        <Text style={styles.sublabel}>HISTÓRICO & RADAR INFLACIONÁRIO</Text>
        <Text style={styles.title}>Minhas Compras</Text>
        <Text style={styles.description}>
          Acompanhe seu histórico de gastos nos supermercados e proteja seu bolso contra variações de preços.
        </Text>
      </View>

      {/* Savings Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryLeft}>
          <View style={styles.piggyBg}>
            <PiggyBank size={24} color="#f59e0b" />
          </View>
          <View>
            <Text style={styles.summaryLabel}>Economia Acumulada</Text>
            <Text style={styles.summaryValue}>{formatBRL(totalSavedAllTime)}</Text>
          </View>
        </View>
        <View style={styles.summaryRight}>
          <Text style={styles.summaryRightLabel}>Total Gasto</Text>
          <Text style={styles.summaryRightValue}>{formatBRL(totalSpentAllTime)}</Text>
        </View>
      </View>

      {/* Inflation Radar Section */}
      <View style={styles.radarCard}>
        <View style={styles.radarHeader}>
          <View style={styles.radarTitleContainer}>
            <TrendingUp size={16} color="#d97706" />
            <Text style={styles.radarTitle}>Radar de Inflação (Itens)</Text>
          </View>
          <View style={styles.timeBadge}>
            <Text style={styles.timeBadgeText}>30 dias</Text>
          </View>
        </View>

        <View style={styles.radarList}>
          {inflationItems.map((item, idx) => (
            <View
              key={idx}
              style={[
                styles.radarItem,
                idx === inflationItems.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <View>
                <Text style={styles.radarItemName}>{item.name}</Text>
                <Text style={styles.radarItemPrices}>
                  {formatBRL(item.oldPrice)} →{' '}
                  <Text style={styles.boldText}>{formatBRL(item.newPrice)}</Text>
                </Text>
              </View>
              <View
                style={[
                  styles.percentBadge,
                  item.percent > 0 ? styles.percentBadgeUp : styles.percentBadgeDown,
                ]}
              >
                <Text
                  style={[
                    styles.percentText,
                    item.percent > 0 ? styles.percentTextUp : styles.percentTextDown,
                  ]}
                >
                  {item.percent > 0 ? `+${item.percent}%` : `${item.percent}%`}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* History List */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>
          Histórico de Compras ({sessions.length})
        </Text>

        {sessions.length === 0 ? (
          <View style={styles.noSessionsCard}>
            <Text style={styles.noSessionsText}>Nenhuma compra finalizada ainda.</Text>
            <TouchableOpacity onPress={onStartNewShopping} style={styles.startBtn}>
              <Text style={styles.startBtnText}>Iniciar Primeira Compra</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.sessionsList}>
            {sessions.map((session) => (
              <View key={session.id} style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <View style={styles.sessionLeft}>
                    <View style={styles.sessionStoreRow}>
                      <Store size={14} color="#006e28" style={styles.storeIcon} />
                      <Text style={styles.sessionStoreName}>
                        {session.listName ? `${session.listName} - ` : ''}
                        {session.storeName}
                      </Text>
                    </View>
                    <View style={styles.sessionInfoRow}>
                      <Calendar size={12} color="#6d7b6b" />
                      <Text style={styles.sessionInfoText}>{session.date}</Text>
                      <Text style={styles.sessionBullet}>•</Text>
                      <Text style={styles.sessionInfoText}>{session.itemsCount} itens</Text>
                    </View>
                  </View>

                  <View style={styles.sessionRight}>
                    <View style={styles.amountContainer}>
                      <Text style={styles.sessionAmount}>{formatBRL(session.totalAmount)}</Text>
                      <Text style={styles.sessionSavings}>
                        Poupou {formatBRL(session.totalSavings)}
                      </Text>
                    </View>
                    <ChevronRight size={16} color="#6d7b6b" />
                  </View>
                </View>

                {onCloneSession && (
                  <View style={styles.sessionFooter}>
                    <TouchableOpacity
                      onPress={() => onCloneSession(session)}
                      style={styles.cloneBtn}
                      activeOpacity={0.7}
                    >
                      <Copy size={11} color="#006e28" />
                      <Text style={styles.cloneBtnText}>Montar nova a partir desta</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120, // Leave room for nav bar
    gap: 16,
  },
  header: {
    gap: 4,
  },
  sublabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6d7b6b',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1b1f',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 13,
    color: '#6d7b6b',
    lineHeight: 18,
  },
  summaryCard: {
    backgroundColor: '#006e28',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#006e28',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  piggyBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  summaryRight: {
    alignItems: 'flex-end',
  },
  summaryRightLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  summaryRightValue: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  radarCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e3e2e7',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  radarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  radarTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  radarTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1a1b1f',
    letterSpacing: -0.3,
  },
  timeBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  timeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#92400e',
  },
  radarList: {
    marginTop: 4,
  },
  radarItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f3f8',
  },
  radarItemName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1a1b1f',
  },
  radarItemPrices: {
    fontSize: 11,
    color: '#6d7b6b',
    marginTop: 2,
  },
  boldText: {
    fontWeight: '700',
    color: '#1a1b1f',
  },
  percentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  percentBadgeUp: {
    backgroundColor: '#ffebe9',
  },
  percentBadgeDown: {
    backgroundColor: '#e6f4ea',
  },
  percentText: {
    fontSize: 11,
    fontWeight: '700',
  },
  percentTextUp: {
    color: '#ff3b30',
  },
  percentTextDown: {
    color: '#137333',
  },
  historySection: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6d7b6b',
    letterSpacing: 0.5,
    paddingHorizontal: 4,
  },
  noSessionsCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e3e2e7',
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  noSessionsText: {
    fontSize: 13,
    color: '#6d7b6b',
    textAlign: 'center',
  },
  startBtn: {
    backgroundColor: '#006e28',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  startBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  sessionsList: {
    gap: 10,
  },
  sessionCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e3e2e7',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
    gap: 12,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  sessionFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f4f3f8',
    paddingTop: 10,
    alignItems: 'flex-start',
  },
  cloneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 110, 40, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  cloneBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#006e28',
  },
  sessionLeft: {
    gap: 4,
  },
  sessionStoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  storeIcon: {
    marginTop: 1,
  },
  sessionStoreName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1a1b1f',
  },
  sessionInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sessionInfoText: {
    fontSize: 11,
    color: '#6d7b6b',
    fontWeight: '500',
  },
  sessionBullet: {
    fontSize: 11,
    color: '#6d7b6b',
  },
  sessionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  sessionAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#006e28',
  },
  sessionSavings: {
    fontSize: 9,
    fontWeight: '700',
    color: '#137333',
    marginTop: 1,
  },
});
