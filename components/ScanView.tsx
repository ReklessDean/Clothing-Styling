import React, { useState, useRef } from 'react';
import { Camera, Loader2, Check, X, Tag, Save, ArrowRight, RefreshCw } from 'lucide-react';
import { analyzeClothingImage } from '../services/geminiService';
import { AnalysisResult, ClothingItem, ClothingCategory } from '../types';

interface ScanViewProps {
  onSave: (item: ClothingItem) => void;
  onGoToWardrobe: () => void;
}

export const ScanView: React.FC<ScanViewProps> = ({ onSave, onGoToWardrobe }) => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImage(base64String);
      startAnalysis(base64String);
    };
    reader.readAsDataURL(file);
  };

  const startAnalysis = async (base64Img: string) => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);
    setShowSuccess(false);
    try {
      const result = await analyzeClothingImage(base64Img);
      setAnalysis(result);
    } catch (err) {
      setError("Could not analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetake = () => {
    setImage(null);
    setAnalysis(null);
    setError(null);
    setShowSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = () => {
    if (!analysis || !image) return;

    const newItem: ClothingItem = {
      id: crypto.randomUUID(),
      imageUrl: image,
      type: analysis.type,
      category: analysis.category,
      color: analysis.color,
      season: analysis.seasons,
      tags: analysis.tags,
      description: analysis.description,
      createdAt: Date.now()
    };

    onSave(newItem);
    setShowSuccess(true);
  };

  if (showSuccess) {
    return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 text-green-400">
                <Check size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Added to Closet!</h2>
            <p className="text-zinc-400 mb-8">Your {analysis?.color} {analysis?.type} is now in your digital wardrobe.</p>

            <div className="flex flex-col gap-3 w-full max-w-xs">
                <button 
                    onClick={handleRetake}
                    className="w-full py-4 rounded-xl font-semibold bg-zinc-800 text-white hover:bg-zinc-700 transition flex items-center justify-center gap-2"
                >
                    <RefreshCw size={18} />
                    Scan Another Piece
                </button>
                <button 
                    onClick={onGoToWardrobe}
                    className="w-full py-4 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/20 transition flex items-center justify-center gap-2"
                >
                    Go to Closet
                    <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto no-scrollbar pb-24">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
        Scan New Item
      </h2>

      {!image ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-zinc-700 rounded-3xl bg-surface/50 relative overflow-hidden group">
            <input
                type="file"
                accept="image/*"
                capture="environment"
                className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                onChange={handleFileChange}
                ref={fileInputRef}
            />
            <div className="flex flex-col items-center text-zinc-400 group-hover:text-indigo-400 transition-colors">
                <div className="p-4 rounded-full bg-zinc-800 mb-4 group-hover:scale-110 transition-transform">
                    <Camera size={48} />
                </div>
                <p className="font-medium">Tap to take photo</p>
                <p className="text-xs mt-2 opacity-50">Supports JPG, PNG</p>
            </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-2xl border border-zinc-800">
            <img src={image} alt="Scanned item" className="w-full h-full object-cover" />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-indigo-500 mb-2" size={40} />
                <p className="text-sm font-medium animate-pulse text-indigo-200">Analyzing Fabric...</p>
              </div>
            )}
            {!isAnalyzing && !analysis && !error && (
                <button 
                    onClick={handleRetake}
                    className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur rounded-full text-white hover:bg-red-500/80 transition"
                >
                    <X size={20} />
                </button>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center text-sm">
              {error}
              <button onClick={handleRetake} className="block w-full mt-2 text-white font-bold underline">Try Again</button>
            </div>
          )}

          {analysis && (
            <div className="flex flex-col gap-4 animate-fade-in-up">
              <div className="bg-surface p-5 rounded-2xl border border-zinc-800 shadow-lg">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-xl font-bold text-white capitalize">{analysis.color} {analysis.type}</h3>
                        <span className="text-xs text-zinc-400 uppercase tracking-wider">{analysis.category}</span>
                    </div>
                </div>
                
                <p className="text-zinc-400 text-sm mb-4 leading-relaxed">{analysis.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-2">
                    {analysis.seasons.map(s => (
                        <span key={s} className="px-2 py-1 bg-zinc-800 rounded-md text-xs text-zinc-300 border border-zinc-700">
                            {s}
                        </span>
                    ))}
                </div>
                <div className="flex flex-wrap gap-2">
                    {analysis.tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-indigo-500/10 text-indigo-300 rounded-md text-xs border border-indigo-500/20">
                            <Tag size={10} /> {tag}
                        </span>
                    ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={handleRetake}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition"
                >
                  Discard
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2 transition"
                >
                  <Save size={18} />
                  Add to Wardrobe
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};