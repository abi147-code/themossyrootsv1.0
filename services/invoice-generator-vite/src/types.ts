

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
  invoicePageColor?: string;
  invoiceTextColor?: string;
  invoiceTypographyKey?: string;
  logoUrl?: string;
  invoiceTemplateKey?: 'luxury' | 'professional' | 'classic' | 'futuristic';
  fromCompanyName?: string;
  fromCompanyAddress?: string;
  fromCompanyEmail?: string;
  paymentLink?: string;
  paymentMethod?: 'qr' | 'button';
  paymentButtonText?: string;
}

export interface MarketingBannerData {
  enabled: boolean;
  bannerCopyText?: string;
  bannerCopyTextColor?: string;
  bannerCopyOpacity?: number;
  bannerBackgroundColor?: string;
  bannerTextColor?: string;
  bannerImageOpacity?: number;
  bannerUrl?: string;
  imagePosition?: { x: number; y: number };
  style: 'solid' | 'gradient' | 'bordered';
  ctaText?: string;
  ctaTargetUrl?: string;
  ctaBackgroundColor?: string;
  ctaTextColor?: string;
}

export interface AIState {
  isLoading: boolean;
  error: string | null;
  suggestions: string[];
}
