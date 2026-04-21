import { Link } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const popularCategories = ['Plumber', 'Electrician', 'Tutor', 'Car Repair', 'Gardener', 'House Cleaner'];

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-foreground text-background mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Wrench size={18} className="text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">ServiceFinder</span>
            </div>
            <p className="text-background/70 text-sm max-w-xs">{t('footer', 'tagline')}</p>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-background/50">{t('nav', 'company')}</h4>
            <ul className="space-y-2">
              {[
                { label: t('nav', 'aboutUs'), href: '/company' },
                { label: t('nav', 'contact'), href: '/contact' },
                { label: t('nav', 'support'), href: '/support' },
                { label: t('footer', 'privacy'), href: '/support' },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-background/70 hover:text-background transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-background/50">{t('footer', 'quickLinks')}</h4>
            <ul className="space-y-2">
              {[
                { label: t('nav', 'home'), href: '/' },
                { label: t('nav', 'findServices'), href: '/search' },
                { label: t('nav', 'howItWorks'), href: '/#how-it-works' },
                { label: t('nav', 'admin'), href: '/admin' },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-background/70 hover:text-background transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-background/50">
              {t('footer', 'categories')}
            </h4>
            <ul className="space-y-2">
              {popularCategories.map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/search?category=${encodeURIComponent(cat)}`}
                    className="text-sm text-background/70 hover:text-background transition-colors"
                  >
                    {t('categories', cat)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-8 pt-6 text-center text-sm text-background/50">
          {t('footer', 'copyright')}
        </div>
      </div>
    </footer>
  );
}

