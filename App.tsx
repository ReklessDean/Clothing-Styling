import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { WardrobeView } from './components/WardrobeView';
import { ScanView } from './components/ScanView';
import { OutfitView } from './components/OutfitView';
import { ChatAdvisor } from './components/ChatAdvisor';
import { ViewState, ClothingItem, Outfit } from './types';

// Mock data for demo purposes if needed, but we start empty
const INITIAL_ITEMS: ClothingItem[] = [];

function App() {
  const [view, setView] = useState<ViewState>('wardrobe');
  
  // Persist state in localStorage
  const [items, setItems] = useState<ClothingItem[]>(() => {
    const saved = localStorage.getItem('wardrobe_items');
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  const [outfits, setOutfits] = useState<Outfit[]>(() => {
    const saved = localStorage.getItem('saved_outfits');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('wardrobe_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('saved_outfits', JSON.stringify(outfits));
  }, [outfits]);

  const handleAddItem = (item: ClothingItem) => {
    setItems(prev => [item, ...prev]);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to remove this item?')) {
        setItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleSaveOutfit = (outfit: Outfit) => {
    setOutfits(prev => [outfit, ...prev]);
  };

  const handleDeleteOutfit = (id: string) => {
    setOutfits(prev => prev.filter(o => o.id !== id));
  };

  return (
    <div className="bg-background min-h-screen w-full text-zinc-100 font-sans selection:bg-indigo-500/30">
      
      {/* Main Content Area */}
      <main className="h-screen w-full max-w-md mx-auto relative bg-background shadow-2xl overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden relative">
            {view === 'wardrobe' && (
            <WardrobeView items={items} onDelete={handleDeleteItem} />
            )}
            {view === 'scan' && (
            <ScanView onSave={handleAddItem} onGoToWardrobe={() => setView('wardrobe')} />
            )}
            {view === 'outfits' && (
            <OutfitView 
                wardrobe={items} 
                savedOutfits={outfits} 
                onSaveOutfit={handleSaveOutfit}
                onDeleteOutfit={handleDeleteOutfit}
            />
            )}
            {view === 'chat' && (
            <ChatAdvisor wardrobe={items} />
            )}
        </div>
        
        {/* Navigation */}
        <Navbar currentView={view} setView={setView} />
      </main>
    </div>
  );
}

export default App;