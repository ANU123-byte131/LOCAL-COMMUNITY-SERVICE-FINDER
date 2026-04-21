import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import StarRating from './StarRating';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCategoryIcon } from '@/lib/categoryIcons';

export interface Provider {
  id: number;
  name: string;
  category: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  rating: number;
  review_count: number;
  availability: string;
  available?: boolean;
  years_experience?: number;
  hourly_rate?: string;
  price_range?: string;
  languages?: string;
  distance?: number | null;
  lat?: number | null;
  lng?: number | null;
}

interface ProviderCardProps {
  provider: Provider;
  index?: number;
}

export default function ProviderCard({ provider, index = 0 }: ProviderCardProps) {
  const { t } = useLanguage();
  const Icon = getCategoryIcon(provider.category);

  const availabilityColor =
    provider.availability === 'available'
      ? 'bg-green-100 text-green-700'
      : provider.availability === 'busy'
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-red-100 text-red-700';

  const availabilityLabel =
    provider.availability === 'available'
      ? t('provider', 'available')
      : provider.availability === 'busy'
      ? t('provider', 'busy')
      : t('provider', 'unavailable');

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: 'easeOut' as const }}
      whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
      className="bg-card rounded-xl border border-border overflow-hidden transition-shadow"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon size={22} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-base leading-tight">{provider.name}</h3>
              <span className="text-xs text-primary font-medium">{provider.category}</span>
            </div>
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${availabilityColor}`}>
            {availabilityLabel}
          </span>
        </div>

        {provider.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{provider.description}</p>
        )}

        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={provider.rating} size={14} showValue reviewCount={provider.review_count} />
        </div>

        <div className="space-y-1.5 mb-4">
          {provider.city && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin size={12} />
              <span>{provider.city}, {provider.state}</span>
              {provider.distance != null && (
                <span className="ml-auto bg-accent/10 text-accent font-medium px-2 py-0.5 rounded-full">
                  {provider.distance} mi
                </span>
              )}
            </div>
          )}
          {provider.hourly_rate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock size={12} />
              <span>{provider.hourly_rate}</span>
            </div>
          )}
          {provider.phone && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone size={12} />
              <span>{provider.phone}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Link
            to={`/provider/${provider.id}`}
            className="flex-1 flex items-center justify-center gap-1 bg-primary text-primary-foreground text-sm font-medium py-2 px-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            {t('provider', 'contact')}
            <ChevronRight size={14} />
          </Link>
          {provider.phone && (
            <a
              href={`tel:${provider.phone}`}
              className="flex items-center justify-center w-9 h-9 bg-secondary/10 text-secondary rounded-lg hover:bg-secondary/20 transition-colors"
              title={t('provider', 'phone')}
            >
              <Phone size={15} />
            </a>
          )}
          {provider.email && (
            <a
              href={`mailto:${provider.email}`}
              className="flex items-center justify-center w-9 h-9 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors"
              title={t('provider', 'email')}
            >
              <Mail size={15} />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
