export type DemoContactChannel = 'whatsapp' | 'contact' | 'call';

export type DemoSection = {
  title: string;
  body: string;
  bullets?: string[];
  accent?: string;
};

export type DemoPayload = {
  heroTitle: string;
  heroSubtitle: string;
  heroSupport: string;
  accentColor: string;
  heroTagline?: string;
  sections: DemoSection[];
  highlightStats: { label: string; value: string }[];
  contactIntent: {
    label: string;
    channel: DemoContactChannel;
    link: string;
  }[];
};

export type DemoClientConfig = {
  slug: string;
  password: string;
  displayName: string;
  payload: DemoPayload;
};

const demoClients: Record<string, DemoClientConfig> = {
  'pizzeria-mario': {
    slug: 'pizzeria-mario',
    password: 'mario2026',
    displayName: 'Pizzeria Mario',
    payload: {
      heroTitle: 'Savor handcrafted pies in every bite',
      heroSubtitle: 'A bespoke menu, lush photography, and local storytelling built for the neighborhood crowd.',
      heroSupport: 'Designed to feel like a warm invitation, not a landing page.',
      accentColor: '#FF6F45',
      heroTagline: 'Neapolitan roots · modern presence',
      highlightStats: [
        { label: 'Seats filled nightly', value: '120' },
        { label: 'Loyalty sign-ups', value: '2,400/mo' },
        { label: 'Bookings via WhatsApp', value: '67%' },
      ],
      sections: [
        {
          title: 'Menu Stories',
          body: 'Swipeable cards showcase today’s dough batch, chef tips, and seasonal specials without ever leaving the scroll.',
          bullets: ['Fresh ingredients spotlight', 'Chef note overlays', 'Opening hours CTA'],
        },
        {
          title: 'Community Vibes',
          body: 'Dynamic color washes pair with candid snapshots from live nights to sell the personality of the space.',
          bullets: ['Real-time mood lighting', 'Event microcopy', 'Guest reviews as motion text'],
        },
        {
          title: 'Reservation Flow',
          body: 'A single tap opens WhatsApp with pre-filled reservation details—perfect for walk-in guests.',
          bullets: ['Deep link enabled', 'One-click confirmation', 'Operating hours toggle'],
        },
      ],
      contactIntent: [
        {
          label: 'Chat on WhatsApp',
          channel: 'whatsapp',
          link: 'https://wa.me/33123456789',
        },
        {
          label: 'Request Menu Preview',
          channel: 'contact',
          link: '#contact',
        },
      ],
    },
  },
  'salon-elegance': {
    slug: 'salon-elegance',
    password: 'glow2026',
    displayName: 'Salon Élegance',
    payload: {
      heroTitle: 'A luminous salon experience',
      heroSubtitle: 'Soft gradients, tactile textures, and concierge-level scheduling tailored for beauty clients.',
      heroSupport: 'The preview feels like a salon brochure fresh out of the portfolio box.',
      accentColor: '#C288FF',
      heroTagline: 'Luxury touchpoints · effortless navigation',
      highlightStats: [
        { label: 'Appointments booked online', value: '83%' },
        { label: 'Repeat guests', value: '74%' },
        { label: 'Average ticket lift', value: '+28%' },
      ],
      sections: [
        {
          title: 'Signature Services',
          body: 'Animated service cards highlight luxury treatments with soft hover states and pricing cues (without showing actual price).',
          bullets: ['Curated treatment line-up', 'Service iconography', 'Hover blur reveals notes'],
        },
        {
          title: 'Before + After',
          body: 'A split-screen slider emphasizes transformation stories so prospects feel the craft instantly.',
          bullets: ['Scrollable gallery', 'Client testimonials', 'Swipe tip for mobile'],
        },
        {
          title: 'Concierge Booking',
          body: 'Calm CTAs direct clients to WhatsApp, email, or a dedicated booking form with zero friction.',
          bullets: ['Channel choice CTA', 'Appointment countdown banner', 'Prefill contact details'],
        },
      ],
      contactIntent: [
        {
          label: 'Reserve via WhatsApp',
          channel: 'whatsapp',
          link: 'https://wa.me/33987654321',
        },
        {
          label: 'Call the salon',
          channel: 'call',
          link: 'tel:+33123456789',
        },
      ],
    },
  },
  'boucherie-nantes': {
    slug: 'boucherie-nantes',
    password: 'nantes2026',
    displayName: 'Boucherie Nantes',
    payload: {
      heroTitle: 'Craft butchery that feels like home',
      heroSubtitle: 'Slow-crafted meats, artisan charcuterie, and a tactile experience for neighbors.',
      heroSupport: 'Designed for local deliveries, pop-up dinners, and education workshops.',
      accentColor: '#F5A623',
      heroTagline: 'Tradition meets clickable commerce',
      highlightStats: [
        { label: 'Weekly orders', value: '310' },
        { label: 'Workshops sold out', value: '12' },
        { label: 'Newsletter open rate', value: '68%' },
      ],
      sections: [
        {
          title: 'Crafted Offerings',
          body: 'Icon-led tiles display charcuterie boxes, weekly cuts, and artisanal accompaniments with tactile hover states.',
          bullets: ['Ingredient sourcing stories', 'Chef recommendations', 'Limited-run badges'],
        },
        {
          title: 'Local Delivery',
          body: 'A responsive grid outlines delivery zones, same-day slots, and WhatsApp check-ins without overwhelming the shopper.',
          bullets: ['Zone heatmap', 'Pickup indicator', 'Delivery CTA'],
        },
        {
          title: 'Workshop Calendar',
          body: 'Full-height carousel walks through masterclasses, tasting menus, and collaboration dinners.',
          bullets: ['Date chips', 'Waitlist CTA', 'Gallery snapshots'],
        },
      ],
      contactIntent: [
        {
          label: 'WhatsApp the butcher',
          channel: 'whatsapp',
          link: 'https://wa.me/33234567890',
        },
        {
          label: 'Book a visit',
          channel: 'contact',
          link: '#visit',
        },
      ],
    },
  },
  'jaleo': {
    slug: 'jaleo',
    password: 'jaleo2026',
    displayName: 'Jaleo Gastrobar',
    payload: {
      heroTitle: 'JALEO | Gastrobar Chantenay',
      heroSubtitle: 'A Catalan soul in the heart of Nantes with tactile motion and cinematic storytelling.',
      heroSupport: 'Built to feel like walking into the restaurant for the first time.',
      accentColor: '#BFA15F',
      heroTagline: 'Catalan spirit · Nantes elegance',
      highlightStats: [
        { label: 'Guests served nightly', value: '120+' },
        { label: 'Reservations via WhatsApp', value: '68%' },
        { label: 'Immersive tasting menus', value: '12' },
      ],
      sections: [
        {
          title: 'Sensory Sequence',
          body: 'Layered motion and atmospheric textures bring the Gastrobar journey to life.',
          bullets: ['Slow Ken Burns hero', 'Parallax storytelling', 'Gold-ink gradients'],
        },
        {
          title: 'Culinary Craft',
          body: 'Signature dishes float in responsive grids while handcrafted typography stays sharp.',
          bullets: ['Interactive dish cards', 'Animated reveal cues', 'Museum-grade spacing'],
        },
      ],
      contactIntent: [
        {
          label: 'Reserve via WhatsApp',
          channel: 'whatsapp',
          link: 'https://wa.me/33234567890',
        },
      ],
    },
  },
};

export function getDemoConfig(slug: string): DemoClientConfig | undefined {
  return demoClients[slug];
}

export function listDemoSlugs() {
  return Object.keys(demoClients);
}

export function findDemoByPassword(password: string): DemoClientConfig | undefined {
  if (!password) return undefined;
  const normalized = password.trim();
  return Object.values(demoClients).find((client) => client.password === normalized);
}
