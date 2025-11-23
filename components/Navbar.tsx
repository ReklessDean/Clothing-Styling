import React from 'react';
import { Shirt, Camera, Sparkles, MessageCircle } from 'lucide-react';
import { ViewState } from '../types';

interface NavbarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: 'wardrobe', icon: Shirt, label: 'Closet' },
    { id: 'scan', icon: Camera, label: 'Scan' },
    { id: 'outfits', icon: Sparkles, label: 'Looks' },
    { id: 'chat', icon: MessageCircle, label: 'Ask AI' },
  ] as const;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-surface/90 backdrop-blur-lg border-t border-zinc-800 flex items-center justify-around px-2 z-50 pb-safe">
      {navItems.map((item) => {
        const isActive = currentView === item.id;
        const Icon = item.icon;
        
        return (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 ${
              isActive ? 'text-indigo-400 -translate-y-2' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-indigo-500/10' : 'bg-transparent'}`}>
                <Icon size={isActive ? 24 : 22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] font-medium mt-1 ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
