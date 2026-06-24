export interface Product {
  id: string;
  title: string;
  price: number;
  badges: string[];
  reasons: string[];
  imageUrl?: string;
  icon?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  recommendation?: Product;
  comparison?: Product[];
}
