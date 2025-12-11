export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  rating?: number;
  categoryId: string;
  featured?: boolean;
  tags?: string[];
}

export interface CartItem {
  item: FoodItem;
  quantity: number;
}
