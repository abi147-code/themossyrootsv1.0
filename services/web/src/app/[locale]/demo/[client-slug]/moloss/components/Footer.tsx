import { Instagram, Facebook, Twitter, MapPin, Mail } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '../lib/i18n';
import { cn } from '../lib/utils';

type FooterProps = {
  basePath: string;
  blogPath: string;
};

export default function Footer({ basePath, blogPath }: FooterProps) {
  const { t, language, setLanguage } = useLanguage();

  return (
    <footer className="relative bg-[#b8dfe6] text-moloss-dark-green py-12 md:py-16 px-6 md:px-12 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/demo-assets/moloss/logo/dog_laying_with_style/upscale full logo .png"
          alt=""
          className="w-full h-full object-contain opacity-90"
        />
        <div className="absolute inset-0 bg-[#b8dfe6]/10" />
      </div>
      <div className="container relative z-10 mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 lg:grid-rows-2 gap-10 md:gap-12 lg:gap-x-24 lg:gap-y-16 min-h-[420px]">
        <div className="col-span-1 flex flex-col items-start lg:self-start lg:justify-self-start">
          <Link href={basePath} className="mb-4 inline-flex">
            <img
              src="/demo-assets/moloss/logo/moloss/Green.png"
              alt="Moloss"
              className="h-[120px] w-auto object-contain"
            />
          </Link>
          <p className="text-moloss-dark-green/80 text-sm max-w-xs mb-6 font-medium">
            {t('footer.desc')}
          </p>
          <div className="flex gap-4">
            <a href="#" className="p-2 bg-moloss-dark-green/10 rounded-full hover:bg-moloss-dark-green/20 transition-colors">
              <Instagram size={20} />
            </a>
            <a href="#" className="p-2 bg-moloss-dark-green/10 rounded-full hover:bg-moloss-dark-green/20 transition-colors">
              <Facebook size={20} />
            </a>
            <a href="#" className="p-2 bg-moloss-dark-green/10 rounded-full hover:bg-moloss-dark-green/20 transition-colors">
              <Twitter size={20} />
            </a>
          </div>
        </div>

        <div className="col-span-1 lg:justify-self-end lg:text-right lg:self-start">
          <h4 className="font-display font-bold text-lg uppercase mb-4 text-moloss-dark-green">{t('footer.explore')}</h4>
          <ul className="space-y-3">
            <li><Link href={`${basePath}/#menu`} className="text-moloss-dark-green/80 hover:text-moloss-black transition-colors font-medium text-sm">{t('nav.menu')}</Link></li>
            <li><Link href={`${basePath}/#story`} className="text-moloss-dark-green/80 hover:text-moloss-black transition-colors font-medium text-sm">{t('nav.story')}</Link></li>
            <li><Link href={`${basePath}/#locations`} className="text-moloss-dark-green/80 hover:text-moloss-black transition-colors font-medium text-sm">{t('nav.locations')}</Link></li>
            <li><Link href={blogPath} className="text-moloss-dark-green/80 hover:text-moloss-black transition-colors font-medium text-sm">{t('nav.blog')}</Link></li>
          </ul>
        </div>

        <div className="col-span-1 lg:self-end lg:justify-self-start">
          <h4 className="font-display font-bold text-lg uppercase mb-4 text-moloss-dark-green">{t('footer.contact')}</h4>
          <ul className="space-y-4">
            <li className="flex items-start gap-3 text-moloss-dark-green/80 font-medium text-sm">
              <MapPin size={18} className="shrink-0 mt-0.5 text-moloss-dark-green" />
              <span>123 Rue de Rivoli<br />75001 Paris, France</span>
            </li>
            <li className="flex items-center gap-3 text-moloss-dark-green/80 font-medium text-sm">
              <Mail size={18} className="shrink-0 text-moloss-dark-green" />
              <span>hello@moloss.fr</span>
            </li>
          </ul>
        </div>

        <div className="col-span-1 lg:self-end lg:justify-self-end lg:text-right">
          <h4 className="font-display font-bold text-lg uppercase mb-4 text-moloss-dark-green">{t('footer.newsletter')}</h4>
          <p className="text-moloss-dark-green/80 text-sm mb-4 font-medium">{t('footer.newsletterDesc')}</p>
          <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder={t('footer.placeholder')}
              className="bg-white/70 border border-moloss-dark-green/20 rounded-lg px-4 py-3 text-sm text-moloss-dark-green placeholder:text-moloss-dark-green/50 focus:outline-none focus:border-moloss-dark-green transition-colors lg:ml-auto lg:w-[240px]"
            />
            <button
              type="submit"
              className="bg-moloss-dark-green hover:bg-moloss-mid-green text-moloss-white font-bold uppercase text-sm py-3 rounded-lg transition-colors lg:ml-auto lg:w-[240px]"
            >
              {t('footer.subscribe')}
            </button>
          </form>
        </div>
      </div>

      <div className="container relative z-10 mx-auto max-w-5xl lg:mr-auto mt-12 md:mt-16 pt-8 border-t border-moloss-dark-green/20 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        <p className="text-moloss-dark-green/60 text-xs font-medium">
          &copy; {new Date().getFullYear()} {t('footer.rights')}
        </p>
        <div className="flex flex-wrap justify-center items-center gap-4 text-moloss-dark-green/60 text-xs font-medium">
          <a href="#" className="hover:text-moloss-black transition-colors">{t('footer.privacy')}</a>
          <a href="#" className="hover:text-moloss-black transition-colors">{t('footer.terms')}</a>
          <div className="flex items-center gap-2 md:ml-4 border-l border-moloss-dark-green/20 pl-4">
            <button 
              onClick={() => setLanguage('en')}
              className={cn("transition-colors", language === 'en' ? "text-moloss-dark-green font-bold" : "hover:text-moloss-black")}
            >
              EN
            </button>
            <span>/</span>
            <button 
              onClick={() => setLanguage('fr')}
              className={cn("transition-colors", language === 'fr' ? "text-moloss-dark-green font-bold" : "hover:text-moloss-black")}
            >
              FR
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
