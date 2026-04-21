import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Phone, Mail, MapPin, Globe, ArrowLeft, Copy, CheckCheck,
  Briefcase, DollarSign, AlertCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCategoryIcon } from '@/lib/categoryIcons';
import StarRating from '@/components/StarRating';
import ProviderCard, { type Provider } from '@/components/ProviderCard';
import ChatBot from '@/components/ChatBot';

export default function ProviderProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [provider, setProvider] = useState<Provider & { description?: string; years_experience?: number; hourly_rate?: string; languages?: string; lat?: number; lng?: number; zip?: string; state?: string; address?: string; email?: string; phone?: string } | null>(null);
  const [related, setRelated] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/providers/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setProvider(d.provider);
        setRelated(d.related || []);
      })
      .catch(() => setProvider(null))
      .finally(() => setLoading(false));
  }, [id]);

  function copyToClipboard(text: string, type: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-48 bg-muted rounded-xl" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-muted rounded-xl" />
            <div className="h-32 bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <AlertCircle size={48} className="text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Provider not found</h2>
        <button onClick={() => navigate('/search')} className="text-primary hover:underline">
          {t('provider', 'backToResults')}
        </button>
      </div>
    );
  }

  const Icon = getCategoryIcon(provider.category);
  const availabilityColor =
    provider.availability === 'available' ? 'bg-green-100 text-green-700' :
    provider.availability === 'busy' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';

  const availabilityLabel =
    provider.availability === 'available' ? t('provider', 'available') :
    provider.availability === 'busy' ? t('provider', 'busy') : t('provider', 'unavailable');

  return (
    <>
      <title>{provider.name} — ServiceFinder</title>
      <meta name="description" content={provider.description || `${provider.name} — ${provider.category} in ${provider.city}`} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          {t('provider', 'backToResults')}
        </button>

        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card border border-border rounded-2xl p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon size={32} className="text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-start gap-2 mb-2">
                <h1 className="text-2xl font-bold text-foreground">{provider.name}</h1>
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${availabilityColor}`}>
                  {availabilityLabel}
                </span>
              </div>
              <span className="inline-block bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full mb-3">
                {provider.category}
              </span>
              <div className="flex items-center gap-3 flex-wrap">
                <StarRating rating={provider.rating} size={18} showValue reviewCount={provider.review_count} />
                {provider.city && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin size={14} />
                    {provider.city}, {provider.state}
                  </span>
                )}
              </div>
            </div>
            {provider.phone && (
              <a
                href={`tel:${provider.phone}`}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors flex-shrink-0"
              >
                <Phone size={16} />
                {t('provider', 'contactNow')}
              </a>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="md:col-span-2 space-y-6">
            {/* About */}
            {provider.description && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <h2 className="font-semibold text-foreground mb-3">{t('provider', 'about')}</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">{provider.description}</p>
              </div>
            )}

            {/* Contact */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h2 className="font-semibold text-foreground mb-4">{t('provider', 'contact')}</h2>
              <div className="space-y-3">
                {provider.phone && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Phone size={16} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t('provider', 'phone')}</p>
                        <a href={`tel:${provider.phone}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                          {provider.phone}
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(provider.phone!, 'phone')}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copied === 'phone' ? <CheckCheck size={14} className="text-secondary" /> : <Copy size={14} />}
                      {copied === 'phone' ? t('provider', 'copied') : t('provider', 'copyPhone')}
                    </button>
                  </div>
                )}
                {provider.email && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-accent/10 rounded-lg flex items-center justify-center">
                        <Mail size={16} className="text-accent" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t('provider', 'email')}</p>
                        <a href={`mailto:${provider.email}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                          {provider.email}
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(provider.email!, 'email')}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copied === 'email' ? <CheckCheck size={14} className="text-secondary" /> : <Copy size={14} />}
                      {copied === 'email' ? t('provider', 'copied') : t('provider', 'copyEmail')}
                    </button>
                  </div>
                )}
                {provider.address && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <MapPin size={16} className="text-secondary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('provider', 'address')}</p>
                      <p className="text-sm font-medium text-foreground">
                        {provider.address}, {provider.city}, {provider.state} {provider.zip}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Details */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <h2 className="font-semibold text-foreground">{t('provider', 'location')}</h2>
              {provider.years_experience && (
                <div className="flex items-center gap-3">
                  <Briefcase size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t('provider', 'experience')}</p>
                    <p className="text-sm font-medium">{provider.years_experience} years</p>
                  </div>
                </div>
              )}
              {provider.hourly_rate && (
                <div className="flex items-center gap-3">
                  <DollarSign size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t('provider', 'rate')}</p>
                    <p className="text-sm font-medium">{provider.hourly_rate}</p>
                  </div>
                </div>
              )}
              {provider.languages && (
                <div className="flex items-center gap-3">
                  <Globe size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t('provider', 'languages')}</p>
                    <p className="text-sm font-medium">{provider.languages}</p>
                  </div>
                </div>
              )}
              {provider.lat && provider.lng && (
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Coordinates</p>
                    <p className="text-xs font-mono text-muted-foreground">{provider.lat.toFixed(4)}, {provider.lng.toFixed(4)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Rating breakdown */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h2 className="font-semibold text-foreground mb-3">{t('provider', 'rating')}</h2>
              <div className="text-center mb-3">
                <div className="text-4xl font-bold text-foreground">{provider.rating.toFixed(1)}</div>
                <StarRating rating={provider.rating} size={20} />
                <p className="text-xs text-muted-foreground mt-1">{provider.review_count} {t('provider', 'reviews')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Providers */}
        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-foreground mb-4">{t('provider', 'related')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((p, i) => (
                <ProviderCard key={p.id} provider={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>

      <ChatBot />
    </>
  );
}
