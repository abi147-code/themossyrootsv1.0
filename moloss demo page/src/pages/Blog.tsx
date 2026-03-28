import { motion } from 'motion/react';
import { ArrowRight, Calendar, Tag } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

export default function Blog() {
  const { t, language } = useLanguage();

  const articlesEn = [
    {
      id: 1,
      title: "The Secret Behind Our Ciabatta",
      excerpt: "It took us 6 months and 42 different recipes to perfect the Moloss ciabatta. Here's why we refused to compromise on the crunch.",
      category: t('blog.cat.behind'),
      date: "Oct 12, 2023",
      img: "https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Meet the Chef: Slow-Cooked Beef Edition",
      excerpt: "Our signature beef isn't just cooked; it's respected. Discover the 12-hour process that makes it melt in your mouth.",
      category: t('blog.cat.food'),
      date: "Sep 28, 2023",
      img: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "Why We Chose the 1st Arrondissement",
      excerpt: "Location is everything. When we found this spot on Rue de Rivoli, we knew it was the perfect home for Moloss.",
      category: t('blog.cat.news'),
      date: "Sep 15, 2023",
      img: "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 4,
      title: "The Veggie Revolution: Not Just an Afterthought",
      excerpt: "We believe vegetarian options should be just as bold and satisfying as our meat sandwiches. Enter the Roasted Veggie.",
      category: t('blog.cat.food'),
      date: "Aug 30, 2023",
      img: "https://images.unsplash.com/photo-1550508139-b967012fd162?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 5,
      title: "Soundtrack to Your Lunch: The Moloss Playlist",
      excerpt: "House, reggae, and street-pop. Dive into the musical influences that shape the atmosphere of our restaurant.",
      category: t('blog.cat.culture'),
      date: "Aug 14, 2023",
      img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 6,
      title: "Opening Day: What to Expect",
      excerpt: "We're opening our doors soon. Here's a sneak peek at the menu, the vibe, and the special launch day promotions.",
      category: t('blog.cat.news'),
      date: "Jul 22, 2023",
      img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop"
    }
  ];

  const articlesFr = [
    {
      id: 1,
      title: "Le Secret de Notre Ciabatta",
      excerpt: "Il nous a fallu 6 mois et 42 recettes différentes pour perfectionner la ciabatta Moloss. Voici pourquoi nous avons refusé de faire des compromis sur le croustillant.",
      category: t('blog.cat.behind'),
      date: "12 Oct 2023",
      img: "https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Rencontrez le Chef : Édition Bœuf Mijoté",
      excerpt: "Notre bœuf signature n'est pas seulement cuit ; il est respecté. Découvrez le processus de 12 heures qui le rend si fondant.",
      category: t('blog.cat.food'),
      date: "28 Sep 2023",
      img: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "Pourquoi Nous Avons Choisi le 1er Arrondissement",
      excerpt: "L'emplacement fait tout. Quand nous avons trouvé ce spot rue de Rivoli, nous savions que c'était la maison parfaite pour Moloss.",
      category: t('blog.cat.news'),
      date: "15 Sep 2023",
      img: "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 4,
      title: "La Révolution Végé : Pas Juste une Option",
      excerpt: "Nous pensons que les options végétariennes doivent être aussi audacieuses et satisfaisantes que nos sandwichs à la viande. Voici le Légumes Rôtis.",
      category: t('blog.cat.food'),
      date: "30 Août 2023",
      img: "https://images.unsplash.com/photo-1550508139-b967012fd162?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 5,
      title: "La Bande-Son de Votre Déjeuner : La Playlist Moloss",
      excerpt: "House, reggae et street-pop. Plongez dans les influences musicales qui façonnent l'atmosphère de notre restaurant.",
      category: t('blog.cat.culture'),
      date: "14 Août 2023",
      img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 6,
      title: "Jour d'Ouverture : À Quoi S'attendre",
      excerpt: "Nous ouvrons bientôt nos portes. Voici un aperçu du menu, de l'ambiance et des promotions spéciales du jour de lancement.",
      category: t('blog.cat.news'),
      date: "22 Juil 2023",
      img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop"
    }
  ];

  const articles = language === 'en' ? articlesEn : articlesFr;

  const categories = [
    t('blog.cat.all'), 
    t('blog.cat.news'), 
    t('blog.cat.food'), 
    t('blog.cat.behind'), 
    t('blog.cat.culture')
  ];

  return (
    <div className="bg-moloss-white min-h-screen pt-24 md:pt-32 pb-16 md:pb-24">
      {/* Blog Hero */}
      <section className="container mx-auto px-6 md:px-12 mb-12 md:mb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          <h1 className="font-display font-black text-5xl sm:text-6xl md:text-8xl uppercase tracking-tighter text-moloss-dark-green mb-4 md:mb-6">
            {t('blog.title1')} <span className="text-moloss-mid-green">{t('blog.title2')}</span>
          </h1>
          <p className="text-lg md:text-2xl font-medium text-moloss-black/70 leading-relaxed">
            {t('blog.desc')}
          </p>
        </motion.div>
      </section>

      {/* Featured Article */}
      <section className="container mx-auto px-6 md:px-12 mb-16 md:mb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="group cursor-pointer"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-moloss-ice">
              <img 
                src={articles[0].img} 
                alt={articles[0].title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-4 md:mb-6">
                <span className="bg-moloss-dark-green text-moloss-white text-xs font-bold uppercase tracking-wider py-1.5 px-3 rounded-full">
                  {articles[0].category}
                </span>
                <span className="text-moloss-black/50 text-sm font-medium flex items-center gap-1.5">
                  <Calendar size={14} />
                  {articles[0].date}
                </span>
              </div>
              <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-tighter text-moloss-black mb-4 md:mb-6 group-hover:text-moloss-dark-green transition-colors">
                {articles[0].title}
              </h2>
              <p className="text-base md:text-lg text-moloss-black/70 font-medium leading-relaxed mb-6 md:mb-8">
                {articles[0].excerpt}
              </p>
              <span className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-moloss-dark-green group-hover:text-moloss-mid-green transition-colors">
                {t('blog.read')}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Category Filters */}
      <section className="container mx-auto px-6 md:px-12 mb-8 md:mb-12">
        <div className="flex flex-wrap gap-2 md:gap-3 border-b border-moloss-black/10 pb-4 md:pb-6">
          {categories.map((cat, i) => (
            <button 
              key={cat}
              className={`px-4 py-2 md:px-5 md:py-2 rounded-full font-bold text-xs md:text-sm uppercase tracking-wider transition-all ${
                i === 0 
                  ? "bg-moloss-black text-moloss-white" 
                  : "bg-moloss-white text-moloss-black/60 hover:bg-moloss-ice hover:text-moloss-dark-green"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Article Grid */}
      <section className="container mx-auto px-6 md:px-12 mb-16 md:mb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 md:gap-x-8 md:gap-y-16">
          {articles.slice(1).map((article, i) => (
            <motion.div 
              key={article.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group cursor-pointer flex flex-col h-full"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-moloss-ice mb-6">
                <img 
                  src={article.img} 
                  alt={article.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-moloss-dark-green text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <Tag size={12} />
                  {article.category}
                </span>
                <span className="text-moloss-black/30">•</span>
                <span className="text-moloss-black/50 text-xs font-medium">
                  {article.date}
                </span>
              </div>
              <h3 className="font-display font-bold text-2xl uppercase tracking-tight text-moloss-black mb-3 group-hover:text-moloss-dark-green transition-colors">
                {article.title}
              </h3>
              <p className="text-moloss-black/70 text-sm font-medium leading-relaxed mb-6 flex-grow">
                {article.excerpt}
              </p>
              <span className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-sm text-moloss-dark-green group-hover:text-moloss-mid-green transition-colors mt-auto">
                {t('blog.readMore')}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 md:mt-16 text-center">
          <button className="w-full sm:w-auto px-8 py-4 bg-moloss-white border-2 border-moloss-dark-green text-moloss-dark-green font-bold uppercase tracking-wider rounded-full hover:bg-moloss-dark-green hover:text-moloss-white transition-colors">
            {t('blog.load')}
          </button>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="container mx-auto px-6 md:px-12">
        <div className="bg-moloss-ice rounded-3xl p-8 md:p-16 text-center max-w-4xl mx-auto">
          <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-tighter text-moloss-dark-green mb-4">
            {t('blog.cta.title')}
          </h2>
          <p className="text-base md:text-lg text-moloss-black/70 font-medium mb-6 md:mb-8 max-w-lg mx-auto">
            {t('blog.cta.desc')}
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder={t('footer.placeholder')} 
              className="flex-grow bg-moloss-white border-none rounded-xl px-6 py-4 text-moloss-black placeholder:text-moloss-black/40 focus:outline-none focus:ring-2 focus:ring-moloss-dark-green font-medium w-full"
            />
            <button 
              type="submit"
              className="w-full sm:w-auto bg-moloss-dark-green text-moloss-white font-bold uppercase tracking-wider px-8 py-4 rounded-xl hover:bg-moloss-mid-green transition-colors whitespace-nowrap"
            >
              {t('footer.subscribe')}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
