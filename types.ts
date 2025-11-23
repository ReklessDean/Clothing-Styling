export enum ClothingCategory {
  TOP = 'Top',
  BOTTOM = 'Bottom',
  SHOES = 'Shoes',
  OUTERWEAR = 'Outerwear',
  ACCESSORY = 'Accessory',
  ONE_PIECE = 'One-Piece',
  UNKNOWN = 'Unknown'
}

export enum Season {
  SUMMER = 'Summer',
  WINTER = 'Winter',
  SPRING = 'Spring',
  FALL = 'Fall',
  ALL_SEASON = 'All Season'
}

export interface ClothingItem {
  id: string;
  imageUrl: string; // Base64 or URL
  type: string; // e.g., "Hoodie", "Jeans"
  category: ClothingCategory;
  color: string;
  season: Season[];
  tags: string[]; // e.g., "Casual", "Formal", "Streetwear"
  description: string;
  createdAt: number;
}

export interface Outfit {
  id: string;
  name: string;
  itemIds: string[];
  occasion: string;
  reasoning: string;
  createdAt: number;
}

export type ViewState = 'wardrobe' | 'scan' | 'outfits' | 'chat';

export interface WardrobeContextType {
  items: ClothingItem[];
  outfits: Outfit[];
  addItem: (item: ClothingItem) => void;
  deleteItem: (id: string) => void;
  saveOutfit: (outfit: Outfit) => void;
  deleteOutfit: (id: string) => void;
}

export interface AnalysisResult {
  type: string;
  category: ClothingCategory;
  color: string;
  seasons: Season[];
  tags: string[];
  description: string;
}
