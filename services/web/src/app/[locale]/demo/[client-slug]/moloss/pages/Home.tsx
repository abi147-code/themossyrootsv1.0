import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, MapPin, Star, ChevronRight, Clock, Phone, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/i18n';

export default function Home() {
  return (
    <div className="bg-moloss-white">
      <HeroSection />
      <IdentitySection />
      <SignatureMenuSection />
      <WhyMolossSection />
      <InteractiveMenuSection />
      <StorySection />
      <GallerySection />
      <ReviewsSection />
      <LocationSection />
      <CommunitySection />
      <FinalCTASection />
    </div>
  );
}

function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  const { t } = useLanguage();

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const yFloating1 = useTransform(scrollYProgress, [0, 1], ["0%", "-100%"]);
  const yFloating2 = useTransform(scrollYProgress, [0, 1], ["0%", "-150%"]);

  return (
    <section ref={ref} className="relative h-screen flex items-center justify-center overflow-hidden bg-moloss-black">
      <motion.div style={{ y, opacity }} className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-moloss-black via-moloss-dark-green/40 to-transparent z-10" />
        <div className="absolute inset-0 overflow-hidden">
          <video
            className="h-full w-full object-cover object-center opacity-70"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source src="/demo-assets/moloss/video/hero.mp4" type="video/mp4" />
          </video>
        </div>
      </motion.div>

      {/* Floating 3D-like elements */}
      <motion.div style={{ y: yFloating1 }} className="absolute top-1/4 left-10 md:left-20 z-10 opacity-40 blur-[2px]">
        <img src="https://images.unsplash.com/photo-1596683720379-b11030608876?q=80&w=200&auto=format&fit=crop" alt="Ingredient" className="w-24 h-24 object-cover rounded-full shadow-2xl" referrerPolicy="no-referrer" />
      </motion.div>
      <motion.div style={{ y: yFloating2 }} className="absolute bottom-1/4 right-10 md:right-32 z-10 opacity-30 blur-[4px]">
        <img src="https://images.unsplash.com/photo-1606850780554-b55ea4dd0b70?q=80&w=200&auto=format&fit=crop" alt="Ingredient" className="w-32 h-32 object-cover rounded-full shadow-2xl" referrerPolicy="no-referrer" />
      </motion.div>

      <div className="container relative z-20 mx-auto px-6 md:px-12 flex flex-col items-center text-center mt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl px-4 sm:px-0"
        >
          <div className="flex flex-col items-center gap-4 mb-6">
            <img
              src="/demo-assets/moloss/logo/moloss-logo.png"
              alt="Moloss logo"
              className="h-40 md:h-56 w-auto object-contain"
            />
          </div>
          <h1 className="font-display font-semibold text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-moloss-white uppercase tracking-tighter leading-[0.85] mb-6 drop-shadow-2xl">
            {t('hero.big')} <span className="text-moloss-ice">{t('hero.fillings')}</span><br />
            {t('hero.no')} <span className="text-moloss-light-green moloss-hero-bloom">{t('hero.compromises')}</span>
          </h1>
          <p className="text-base sm:text-lg md:text-2xl text-moloss-white/90 font-medium max-w-2xl mx-auto mb-10 drop-shadow-md moloss-story-body">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <a
              href="#menu"
              className="w-full sm:w-auto px-8 py-4 bg-moloss-dark-green text-moloss-white font-bold uppercase tracking-wider rounded-full hover:bg-moloss-mid-green transition-all hover:scale-105 active:scale-95 shadow-xl text-center"
            >
              {t('hero.explore')}
            </a>
            <a
              href="#locations"
              className="w-full sm:w-auto px-8 py-4 bg-moloss-white text-moloss-dark-green font-bold uppercase tracking-wider rounded-full hover:bg-moloss-ice transition-all hover:scale-105 active:scale-95 shadow-xl text-center"
            >
              {t('hero.find')}
            </a>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center text-moloss-white/70"
      >
        <span className="text-xs uppercase tracking-widest font-bold mb-2">{t('hero.scroll')}</span>
        <div className="w-[1px] h-12 bg-moloss-white/30 overflow-hidden">
          <motion.div
            animate={{ y: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-full h-full bg-moloss-white"
          />
        </div>
      </motion.div>
    </section>
  );
}

function IdentitySection() {
  const { t } = useLanguage();
  return (
    <section className="relative py-20 md:py-32 bg-moloss-dark-green text-moloss-white overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/demo-assets/moloss/images/big ciabatta.png"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-moloss-dark-green/70" />
      </div>
      <div className="container relative z-10 mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto text-center"
        >
          <h2 className="font-display font-black text-4xl sm:text-5xl md:text-7xl lg:text-8xl uppercase tracking-tighter leading-[0.9] text-moloss-ice mb-6 md:mb-8">
            {t('id.title')}
          </h2>
          <p className="text-lg sm:text-xl md:text-3xl font-medium text-moloss-white/90 leading-relaxed moloss-story-body">
            {t('id.desc')}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function SignatureMenuSection() {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const items = [
    {
      id: 1,
      name: t('sig.item1.name'),
      desc: t('sig.item1.desc'),
      price: "€12.50",
        img: "/demo-assets/moloss/images/Steak Ciabatta with Caramelised Onions and Roasted Garlic and Chive Aioli.jpeg",
      tag: t('sig.tag.signature')
    },
    {
      id: 2,
      name: t('sig.item2.name'),
      desc: t('sig.item2.desc'),
      price: "€11.50",
        img: "/demo-assets/moloss/images/Ciabatta Sandwich Recipe.jpeg",
      tag: t('sig.tag.popular')
    },
    {
      id: 3,
        name: t('sig.item3.name'),
        desc: t('sig.item3.desc'),
      price: "€10.50",
        img: "/demo-assets/moloss/images/The Best Garlic Bread with Coriander & Parmesan recipe.jpeg",
        tag: t('sig.tag.signature')
    }
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5;
    }
  }, []);

  return (
    <section id="menu" className="relative pt-24 pb-40 md:pt-32 md:pb-52 bg-moloss-white overflow-hidden">
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          className="w-full h-full object-cover object-center opacity-35 grayscale-[20%] saturate-75"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src="/demo-assets/moloss/video/making of ciabatta tik tok.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-moloss-white/90 via-moloss-white/70 to-moloss-white/40" />
      </div>
      <div className="container relative z-10 mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="font-display font-black text-4xl sm:text-5xl md:text-7xl uppercase tracking-tighter text-moloss-black">
                  {t('sig.title1')} <span className="text-moloss-dark-green moloss-hero-bloom">{t('sig.title2')}</span>
                </h2>
                <p className="text-moloss-black/60 font-medium mt-4 text-base md:text-lg">{t('sig.subtitle')}</p>
              </motion.div>
              <motion.a
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                href="#full-menu"
                className="flex items-center gap-2 font-bold uppercase tracking-wider text-moloss-dark-green hover:text-moloss-mid-green transition-colors group"
              >
                {t('sig.viewAll')}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </motion.a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-start">
              <div className="space-y-8">
                {items.map((item, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={cn(
                        "w-full text-left transition-colors",
                        isActive ? "text-moloss-black" : "text-moloss-black/50"
                      )}
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="font-display font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight">
                          {item.name}
                        </span>
                        <span className="text-sm sm:text-base font-bold text-moloss-dark-green">
                          {item.price}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-6">
                        <span className="text-xs uppercase tracking-[0.25em] text-moloss-dark-green/70">
                          {item.tag}
                        </span>
                        <span
                          className={cn(
                            "text-xs uppercase tracking-widest transition-opacity",
                            isActive ? "text-moloss-black/40 opacity-100" : "opacity-0"
                          )}
                        >
                          {t('sig.viewAll')}
                        </span>
                      </div>
                      <div
                        className={cn(
                          "mt-4 text-sm sm:text-base font-medium text-moloss-black/60 transition-all",
                          isActive ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
                        )}
                      >
                        {item.desc}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="relative rounded-[28px] overflow-hidden aspect-[4/5] bg-moloss-ice/80 border border-moloss-black/10">
                <div className="absolute inset-0">
                  {items.map((item, index) => (
                    <motion.img
                      key={item.id}
                      src={item.img}
                      alt={item.name}
                      className={cn(
                        "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
                        index === activeIndex ? "opacity-100" : "opacity-0"
                      )}
                      initial={false}
                      animate={{ scale: index === activeIndex ? 1 : 1.02 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-moloss-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-moloss-white">
                  <span className="text-xs uppercase tracking-[0.3em] text-moloss-white/80">
                    {items[activeIndex].tag}
                  </span>
                  <span className="font-display font-bold text-base">
                    {items[activeIndex].name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <img
        src="/demo-assets/moloss/logo/dog_laying_with_style/upscale dog_laying_with_style_upscayl_16x_digital-art-4x.png"
        alt="Moloss dog illustration"
        className="pointer-events-none absolute -bottom-[240px] left-6 sm:left-10 md:left-12 w-[280px] sm:w-[360px] md:w-[520px] lg:w-[650px] object-contain opacity-90 z-10"
      />
    </section>
  );
}

function WhyMolossSection() {
  const { t } = useLanguage();
  const reasons = [
    { title: t('why.1.title'), desc: t('why.1.desc') },
    { title: t('why.2.title'), desc: t('why.2.desc') },
    { title: t('why.3.title'), desc: t('why.3.desc') },
    { title: t('why.4.title'), desc: t('why.4.desc') }
  ];

  return (
    <section className="py-20 md:py-24 bg-moloss-ice overflow-hidden">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 md:mb-16 text-center"
        >
          <h2 className="font-display font-black text-4xl md:text-6xl uppercase tracking-tighter text-moloss-dark-green">
            {t('why.title')}
          </h2>
        </motion.div>

        <div className="flex flex-wrap md:flex-nowrap gap-6 overflow-x-auto hide-scrollbar pb-8 snap-x snap-mandatory -mx-6 px-6 md:mx-0 md:px-0">
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="min-w-[85vw] sm:min-w-[280px] md:min-w-0 flex-1 bg-moloss-white p-6 md:p-8 rounded-3xl shadow-sm snap-center hover:shadow-md transition-shadow hover:-translate-y-1 duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-moloss-light-green/20 flex items-center justify-center text-moloss-dark-green font-display font-bold text-xl mb-6">
                0{index + 1}
              </div>
              <h3 className="font-display font-bold text-2xl uppercase tracking-tight text-moloss-black mb-4">
                {reason.title}
              </h3>
              <p className="text-moloss-black/70 font-medium leading-relaxed">
                {reason.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function InteractiveMenuSection() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: t('menu.cat.all') },
    { id: 'chicken', label: t('menu.cat.chicken') },
    { id: 'beef', label: t('menu.cat.beef') },
    { id: 'veggie', label: t('menu.cat.veggie') },
    { id: 'sides', label: t('menu.cat.sides') },
    { id: 'drinks', label: t('menu.cat.drinks') }
  ];

  const menuItems = [
    {
      id: 1,
      categoryId: 'beef',
      name: t('sig.item1.name'),
      desc: t('sig.item1.desc'),
      price: '€12.50',
        img: '/demo-assets/moloss/images/Steak Ciabatta with Caramelised Onions and Roasted Garlic and Chive Aioli.jpeg'
    },
    {
      id: 2,
      categoryId: 'chicken',
      name: t('sig.item2.name'),
      desc: t('sig.item2.desc'),
      price: '€11.50',
        img: '/demo-assets/moloss/images/Ciabatta Sandwich Recipe.jpeg'
    },
    {
      id: 3,
      categoryId: 'sides',
      name: t('sig.item3.name'),
      desc: t('sig.item3.desc'),
      price: '€10.50',
      img: '/demo-assets/moloss/images/The Best Garlic Bread with Coriander & Parmesan recipe.jpeg'
    },
    {
      id: 4,
      categoryId: 'sides',
      name: 'Truffle Fries',
      desc: 'Crispy fries tossed in truffle oil and parmesan.',
      price: '€4.50',
      img: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=200&auto=format&fit=crop'
    },
    {
      id: 5,
      categoryId: 'drinks',
      name: 'Craft Lemonade',
      desc: 'House-made lemonade with fresh mint and ginger.',
      price: '€3.50',
      img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=200&auto=format&fit=crop'
    },
    {
      id: 6,
      categoryId: 'chicken',
      name: 'Spicy Chicken',
      desc: 'Fried chicken with our signature hot sauce and jalapeños.',
      price: '€12.00',
      img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=200&auto=format&fit=crop'
    },
    {
      id: 7,
      categoryId: 'beef',
      name: 'BBQ Brisket',
      desc: 'Smoked brisket, tangy BBQ sauce, crispy onions.',
      price: '€13.50',
      img: 'https://images.unsplash.com/photo-1508737804141-4c3b688e2546?q=80&w=200&auto=format&fit=crop'
    },
    {
      id: 8,
      categoryId: 'sides',
      name: 'Sweet Potato Fries',
      desc: 'Served with our house-made garlic aioli.',
      price: '€4.00',
      img: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?q=80&w=200&auto=format&fit=crop'
    }
  ];

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.categoryId === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  return (
    <section id="full-menu" className="py-20 md:py-32 bg-moloss-white">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-display font-black text-4xl sm:text-5xl md:text-7xl uppercase tracking-tighter text-moloss-black mb-6">
            <span className="text-3xl sm:text-4xl md:text-6xl">{t('menu.title1')}</span>{' '}
            <span className="text-moloss-light-green moloss-hero-bloom text-5xl sm:text-6xl md:text-8xl">{t('menu.title2')}</span>
          </h2>
          
          <div className="max-w-md mx-auto relative mb-10">
            <input 
              type="text" 
              placeholder={t('menu.search')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-moloss-ice/30 border border-moloss-ice rounded-full py-4 pl-6 pr-12 text-moloss-black placeholder:text-moloss-black/40 focus:outline-none focus:border-moloss-mid-green focus:ring-1 focus:ring-moloss-mid-green transition-all font-medium"
            />
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-moloss-black/40" size={20} />
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button 
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-6 py-2.5 rounded-full font-bold text-sm uppercase tracking-wider transition-all",
                  activeCategory === cat.id 
                    ? "bg-moloss-dark-green text-moloss-white shadow-md" 
                    : "bg-moloss-white border border-moloss-black/10 text-moloss-black/60 hover:border-moloss-dark-green hover:text-moloss-dark-green"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 max-w-5xl mx-auto">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <motion.div 
                key={item.id} 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex gap-6 group p-4 rounded-2xl hover:bg-moloss-ice/20 transition-colors cursor-pointer border border-transparent hover:border-moloss-ice/50"
              >
                <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-moloss-ice">
                  <img 
                    src={item.img} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=200&auto=format&fit=crop"
                    }}
                  />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-display font-bold text-xl uppercase tracking-tight text-moloss-black group-hover:text-moloss-dark-green transition-colors">
                      {item.name}
                    </h4>
                    <span className="font-bold text-moloss-dark-green">{item.price}</span>
                  </div>
                  <p className="text-moloss-black/60 text-sm font-medium line-clamp-2">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-moloss-black/50 font-medium">
              No items found matching your criteria.
            </div>
          )}
        </div>
        
        <div className="mt-16 text-center">
          <button className="px-8 py-4 bg-moloss-black text-moloss-white font-bold uppercase tracking-wider rounded-full hover:bg-moloss-dark-green transition-colors shadow-lg">
            {t('menu.order')}
          </button>
        </div>
      </div>
    </section>
  );
}

function StorySection() {
  const { t } = useLanguage();
  return (
    <section id="story" className="py-20 md:py-32 bg-moloss-dark-green text-moloss-white overflow-hidden">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-display font-black text-4xl sm:text-6xl md:text-8xl uppercase tracking-tighter text-moloss-ice mb-6 md:mb-8">
              {t('story.title1')} <br /><span className="moloss-hero-bloom">{t('story.title2')}</span>
            </h2>
            <div className="space-y-4 md:space-y-6 text-base md:text-xl font-medium text-moloss-white/80 leading-relaxed moloss-story-body">
              <p>{t('story.p1')}</p>
              <p>{t('story.p2')}</p>
              <p>{t('story.p3')}</p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-3xl overflow-hidden">
              <video
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
              >
                <source src="/demo-assets/moloss/video/making of ciabatta tik tok.mp4" type="video/mp4" />
              </video>
            </div>
            <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-moloss-light-green/20 blur-3xl -z-10" />
            <div className="absolute -top-8 -right-8 w-64 h-64 rounded-full bg-moloss-ice/10 blur-3xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

  function GallerySection() {
    const { t } = useLanguage();
    const images = [
      {
        src: "/demo-assets/moloss/interior.png",
        wrapperClass: "md:col-span-7 md:row-span-2 md:rotate-[-1deg]",
        aspect: "aspect-[16/9]",
        fit: "object-contain",
        offset: "md:-translate-y-3"
      },
      {
        src: "/demo-assets/moloss/exterior.png",
        wrapperClass: "md:col-span-5 md:rotate-[1deg]",
        aspect: "aspect-[4/3]",
        fit: "object-contain",
        offset: "md:translate-y-2"
      },
      {
        src: "/demo-assets/moloss/images/Steak Ciabatta with Caramelised Onions and Roasted Garlic and Chive Aioli.jpeg",
        wrapperClass: "md:col-span-5 md:rotate-[-2deg]",
        aspect: "aspect-[4/3]",
        fit: "object-contain",
        offset: "md:-translate-y-4"
      },
      {
        src: "/demo-assets/moloss/images/Ciabatta Sandwich Recipe.jpeg",
        wrapperClass: "md:col-span-6 md:rotate-[1.5deg]",
        aspect: "aspect-[4/3]",
        fit: "object-contain",
        offset: "md:translate-y-4"
      },
      {
        src: "/demo-assets/moloss/images/The Best Garlic Bread with Coriander & Parmesan recipe.jpeg",
        wrapperClass: "md:col-span-6 md:rotate-[-1.5deg]",
        aspect: "aspect-[4/3]",
        fit: "object-contain",
        offset: "md:-translate-y-2"
      },
      {
        src: "/demo-assets/moloss/images/fries.jpeg",
        wrapperClass: "md:col-span-6 md:rotate-[1deg]",
        aspect: "aspect-[4/3]",
        fit: "object-contain",
        offset: "md:translate-y-2"
      }
    ];

  return (
    <section className="py-20 md:py-32 bg-moloss-white">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-display font-black text-4xl sm:text-5xl md:text-7xl uppercase tracking-tighter text-moloss-black">
            {t('gal.title1')} <span className="text-moloss-mid-green">{t('gal.title2')}</span>
          </h2>
        </div>
        
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-fr">
            {images.map((img, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={cn(
                  "rounded-[32px] overflow-hidden group cursor-pointer bg-moloss-ice/30",
                  img.wrapperClass,
                  img.offset
                )}
              >
                <div className={cn("w-full h-full p-4 md:p-5", img.aspect)}>
                  <img 
                    src={img.src} 
                    alt="Moloss Atmosphere" 
                    className={cn(
                      "w-full h-full rounded-[26px] group-hover:scale-[1.02] transition-transform duration-700 ease-out sepia-[0.12] saturate-[0.85] brightness-[0.98] contrast-[0.95]",
                      img.fit
                    )}
                    referrerPolicy="no-referrer"
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-[32px] bg-[radial-gradient(circle_at_30%_20%,rgba(255,244,217,0.35),transparent_55%)] mix-blend-soft-light" />
                </div>
                <div className="pointer-events-none absolute inset-0 rounded-[32px] opacity-[0.08] mix-blend-multiply [background-image:repeating-linear-gradient(45deg,rgba(0,0,0,0.18)_0,rgba(0,0,0,0.18)_1px,transparent_1px,transparent_4px)]" />
              </motion.div>
            ))}
          </div>
      </div>
    </section>
  );
}

function ReviewsSection() {
  const { t } = useLanguage();
  const reviews = [
    { name: "Julien M.", text: t('rev.1.text'), rating: 5 },
    { name: "Sophie L.", text: t('rev.2.text'), rating: 5 },
    { name: "Thomas B.", text: t('rev.3.text'), rating: 5 }
  ];

  return (
    <section className="py-20 md:py-24 bg-moloss-ice">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
          <div className="md:w-1/3 text-center md:text-left">
            <h2 className="font-display font-black text-4xl md:text-6xl uppercase tracking-tighter text-moloss-dark-green mb-4">
              {t('rev.title')}
            </h2>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="font-display font-black text-5xl text-moloss-black">4.9</span>
              <div className="flex text-moloss-dark-green">
                {[...Array(5)].map((_, i) => <Star key={i} size={24} fill="currentColor" />)}
              </div>
            </div>
            <p className="text-moloss-black/60 font-medium">{t('rev.based')}</p>
          </div>
          
          <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {reviews.map((review, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-moloss-white p-6 rounded-2xl shadow-sm"
              >
                <div className="flex text-moloss-mid-green mb-4">
                  {[...Array(review.rating)].map((_, j) => <Star key={j} size={16} fill="currentColor" />)}
                </div>
                <p className="text-moloss-black/80 font-medium mb-4 italic">"{review.text}"</p>
                <p className="font-display font-bold uppercase text-sm text-moloss-dark-green">{review.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function LocationSection() {
  const { t } = useLanguage();
  return (
    <section id="locations" className="py-20 md:py-32 bg-moloss-white">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display font-black text-4xl sm:text-5xl md:text-7xl uppercase tracking-tighter text-moloss-black mb-8">
              {t('loc.title1')} <span className="text-moloss-mid-green">{t('loc.title2')}</span>
            </h2>
            
            <div className="bg-moloss-ice/30 p-8 rounded-3xl mb-8">
              <h3 className="font-display font-bold text-2xl uppercase tracking-tight text-moloss-dark-green mb-6">Moloss Paris 1er</h3>
              
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-moloss-white flex items-center justify-center shrink-0 text-moloss-dark-green shadow-sm">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-moloss-black uppercase tracking-wide mb-1">{t('loc.address')}</p>
                    <p className="text-moloss-black/70 font-medium">Rue Bon Secours<br />44000 Nantes, France</p>
                  </div>
                </li>
                
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-moloss-white flex items-center justify-center shrink-0 text-moloss-dark-green shadow-sm">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-moloss-black uppercase tracking-wide mb-1">{t('loc.hours')}</p>
                    <p className="text-moloss-black/70 font-medium whitespace-pre-line">{t('loc.hours.val')}</p>
                  </div>
                </li>
                
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-moloss-white flex items-center justify-center shrink-0 text-moloss-dark-green shadow-sm">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-moloss-black uppercase tracking-wide mb-1">{t('loc.contact')}</p>
                    <p className="text-moloss-black/70 font-medium">+33 1 23 45 67 89</p>
                  </div>
                </li>
              </ul>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button className="flex-1 py-3 bg-moloss-dark-green text-moloss-white font-bold uppercase tracking-wider rounded-xl hover:bg-moloss-mid-green transition-colors shadow-md">
                  {t('loc.dir')}
                </button>
                <button className="flex-1 py-3 bg-moloss-white text-moloss-dark-green border border-moloss-dark-green/20 font-bold uppercase tracking-wider rounded-xl hover:bg-moloss-ice transition-colors">
                  {t('loc.call')}
                </button>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="h-[500px] lg:h-auto rounded-3xl overflow-hidden bg-moloss-ice relative"
          >
            {/* Map Placeholder */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-50 mix-blend-multiply" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-moloss-dark-green text-moloss-white rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                <MapPin size={32} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CommunitySection() {
  const { t } = useLanguage();
  const videos = [
    "/demo-assets/moloss/video/kiss eating.mp4",
    "/demo-assets/moloss/video/making of ciabatta 2.mp4",
    "/demo-assets/moloss/video/group eating.mp4",
    "/demo-assets/moloss/video/making dough.mp4"
  ];
  const [activeVideo, setActiveVideo] = useState(0);
  return (
    <section className="py-14 md:py-16 bg-moloss-ice text-moloss-black relative overflow-hidden">
      <div className="absolute inset-0">
        <video
          key={activeVideo}
          className="w-full h-full object-cover"
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={() => setActiveVideo((prev) => (prev + 1) % videos.length)}
        >
          <source src={videos[activeVideo]} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-moloss-dark-green/35" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,96,67,0.20),transparent_55%),radial-gradient(circle_at_80%_20%,rgba(103,142,126,0.25),transparent_60%),radial-gradient(circle_at_50%_80%,rgba(183,223,229,0.6),transparent_55%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.0)_0%,rgba(255,255,255,0.25)_40%,rgba(255,255,255,0.55)_100%)]" />
      <div className="container relative z-10 mx-auto px-6 md:px-12">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-8 md:mb-10">
          <div className="max-w-2xl">
            <h2 className="font-display font-black text-4xl md:text-6xl uppercase tracking-tighter text-moloss-dark-green mb-4">
              {t('com.title')}
            </h2>
            <p className="text-base md:text-xl text-moloss-dark-green/80 font-medium">
              {t('com.desc')}
            </p>
          </div>
          <a
            href="#"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-moloss-dark-green text-moloss-white font-bold uppercase tracking-wider shadow-lg hover:bg-moloss-mid-green transition-colors"
          >
            Follow @moloss.fr
          </a>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 text-sm uppercase tracking-widest text-moloss-dark-green/80">
          <span>{t('com.view')}</span>
          <span className="text-moloss-dark-green/50">•</span>
          <span>4 clips cycling</span>
        </div>
      </div>
    </section>
  );
}

function FinalCTASection() {
  const { t } = useLanguage();
  return (
    <section className="py-20 md:py-32 bg-moloss-dark-green text-moloss-white text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay" />
      
      <div className="container relative z-10 mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-display font-black text-4xl sm:text-6xl md:text-8xl lg:text-9xl uppercase tracking-tighter leading-[0.85] mb-8">
            {t('cta.come')} <span className="text-moloss-ice">{t('cta.hungry')}</span><br />
            {t('cta.leave')} <span className="text-moloss-light-green">{t('cta.satisfied')}</span>
          </h2>
          <a
            href="#locations"
            className="inline-block px-8 py-4 md:px-10 md:py-5 bg-moloss-white text-moloss-dark-green font-black text-base md:text-lg uppercase tracking-widest rounded-full hover:bg-moloss-ice transition-all hover:scale-105 active:scale-95 shadow-2xl"
          >
            {t('cta.btn')}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
