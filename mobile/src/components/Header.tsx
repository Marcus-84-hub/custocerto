import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SlidersHorizontal, AlertTriangle } from 'lucide-react-native';
import { formatBRL } from '../utils/calculator';

interface HeaderProps {
  totalCartAmount: number;
  budgetLimit: number;
  itemCount: number;
  onOpenBudgetModal: () => void;
  onOpenMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalCartAmount,
  budgetLimit,
  itemCount,
  onOpenBudgetModal,
  onOpenMenu,
}) => {
  console.log('Header rendering!');
  const isOverBudget = totalCartAmount > budgetLimit;
  const budgetPercent = Math.min(Math.round((totalCartAmount / budgetLimit) * 100), 100);

  return (
    <View style={styles.headerContainer}>
      <View style={styles.contentContainer}>
        {/* Brand & Menu */}
        <View style={styles.leftSection}>
          <TouchableOpacity onPress={onOpenMenu} style={styles.iconButton}>
            <SlidersHorizontal size={20} color="#006e28" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>CustoCerto</Text>
            {itemCount > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>
                  {itemCount} {itemCount === 1 ? 'item' : 'itens'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Budget Pill */}
        <TouchableOpacity
          onPress={onOpenBudgetModal}
          style={[
            styles.budgetPill,
            isOverBudget ? styles.budgetPillOver : styles.budgetPillNormal,
          ]}
        >
          {isOverBudget && <AlertTriangle size={14} color="#ffffff" style={styles.warningIcon} />}
          <Text
            style={[
              styles.budgetPillText,
              isOverBudget ? styles.budgetPillTextOver : styles.budgetPillTextNormal,
            ]}
          >
            {formatBRL(totalCartAmount)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarBg}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${budgetPercent}%` },
            isOverBudget
              ? styles.progressBarOver
              : budgetPercent > 80
              ? styles.progressBarWarning
              : styles.progressBarNormal,
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e3e2e7',
    paddingTop: 48, // Compensate for iOS status bar
    paddingBottom: 0,
  },
  contentContainer: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 110, 40, 0.05)',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#006e28',
    letterSpacing: -0.5,
  },
  badgeContainer: {
    backgroundColor: 'rgba(0, 110, 40, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#006e28',
  },
  budgetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  budgetPillNormal: {
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
  },
  budgetPillOver: {
    backgroundColor: '#ff3b30',
  },
  warningIcon: {
    marginRight: 4,
  },
  budgetPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  budgetPillTextNormal: {
    color: '#004d1a',
  },
  budgetPillTextOver: {
    color: '#ffffff',
  },
  progressBarBg: {
    height: 3,
    backgroundColor: '#eeedf3',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
  },
  progressBarNormal: {
    backgroundColor: '#006e28',
  },
  progressBarWarning: {
    backgroundColor: '#ffcc00',
  },
  progressBarOver: {
    backgroundColor: '#ff3b30',
  },
});
