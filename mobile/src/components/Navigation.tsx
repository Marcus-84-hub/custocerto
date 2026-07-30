import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ShoppingCart, Scale, History, User, ClipboardList } from 'lucide-react-native';
import { ViewTab } from '../types';

interface NavigationProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  console.log('Navigation rendering!');
  const tabs = [
    { id: 'cart' as ViewTab, label: 'Início', icon: ShoppingCart },
    { id: 'planning' as ViewTab, label: 'Planejar', icon: ClipboardList },
    { id: 'comparator' as ViewTab, label: 'Análise', icon: Scale },
    { id: 'history' as ViewTab, label: 'Histórico', icon: History },
    { id: 'profile' as ViewTab, label: 'Perfil', icon: User },
  ];

  return (
    <View style={styles.navBar}>
      <View style={styles.navContainer}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onTabChange(tab.id)}
              style={[
                styles.tabButton,
                isActive && styles.tabButtonActive,
              ]}
              activeOpacity={0.7}
            >
              <Icon
                size={20}
                color={isActive ? '#ffffff' : '#3d4a3c'}
              />
              <Text
                style={[
                  styles.tabLabel,
                  isActive ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(244, 243, 248, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(188, 203, 184, 0.4)',
    paddingBottom: 24, // Padding for safe area/home indicator on iPhone
    paddingTop: 8,
  },
  navContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  tabButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 68,
    height: 48,
    borderRadius: 16,
    gap: 4,
  },
  tabButtonActive: {
    backgroundColor: '#006e28',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  tabLabelInactive: {
    color: '#3d4a3c',
  },
  tabLabelActive: {
    color: '#ffffff',
  },
});
