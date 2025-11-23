

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  senderName: string;
  senderEmail: string;
  senderAddress: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  currency: string;
  taxRate: number;
  items: InvoiceItem[];
  notes: string;
  invoiceBackgroundColor?: string;
  invoiceTextColor?: string;
  fontSelection?: 'editorial' | 'clean' | 'classic' | 'professional' | 'elegant' | 'tech';
  logoUrl?: string;
  template?: 'luxury' | 'professional' | 'classic' | 'futuristic';
  paymentLink?: string;
  paymentMethod?: 'qr' | 'button';
  paymentButtonText?: string;
}

export interface MarketingBannerData {
  enabled: boolean;
  text: string;
  backgroundColor: string;
  textColor: string;
  style: 'solid' | 'gradient' | 'bordered';
  imageUrl?: string;
  imageOpacity?: number;
  imagePosition?: { x: number; y: number };
  ctaText?: string;
  ctaLink?: string;
  ctaBackgroundColor?: string;
  ctaTextColor?: string;
}

export interface AIState {
  isLoading: boolean;
  error: string | null;
  suggestions: string[];
}