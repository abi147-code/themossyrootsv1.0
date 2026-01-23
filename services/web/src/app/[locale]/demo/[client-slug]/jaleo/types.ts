export interface MenuItem {
  name: string;
  description?: string;
  price?: string;
}

export interface Review {
  author: string;
  text: string;
  rating: number;
}

export interface MenuSectionProps {
  title: string;
  subtitle?: string;
  items: MenuItem[];
  layout?: 'list' | 'grid' | 'cards';
}