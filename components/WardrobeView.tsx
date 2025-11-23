import React, { useMemo, useState } from 'react';
import { ClothingItem, ClothingCategory } from '../types';
import { Trash2, Search, Filter, X, Tag } from 'lucide-react';

interface WardrobeViewProps {
  items: ClothingItem[];
  onDelete: (id: string) => void;
}

export const WardrobeView: React.FC<WardrobeViewProps> = ({ items, onDelete }) => {
  const [filter, setFilter] = useState<ClothingCategory | 'All'>('All');
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);

  const filteredItems = useMemo(() => {
    if (filter === 'All') return items;
    return items.filter(item => item.category === filter);
  }, [items, filter]);

  if (items.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 text-zinc-500">
        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
            <Search size={32} className="opacity-50" />
        </div>
        <h3 className="text-xl font-semibold text-zinc-300 mb-2">Closet Empty</h3>
        <p className="max-w-xs">Start by scanning your clothes to build your digital wardrobe.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 pb-24 overflow-hidden relative">
      <div className="flex items-center justify-between mb-6 px-2">
        <h2 className="text-2xl font-bold text-white">My Wardrobe <span className="text-zinc-600 text-lg font-normal ml-2">{items.length} items</span></h2>
        
        <div className="relative">
            <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value as any)}
                className="appearance-none bg-zinc-900 text-sm text-zinc-300 pl-9 pr-4 py-2 rounded-lg border border-zinc-800 focus:outline-none focus:border-indigo-500"
            >
                <option value="All">All Items</option>
                {Object.values(ClothingCategory).map(c => (
                    <option key={c} value={c}>{c}</option>
                ))}
            </select>
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-2 gap-4 pb-20">
        {filteredItems.map((item) => (
          <div 
            key={item.id} 
            onClick={() => setSelectedItem(item)}
            className="group relative bg-surface rounded-2xl overflow-hidden border border-zinc-800 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-95"
          >
            <div className="aspect-[4/5] w-full bg-zinc-900 relative">
                <img src={item.imageUrl} alt={item.type} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                
                <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-medium text-sm truncate">{item.color} {item.type}</p>
                    <p className="text-zinc-400 text-xs">{item.category}</p>
                </div>
            </div>
            
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                }}
                className="absolute top-2 right-2 p-2 bg-black/40 backdrop-blur rounded-full text-white/70 hover:bg-red-500 hover:text-white transition opacity-0 group-hover:opacity-100"
            >
                <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            {/* Modal Container */}
            <div className="bg-surface w-full max-h-[90%] rounded-3xl border border-zinc-700 shadow-2xl flex flex-col relative animate-fade-in-up overflow-hidden">
                
                {/* Sticky Close Button */}
                <div className="absolute top-4 right-4 z-20">
                    <button 
                        onClick={() => setSelectedItem(null)}
                        className="p-2 bg-black/50 backdrop-blur rounded-full text-white hover:bg-zinc-700 transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto no-scrollbar flex-1">
                    <div className="w-full aspect-[4/3] bg-zinc-900 relative">
                        <img src={selectedItem.imageUrl} alt={selectedItem.type} className="w-full h-full object-contain" />
                    </div>

                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-2xl font-bold text-white capitalize">{selectedItem.color} {selectedItem.type}</h3>
                                <span className="text-sm text-indigo-400 uppercase font-bold tracking-wider">{selectedItem.category}</span>
                            </div>
                        </div>

                        <p className="text-zinc-300 leading-relaxed mb-6">{selectedItem.description}</p>

                        <div className="space-y-4">
                            <div>
                                <h4 className="text-xs text-zinc-500 uppercase tracking-widest mb-2 font-semibold">Seasons</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedItem.season.map(s => (
                                        <span key={s} className="px-3 py-1.5 bg-zinc-800 rounded-lg text-sm text-zinc-300 border border-zinc-700">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs text-zinc-500 uppercase tracking-widest mb-2 font-semibold">Style Tags</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedItem.tags.map(tag => (
                                        <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 text-indigo-300 rounded-lg text-sm border border-indigo-500/20">
                                            <Tag size={12} /> {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => {
                                if(confirm("Delete this item?")) {
                                    onDelete(selectedItem.id);
                                    setSelectedItem(null);
                                }
                            }}
                            className="w-full mt-8 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-semibold hover:bg-red-500/20 transition flex items-center justify-center gap-2"
                        >
                            <Trash2 size={18} /> Remove from Wardrobe
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};