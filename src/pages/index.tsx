import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, ArrowRight, CheckCircle, Locate, Loader2, Map, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '@/contexts/LanguageContext';
import { CATEGORIES } from '@/lib/i18n';
import { getCategoryIcon } from '@/lib/categoryIcons';
import ProviderCard, { type Provider } from '@/components/ProviderCard';
import ChatBot from '@/components/ChatBot';

const MapView = lazy(() => import('@/components/MapView'));

export default function HomePage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'done' | 'error' | 'manual'>('idle');
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [locationName, setLocationName] = useState('');
  const [featured, setFeatured] = useState<Provider[]>([]);
  const [nearbyProviders, setNearbyProviders] = useState<Provider[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState('');
  const manualInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/providers?limit=6&sortBy=rating')
      .then((r) => r.json())
      .then((d) => setFeatured(d.providers || []))
      .catch(() => {});
  }, []);

  async function reverseGeocode(lat: number, lng: number) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || '';
      const state = data.address?.state || '';
      setLocationName(city ? `${city}${state ? ', ' + state : ''}` : 'Your Location');
    } catch {
      setLocationName('Your Location');
    }
  }

  async function fetchNearby(lat: number, lng: number) {
    try {
      const res = await fetch(`/api/providers?lat=${lat}&lng=${lng}&radius=25&limit=20&sortBy=distance`);
      const data = await res.json();
      setNearbyProviders(data.providers || []);
    } catch {
      setNearbyProviders([]);
    }
  }

  function detectLocation() {
    setLocationStatus('loading');
    if (!navigator.geolocation) {
      setLocationStatus('manual');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLat(lat);
        setUserLng(lng);
        setLocationStatus('done');
        reverseGeocode(lat, lng);
        fetchNearby(lat, lng);
        setShowMap(true);
      },
      (err) => {
        // PERMISSION_DENIED (1) or not supported in iframe → show manual input
        if (err.code === 1 || !navigator.geolocation) {
          setLocationStatus('manual');
        } else {
          setLocationStatus('manual'); // fallback to manual for any error
        }
        setTimeout(() => manualInputRef.current?.focus(), 100);
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }

  async function geocodeManualInput() {
    if (!manualInput.trim()) return;
    setGeocoding(true);
    setGeocodeError('');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(manualInput)}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const displayName = data[0].display_name?.split(',').slice(0, 2).join(', ') || manualInput;
        setUserLat(lat);
        setUserLng(lng);
        setLocationName(displayName);
        setLocationStatus('done');
        fetchNearby(lat, lng);
        setShowMap(true);
      } else {
        setGeocodeError('Location not found. Try a different city or address.');
      }
    } catch {
      setGeocodeError('Could not look up location. Check your connection.');
    } finally {
      setGeocoding(false);
    }
  }

  function clearLocation() {
    setUserLat(null);
    setUserLng(null);
    setLocationName('');
    setLocationStatus('idle');
    setNearbyProviders([]);
    setShowMap(false);
    setManualInput('');
    setGeocodeError('');
  }

  function handleSearch() {
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (userLat && userLng) {
      params.set('lat', String(userLat));
      params.set('lng', String(userLng));
    }
    navigate(`/search?${params.toString()}`);
  }

  function handleCategoryClick(cat: string) {
    const params = new URLSearchParams({ category: cat });
    if (userLat && userLng) {
      params.set('lat', String(userLat));
      params.set('lng', String(userLng));
    }
    navigate(`/search?${params.toString()}`);
  }

  const steps = [
    { icon: Search, title: t('howItWorks', 'step1Title'), desc: t('howItWorks', 'step1Desc') },
    { icon: Star, title: t('howItWorks', 'step2Title'), desc: t('howItWorks', 'step2Desc') },
    { icon: CheckCircle, title: t('howItWorks', 'step3Title'), desc: t('howItWorks', 'step3Desc') },
  ];

  return (
    <>
      <title>ServiceFinder — Find Trusted Local Services</title>
      <meta name="description" content="Find trusted local service providers near you. Plumbers, electricians, tutors, and more." />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
          >
            {t('hero', 'headline')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto"
          >
            {t('hero', 'subheadline')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-card rounded-2xl p-3 shadow-xl flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto"
          >
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t('hero', 'searchPlaceholder')}
              className="flex-1 px-4 py-3 text-foreground bg-transparent outline-none placeholder:text-muted-foreground text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={detectLocation}
                disabled={locationStatus === 'loading'}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors flex-shrink-0 ${
                  locationStatus === 'done'
                    ? 'bg-secondary/10 text-secondary'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                } disabled:opacity-60`}
              >
                {locationStatus === 'loading'
                  ? <Loader2 size={16} className="animate-spin" />
                  : locationStatus === 'done'
                  ? <MapPin size={16} />
                  : <Locate size={16} />}
                <span className="hidden sm:inline">
                  {locationStatus === 'loading' ? 'Detecting...'
                    : locationStatus === 'done' ? (locationName || 'Located')
                    : t('hero', 'detectLocation')}
                </span>
              </button>              <button
                onClick={handleSearch}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                <Search size={16} />
                {t('hero', 'search')}
              </button>
            </div>
          </motion.div>

          {/* Manual location input — shown when GPS is blocked/denied */}
          {locationStatus === 'manual' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 max-w-2xl mx-auto"
            >
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                <p className="text-sm text-primary-foreground/80 mb-3 flex items-center gap-2">
                  <MapPin size={14} />
                  GPS access is blocked in this browser. Enter your city or address to find nearby services:
                </p>
                <div className="flex gap-2">
                  <input
                    ref={manualInputRef}
                    type="text"
                    value={manualInput}
                    onChange={(e) => { setManualInput(e.target.value); setGeocodeError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && geocodeManualInput()}
                    placeholder="e.g. Mumbai, New York, London..."
                    className="flex-1 bg-white/90 text-foreground placeholder:text-muted-foreground rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <button
                    onClick={geocodeManualInput}
                    disabled={geocoding || !manualInput.trim()}
                    className="flex items-center gap-2 bg-white text-primary px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-60"
                  >
                    {geocoding ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                    Find
                  </button>
                  <button onClick={clearLocation} className="text-primary-foreground/60 hover:text-primary-foreground px-2">
                    <X size={16} />
                  </button>
                </div>
                {geocodeError && (
                  <p className="mt-2 text-xs text-red-300">{geocodeError}</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Location confirmed badge */}
          {locationStatus === 'done' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center justify-center gap-2"
            >
              <span className="flex items-center gap-1.5 bg-white/15 text-primary-foreground text-sm px-3 py-1.5 rounded-full">
                <MapPin size={13} />
                Showing services near <strong>{locationName || 'your location'}</strong>
                <button onClick={clearLocation} className="ml-1 opacity-60 hover:opacity-100">
                  <X size={12} />
                </button>
              </span>
            </motion.div>
          )}
        </div>
      </section>

      {/* Nearby Map Section — shown after location detected */}
      {locationStatus === 'done' && showMap && (
        <section className="py-10 px-4 bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Map size={22} className="text-primary" />
                  Services Near {locationName || 'You'}
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  {nearbyProviders.length} providers found within 25 miles
                </p>
              </div>
              <button
                onClick={() => navigate(`/search?lat=${userLat}&lng=${userLng}&sortBy=distance`)}
                className="flex items-center gap-1 text-primary font-medium text-sm hover:underline"
              >
                View All <ArrowRight size={16} />
              </button>
            </div>
            <div className="h-[420px] rounded-2xl overflow-hidden shadow-lg border border-border">
              <Suspense fallback={
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Loader2 size={24} className="animate-spin text-primary" />
                </div>
              }>
                <MapView providers={nearbyProviders} userLat={userLat} userLng={userLng} />
              </Suspense>
            </div>
            {nearbyProviders.length > 0 && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {nearbyProviders.slice(0, 6).map((p, i) => (
                  <ProviderCard key={p.id} provider={p} index={i} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-2">{t('categories', 'title')}</h2>
            <p className="text-muted-foreground">{t('categories', 'subtitle')}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {CATEGORIES.map((cat, i) => {
              const Icon = getCategoryIcon(cat);
              return (
                <motion.button
                  key={cat}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  whileHover={{ y: -3 }}
                  onClick={() => handleCategoryClick(cat)}
                  className="flex flex-col items-center gap-2 p-4 bg-card rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <span className="text-xs font-medium text-foreground text-center leading-tight">
                    {t('categories', cat)}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">{t('howItWorks', 'title')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                    <Icon size={28} className="text-primary-foreground" />
                  </div>
                  <div className="text-4xl font-bold text-primary/20 mb-1">{i + 1}</div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Providers */}
      {featured.length > 0 && (
        <section className="py-16 px-4 bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground">{t('featured', 'title')}</h2>
                <p className="text-muted-foreground mt-1">{t('featured', 'subtitle')}</p>
              </div>
              <button
                onClick={() => navigate('/search')}
                className="flex items-center gap-1 text-primary font-medium text-sm hover:underline"
              >
                View All <ArrowRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map((p, i) => (
                <ProviderCard key={p.id} provider={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      <ChatBot />
    </>
  );
}
