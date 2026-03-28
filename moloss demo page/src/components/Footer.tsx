import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, MapPin, Mail } from 'lucide-react';
import { useLanguage } from '../lib/i18n';
import { cn } from '../lib/utils';

export default function Footer() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <footer className="bg-moloss-black text-moloss-white py-12 md:py-16 px-6 md:px-12">
      <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">
        <div className="col-span-1 md:col-span-1 flex flex-col items-start">
          <Link to="/" className="font-display font-black text-4xl tracking-tighter uppercase mb-4 text-moloss-ice">
            Moloss
          </Link>
          <p className="text-moloss-white/70 text-sm max-w-xs mb-6 font-medium">
            {t('footer.desc')}
          </p>
          <div className="flex gap-4">
            <a href="#" className="p-2 bg-moloss-white/10 rounded-full hover:bg-moloss-mid-green transition-colors">
              <Instagram size={20} />
            </a>
            <a href="#" className="p-2 bg-moloss-white/10 rounded-full hover:bg-moloss-mid-green transition-colors">
              <Facebook size={20} />
            </a>
            <a href="#" className="p-2 bg-moloss-white/10 rounded-full hover:bg-moloss-mid-green transition-colors">
              <Twitter size={20} />
            </a>
          </div>
        </div>

        <div className="col-span-1 md:col-span-1">
          <h4 className="font-display font-bold text-lg uppercase mb-4 text-moloss-light-green">{t('footer.explore')}</h4>
          <ul className="space-y-3">
            <li><a href="/#menu" className="text-moloss-white/80 hover:text-moloss-ice transition-colors font-medium text-sm">{t('nav.menu')}</a></li>
            <li><a href="/#story" className="text-moloss-white/80 hover:text-moloss-ice transition-colors font-medium text-sm">{t('nav.story')}</a></li>
            <li><a href="/#locations" className="text-moloss-white/80 hover:text-moloss-ice transition-colors font-medium text-sm">{t('nav.locations')}</a></li>
            <li><Link to="/blog" className="text-moloss-white/80 hover:text-moloss-ice transition-colors font-medium text-sm">{t('nav.blog')}</Link></li>
          </ul>
        </div>

        <div className="col-span-1 md:col-span-1">
          <h4 className="font-display font-bold text-lg uppercase mb-4 text-moloss-light-green">{t('footer.contact')}</h4>
          <ul className="space-y-4">
            <li className="flex items-start gap-3 text-moloss-white/80 font-medium text-sm">
              <MapPin size={18} className="shrink-0 mt-0.5 text-moloss-ice" />
              <span>123 Rue de Rivoli<br />75001 Paris, France</span>
            </li>
            <li className="flex items-center gap-3 text-moloss-white/80 font-medium text-sm">
              <Mail size={18} className="shrink-0 text-moloss-ice" />
              <span>hello@moloss.fr</span>
            </li>
          </ul>
        </div>

        <div className="col-span-1 md:col-span-1">
          <h4 className="font-display font-bold text-lg uppercase mb-4 text-moloss-light-green">{t('footer.newsletter')}</h4>
          <p className="text-moloss-white/70 text-sm mb-4 font-medium">{t('footer.newsletterDesc')}</p>
          <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder={t('footer.placeholder')}
              className="bg-moloss-white/10 border border-moloss-white/20 rounded-lg px-4 py-3 text-sm text-moloss-white placeholder:text-moloss-white/50 focus:outline-none focus:border-moloss-ice transition-colors"
            />
            <button
              type="submit"
              className="bg-moloss-dark-green hover:bg-moloss-mid-green text-moloss-white font-bold uppercase text-sm py-3 rounded-lg transition-colors"
            >
              {t('footer.subscribe')}
            </button>
          </form>
        </div>
      </div>

      <div className="container mx-auto mt-12 md:mt-16 pt-8 border-t border-moloss-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        <p className="text-moloss-white/50 text-xs font-medium">
          &copy; {new Date().getFullYear()} {t('footer.rights')}
        </p>
        <div className="flex flex-wrap justify-center items-center gap-4 text-moloss-white/50 text-xs font-medium">
          <a href="#" className="hover:text-moloss-white transition-colors">{t('footer.privacy')}</a>
          <a href="#" className="hover:text-moloss-white transition-colors">{t('footer.terms')}</a>
          <div className="flex items-center gap-2 md:ml-4 border-l border-moloss-white/20 pl-4">
            <button 
              onClick={() => setLanguage('en')}
              className={cn("transition-colors", language === 'en' ? "text-moloss-white font-bold" : "hover:text-moloss-white")}
            >
              EN
            </button>
            <span>/</span>
            <button 
              onClick={() => setLanguage('fr')}
              className={cn("transition-colors", language === 'fr' ? "text-moloss-white font-bold" : "hover:text-moloss-white")}
            >
              FR
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
