import React from 'react';
import { ShoppingCart, Scale, History, User, ClipboardList } from 'lucide-react';
import { ViewTab } from '../types';

interface NavigationProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'cart' as ViewTab, label: 'Início', icon: ShoppingCart },
    { id: 'planning' as ViewTab, label: 'Planejar', icon: ClipboardList },
    { id: 'comparator' as ViewTab, label: 'Análise', icon: Scale },
    { id: 'history' as ViewTab, label: 'Histórico', icon: History },
    { id: 'profile' as ViewTab, label: 'Perfil', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#f4f3f8]/95 dark:bg-[#18181b]/95 backdrop-blur-xl border-t border-[#bccbb8]/40 dark:border-zinc-800 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center w-16 h-12 rounded-2xl transition-all duration-200 active:scale-90 ${
                isActive
                  ? 'bg-[#34c759] text-[#004d1a] dark:bg-[#006e28] dark:text-white shadow-sm'
                  : 'text-[#3d4a3c] dark:text-zinc-400 hover:text-[#006e28]'
              }`}
            >
              <Icon className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[11px] font-semibold mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
