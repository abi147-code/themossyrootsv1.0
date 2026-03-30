import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/i18n';

type NavbarProps = {
  basePath: string;
  blogPath: string;
};

export default function Navbar({ basePath, blogPath }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  const navLinks = [
    { name: t('nav.menu'), href: `${basePath}/#menu` },
    { name: t('nav.story'), href: `${basePath}/#story` },
    { name: t('nav.locations'), href: `${basePath}/#locations` },
    { name: t('nav.blog'), href: blogPath },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out',
        isScrolled
          ? 'bg-moloss-white/90 backdrop-blur-md shadow-sm py-4'
          : 'bg-transparent py-6'
      )}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        <Link href={basePath} className="flex items-center">
          <img
            src="/demo-assets/moloss/logo/moloss-logo.png"
            alt="Moloss logo"
            className="h-16 md:h-20 w-auto object-contain"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "font-medium text-sm uppercase tracking-wider transition-colors hover:text-moloss-light-green",
                isScrolled ? "text-moloss-black" : "text-moloss-white drop-shadow-sm"
              )}
            >
              {link.name}
            </Link>
          ))}
          <button
            onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
            className={cn(
              "font-bold text-sm uppercase tracking-wider transition-colors hover:text-moloss-light-green",
              isScrolled ? "text-moloss-black" : "text-moloss-white drop-shadow-sm"
            )}
          >
            {language === 'en' ? 'FR' : 'EN'}
          </button>
          <Link
            href={`${basePath}/#locations`}
            className={cn(
              "px-6 py-2.5 rounded-full font-bold text-sm uppercase tracking-wider transition-transform hover:scale-105 active:scale-95",
              isScrolled
                ? "bg-moloss-dark-green text-moloss-white"
                : "bg-moloss-white text-moloss-dark-green"
            )}
          >
            {t('nav.findUs')}
          </Link>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className={cn(
            "md:hidden p-2 rounded-full",
            isScrolled ? "text-moloss-black" : "text-moloss-white"
          )}
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu size={28} />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: '-100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-moloss-dark-green flex flex-col"
          >
            <div className="p-6 flex justify-between items-center">
              <Link href={basePath} className="flex items-center">
                <img
                  src="/demo-assets/moloss/logo/moloss-logo.png"
                  alt="Moloss logo"
                  className="h-16 w-auto object-contain"
                />
              </Link>
              <button
                className="p-2 text-moloss-white rounded-full bg-moloss-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X size={28} />
              </button>
            </div>
            <nav className="flex-1 flex flex-col items-center justify-center gap-6 sm:gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="font-display text-3xl sm:text-4xl font-bold uppercase text-moloss-white hover:text-moloss-ice transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <button
                onClick={() => {
                  setLanguage(language === 'en' ? 'fr' : 'en');
                  setIsMobileMenuOpen(false);
                }}
                className="font-display text-3xl sm:text-4xl font-bold uppercase text-moloss-white hover:text-moloss-ice transition-colors"
              >
                {language === 'en' ? 'FR' : 'EN'}
              </button>
              <Link
                href={`${basePath}/#locations`}
                className="mt-6 sm:mt-8 px-8 py-4 rounded-full bg-moloss-ice text-moloss-dark-green font-bold text-base sm:text-lg uppercase tracking-wider"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.findUs')}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
