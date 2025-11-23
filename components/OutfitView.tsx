import React, { useState } from 'react';
import { ClothingItem, Outfit } from '../types';
import { generateOutfitRecommendation } from '../services/geminiService';
import { Sparkles, Loader2, Calendar, Shirt } from 'lucide-react';

interface OutfitViewProps {
  wardrobe: ClothingItem[];
  savedOutfits: Outfit[];
  onSaveOutfit: (outfit: Outfit) => void;
  onDeleteOutfit: (id: string) => void;
}

export const OutfitView: React.FC<OutfitViewProps> = ({ wardrobe, savedOutfits, onSaveOutfit, onDeleteOutfit }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutfit, setGeneratedOutfit] = useState<Outfit | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || wardrobe.length === 0) return;
    setIsGenerating(true);
    setGeneratedOutfit(null);

    try {
      const result = await generateOutfitRecommendation(wardrobe, prompt);
      const newOutfit: Outfit = {
        id: crypto.randomUUID(),
        name: result.name,
        itemIds: result.itemIds,
        occasion: prompt,
        reasoning: result.reasoning,
        createdAt: Date.now()
      };
      setGeneratedOutfit(newOutfit);
    } catch (e) {
      alert("Failed to generate outfit. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const getImagesForOutfit = (itemIds: string[]) => {
    return itemIds.map(id => wardrobe.find(item => item.id === id)).filter(Boolean) as ClothingItem[];
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto no-scrollbar pb-24">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        AI Stylist
      </h2>

      {/* Input Section */}
      <div className="bg-surface p-4 rounded-2xl border border-zinc-800 mb-8 shadow-lg">
        <label className="block text-sm font-medium text-zinc-400 mb-2">What's the occasion?</label>
        <div className="flex gap-2">
            <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Christmas party, Job interview..."
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim() || wardrobe.length === 0}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all"
            >
            {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
            </button>
        </div>
        {wardrobe.length === 0 && <p className="text-xs text-red-400 mt-2">Add clothes to your wardrobe first!</p>}
      </div>

      {/* Generated Result */}
      {generatedOutfit && (
        <div className="mb-8 animate-fade-in-up">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-white">Recommended Look</h3>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-full">New</span>
            </div>
            
            <div className="bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-2xl p-5 border border-zinc-700">
                <h4 className="text-xl font-bold text-indigo-100 mb-1">{generatedOutfit.name}</h4>
                <p className="text-sm text-zinc-400 italic mb-4">"{generatedOutfit.reasoning}"</p>

                <div className="flex -space-x-4 mb-4 overflow-x-auto py-2 px-1">
                    {getImagesForOutfit(generatedOutfit.itemIds).map((item, idx) => (
                        <div key={idx} className="relative w-20 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 border-zinc-800 shadow-xl transform hover:-translate-y-1 transition-transform" style={{ zIndex: 10 - idx }}>
                            <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.type} />
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => {
                        onSaveOutfit(generatedOutfit);
                        setGeneratedOutfit(null);
                        setPrompt('');
                    }}
                    className="w-full py-2 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-600/50 rounded-lg text-sm font-semibold transition"
                >
                    Save to Collection
                </button>
            </div>
        </div>
      )}

      {/* Saved Outfits List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-zinc-300 flex items-center gap-2">
            <Calendar size={18} /> Saved Looks
        </h3>
        
        {savedOutfits.length === 0 ? (
            <p className="text-zinc-600 text-sm text-center py-8">No saved outfits yet.</p>
        ) : (
            savedOutfits.map(outfit => {
                const items = getImagesForOutfit(outfit.itemIds);
                return (
                    <div key={outfit.id} className="bg-surface rounded-xl p-4 border border-zinc-800 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-zinc-200">{outfit.name}</h4>
                                <p className="text-xs text-zinc-500 uppercase">{outfit.occasion}</p>
                            </div>
                            <button 
                                onClick={() => onDeleteOutfit(outfit.id)}
                                className="text-zinc-600 hover:text-red-400 transition"
                            >
                                <Loader2 className="rotate-45" size={16} /> {/* Using rotated loader as 'X' if X icon not avail, or just import X */}
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2">
                            {items.map(item => (
                                <div key={item.id} className="aspect-square rounded-lg overflow-hidden bg-zinc-900">
                                    <img src={item.imageUrl} className="w-full h-full object-cover opacity-80" alt={item.type} />
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
};
