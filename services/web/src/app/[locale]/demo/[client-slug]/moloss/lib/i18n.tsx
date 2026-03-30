import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navbar
    'nav.menu': 'Menu',
    'nav.story': 'Story',
    'nav.locations': 'Locations',
    'nav.blog': 'Blog',
    'nav.findUs': 'Find Us',
    // Footer
    'footer.desc': 'A cool, generous, welcoming sandwich spot where customers feel they get real value, big fillings, strong flavor, and a modern atmosphere.',
    'footer.explore': 'Explore',
    'footer.contact': 'Contact',
    'footer.newsletter': 'Newsletter',
    'footer.newsletterDesc': 'Join the pack for exclusive drops and secret menu items.',
    'footer.placeholder': 'Your email address',
    'footer.subscribe': 'Subscribe',
    'footer.rights': 'Moloss. All rights reserved.',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    // Home - Hero
    'hero.big': 'Big ',
    'hero.fillings': 'Fillings.',
    'hero.no': 'No ',
    'hero.compromises': 'Compromises.',
    'hero.subtitle': 'The modern ciabatta sandwich brand. Fresh, generous, and unapologetically bold.',
    'hero.explore': 'Explore Menu',
    'hero.find': 'Find Us',
    'hero.scroll': 'Scroll',
    // Home - Identity
    'id.title': "We don't do small.",
    'id.desc': "Moloss is a cool, generous, welcoming sandwich spot where you get real value, big fillings, strong flavor, and a modern atmosphere.",
    // Home - Signature
    'sig.title1': 'Signature ',
    'sig.title2': 'Bites',
    'sig.subtitle': 'Freshly baked ciabatta, loaded to the brim.',
    'sig.viewAll': 'View Full Menu',
    'sig.tag.signature': 'Signature',
    'sig.tag.popular': 'Popular',
    'sig.tag.veggie': 'Veggie',
    'sig.item1.name': 'The Classic Beef',
    'sig.item1.desc': 'Slow-cooked beef, caramelized onions, melted provolone, secret sauce.',
    'sig.item2.name': 'Crispy Chicken',
    'sig.item2.desc': 'Buttermilk fried chicken, spicy slaw, pickles, garlic mayo.',
    'sig.item3.name': 'Ciabatta Garlic Bread',
    'sig.item3.desc': 'Toasted ciabatta, garlic butter, coriander, parmesan.',
    // Home - Why
    'why.title': 'The Moloss Way',
    'why.1.title': 'Generous Fillings',
    'why.1.desc': "We don't skimp. Every sandwich is packed to satisfy real hunger.",
    'why.2.title': 'Fresh Ciabatta',
    'why.2.desc': 'Baked daily, crispy on the outside, soft and airy on the inside.',
    'why.3.title': 'Veggie & Meat',
    'why.3.desc': 'Bold flavors for everyone, whether you crave slow-cooked beef or roasted veg.',
    'why.4.title': 'Urban Vibe',
    'why.4.desc': 'Fast, friendly, and set to a soundtrack of house, reggae, and street-pop.',
    // Home - Menu
    'menu.title1': 'Explore ',
    'menu.title2': 'The Menu',
    'menu.search': 'Search cravings...',
    'menu.cat.all': 'All',
    'menu.cat.chicken': 'Chicken',
    'menu.cat.beef': 'Beef',
    'menu.cat.veggie': 'Veggie',
    'menu.cat.sides': 'Sides',
    'menu.cat.drinks': 'Drinks',
    'menu.item.name': 'Item Name',
    'menu.item.desc': 'Delicious description of the ingredients goes here. Fresh, tasty, and generous.',
    'menu.order': 'Order Online Soon',
    // Home - Story
    'story.title1': 'Born from ',
    'story.title2': 'Real Hunger.',
    'story.p1': 'Moloss started with a simple frustration: why are most sandwiches either too small, too expensive, or lacking real flavor?',
    'story.p2': 'We wanted to create a place that feels like a proper meal. A spot where the ciabatta is baked fresh, the fillings are generous, and the vibe is always right.',
    'story.p3': 'Inspired by street food culture, house music, and the simple joy of a really good bite, Moloss is our answer to the boring lunch break.',
    // Home - Gallery
    'gal.title1': 'The ',
    'gal.title2': 'Vibe',
    // Home - Reviews
    'rev.title': 'Word on the Street',
    'rev.based': 'Based on 200+ reviews',
    'rev.1.text': 'Finally a sandwich that actually fills you up. The ciabatta is insane.',
    'rev.2.text': 'Cool vibe, great music, and the veggie option is actually delicious.',
    'rev.3.text': 'Best lunch spot in the area. Fast service but premium quality.',
    // Home - Location
    'loc.title1': 'Find ',
    'loc.title2': 'Us',
    'loc.address': 'Address',
    'loc.hours': 'Hours',
    'loc.hours.val': 'Mon - Sat: 11:30 - 22:00\nSun: Closed',
    'loc.contact': 'Contact',
    'loc.dir': 'Get Directions',
    'loc.call': 'Call Us',
    // Home - Community
    'com.title': 'Join The Pack',
    'com.desc': 'Follow us on Instagram for secret menu drops, event invites, and daily cravings.',
    'com.view': 'View Post',
    // Home - CTA
    'cta.come': 'Come ',
    'cta.hungry': 'Hungry.',
    'cta.leave': 'Leave ',
    'cta.satisfied': 'Satisfied.',
    'cta.btn': 'Find Your Moloss',
    // Blog
    'blog.title1': 'The ',
    'blog.title2': 'Journal',
    'blog.desc': 'Stories from the kitchen, news about our launch, and deep dives into sandwich culture.',
    'blog.read': 'Read Article',
    'blog.readMore': 'Read More',
    'blog.load': 'Load More Articles',
    'blog.cta.title': "Don't Miss a Bite",
    'blog.cta.desc': 'Subscribe to our newsletter for the latest updates, secret menu items, and launch day invites.',
    'blog.cat.all': 'All',
    'blog.cat.news': 'News',
    'blog.cat.food': 'Food',
    'blog.cat.behind': 'Behind the Scenes',
    'blog.cat.culture': 'Culture',
  },
  fr: {
    // Navbar
    'nav.menu': 'Menu',
    'nav.story': 'Histoire',
    'nav.locations': 'Adresses',
    'nav.blog': 'Blog',
    'nav.findUs': 'Nous Trouver',
    // Footer
    'footer.desc': 'Un lieu cool, généreux et accueillant où les clients en ont pour leur argent : des garnitures copieuses, des saveurs intenses et une atmosphère moderne.',
    'footer.explore': 'Explorer',
    'footer.contact': 'Contact',
    'footer.newsletter': 'Newsletter',
    'footer.newsletterDesc': 'Rejoignez la meute pour des exclusivités et des menus secrets.',
    'footer.placeholder': 'Votre adresse e-mail',
    'footer.subscribe': "S'abonner",
    'footer.rights': 'Moloss. Tous droits réservés.',
    'footer.privacy': 'Politique de confidentialité',
    'footer.terms': "Conditions d'utilisation",
    // Home - Hero
    'hero.big': 'Garnitures ',
    'hero.fillings': 'Généreuses.',
    'hero.no': 'Sans ',
    'hero.compromises': 'Compromis.',
    'hero.subtitle': 'La marque moderne de sandwichs ciabatta. Frais, généreux et audacieux.',
    'hero.explore': 'Voir le Menu',
    'hero.find': 'Nous Trouver',
    'hero.scroll': 'Défiler',
    // Home - Identity
    'id.title': "On ne fait pas dans la demi-mesure.",
    'id.desc': "Moloss est un lieu cool, généreux et accueillant où vous en avez pour votre argent : des garnitures copieuses, des saveurs intenses et une atmosphère moderne.",
    // Home - Signature
    'sig.title1': 'Bouchées ',
    'sig.title2': 'Signatures',
    'sig.subtitle': 'Ciabatta fraîchement cuite, garnie à ras bord.',
    'sig.viewAll': 'Voir tout le menu',
    'sig.tag.signature': 'Signature',
    'sig.tag.popular': 'Populaire',
    'sig.tag.veggie': 'Végé',
    'sig.item1.name': 'Le Bœuf Classique',
    'sig.item1.desc': 'Bœuf mijoté, oignons caramélisés, provolone fondu, sauce secrète.',
    'sig.item2.name': 'Poulet Croustillant',
    'sig.item2.desc': 'Poulet frit au babeurre, salade de chou épicée, cornichons, mayo à l\'ail.',
    'sig.item3.name': "Pain a l'ail Ciabatta",
    'sig.item3.desc': "Ciabatta grillee, beurre a l'ail, coriandre, parmesan.",
    // Home - Why
    'why.title': "L'Esprit Moloss",
    'why.1.title': 'Garnitures Généreuses',
    'why.1.desc': "On ne lésine pas. Chaque sandwich est garni pour satisfaire une vraie faim.",
    'why.2.title': 'Ciabatta Fraîche',
    'why.2.desc': "Cuite tous les jours, croustillante à l'extérieur, douce et aérée à l'intérieur.",
    'why.3.title': 'Végé & Viande',
    'why.3.desc': 'Des saveurs audacieuses pour tous, que vous ayez envie de bœuf mijoté ou de légumes rôtis.',
    'why.4.title': 'Ambiance Urbaine',
    'why.4.desc': 'Rapide, sympa, sur fond de house, reggae et street-pop.',
    // Home - Menu
    'menu.title1': 'Explorer ',
    'menu.title2': 'Le Menu',
    'menu.search': 'Rechercher une envie...',
    'menu.cat.all': 'Tout',
    'menu.cat.chicken': 'Poulet',
    'menu.cat.beef': 'Bœuf',
    'menu.cat.veggie': 'Végé',
    'menu.cat.sides': 'Accompagnements',
    'menu.cat.drinks': 'Boissons',
    'menu.item.name': 'Nom de l\'article',
    'menu.item.desc': 'Délicieuse description des ingrédients ici. Frais, savoureux et généreux.',
    'menu.order': 'Commande en ligne bientôt',
    // Home - Story
    'story.title1': 'Né d\'une ',
    'story.title2': 'Vraie Faim.',
    'story.p1': 'Moloss est né d\'une frustration simple : pourquoi la plupart des sandwichs sont-ils soit trop petits, soit trop chers, soit sans vraie saveur ?',
    'story.p2': 'Nous voulions créer un endroit qui ressemble à un vrai repas. Un lieu où la ciabatta est cuite fraîchement, les garnitures sont généreuses et l\'ambiance est toujours au rendez-vous.',
    'story.p3': 'Inspiré par la culture street food, la house music et la joie simple d\'une très bonne bouchée, Moloss est notre réponse à la pause déjeuner ennuyeuse.',
    // Home - Gallery
    'gal.title1': "L'",
    'gal.title2': 'Ambiance',
    // Home - Reviews
    'rev.title': "Ce qu'on en dit",
    'rev.based': 'Basé sur plus de 200 avis',
    'rev.1.text': 'Enfin un sandwich qui cale vraiment. La ciabatta est dingue.',
    'rev.2.text': 'Ambiance cool, super musique, et l\'option végé est vraiment délicieuse.',
    'rev.3.text': 'Meilleur spot du quartier pour le déj. Service rapide mais qualité premium.',
    // Home - Location
    'loc.title1': 'Nous ',
    'loc.title2': 'Trouver',
    'loc.address': 'Adresse',
    'loc.hours': 'Horaires',
    'loc.hours.val': 'Lun - Sam: 11:30 - 22:00\nDim: Fermé',
    'loc.contact': 'Contact',
    'loc.dir': 'Itinéraire',
    'loc.call': 'Nous Appeler',
    // Home - Community
    'com.title': 'Rejoignez la Meute',
    'com.desc': 'Suivez-nous sur Instagram pour des exclusivités, des invitations et vos envies quotidiennes.',
    'com.view': 'Voir le post',
    // Home - CTA
    'cta.come': 'Venez avec la ',
    'cta.hungry': 'Faim.',
    'cta.leave': 'Repartez ',
    'cta.satisfied': 'Rassasié.',
    'cta.btn': 'Trouvez votre Moloss',
    // Blog
    'blog.title1': 'Le ',
    'blog.title2': 'Journal',
    'blog.desc': 'Histoires de la cuisine, nouvelles de notre lancement et plongées dans la culture du sandwich.',
    'blog.read': "Lire l'article",
    'blog.readMore': 'Lire la suite',
    'blog.load': 'Charger plus d\'articles',
    'blog.cta.title': "Ne manquez pas une miette",
    'blog.cta.desc': 'Abonnez-vous à notre newsletter pour les dernières mises à jour, les menus secrets et les invitations de lancement.',
    'blog.cat.all': 'Tout',
    'blog.cat.news': 'Actualités',
    'blog.cat.food': 'Nourriture',
    'blog.cat.behind': 'Coulisses',
    'blog.cat.culture': 'Culture',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
  children,
  initialLanguage = 'en',
}: {
  children: ReactNode;
  initialLanguage?: Language;
}) {
  const [language, setLanguage] = useState<Language>(initialLanguage);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}




