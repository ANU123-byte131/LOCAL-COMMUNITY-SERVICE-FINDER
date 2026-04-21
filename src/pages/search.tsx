import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, X, MapPin, ChevronLeft, ChevronRight, Map, List, Locate, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/contexts/LanguageContext';
import { CATEGORIES } from '@/lib/i18n';
import ProviderCard, { type Provider } from '@/components/ProviderCard';
import ChatBot from '@/components/ChatBot';

const MapView = lazy(() => import('@/components/MapView'));

export default function SearchPage() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [providers, setProviders] = useState<Provider[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Location state
  const [userLat, setUserLat] = useState<number | null>(
    searchParams.get('lat') ? Number(searchParams.get('lat')) : null
  );
  const [userLng, setUserLng] = useState<number | null>(
    searchParams.get('lng') ? Number(searchParams.get('lng')) : null
  );
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'done' | 'error' | 'manual'>(
    searchParams.get('lat') ? 'done' : 'idle'
  );
  const [locationName, setLocationName] = useState<string>('');
  const [manualInput, setManualInput] = useState('');
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState('');
  const manualInputRef = useRef<HTMLInputElement>(null);

  // Filter state
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('category') ? searchParams.get('category')!.split(',') : []
  );
  const [radius, setRadius] = useState(Number(searchParams.get('radius') || 25));
  const [minRating, setMinRating] = useState(Number(searchParams.get('minRating') || 0));
  const [availableOnly, setAvailableOnly] = useState(searchParams.get('availability') === 'available');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'rating');
  const [page, setPage] = useState(Number(searchParams.get('page') || 1));

  // Reverse geocode to get location name
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

  function detectLocation() {
    setLocationStatus('loading');
    if (!navigator.geolocation) {
      setLocationStatus('manual');
      setTimeout(() => manualInputRef.current?.focus(), 100);
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
        setSortBy('distance');
        setPage(1);
        const params = new URLSearchParams(window.location.search);
        params.set('lat', String(lat));
        params.set('lng', String(lng));
        navigate(`/search?${params.toString()}`, { replace: true });
      },
      () => {
        setLocationStatus('manual');
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
        setSortBy('distance');
        setPage(1);
        const params = new URLSearchParams(window.location.search);
        params.set('lat', String(lat));
        params.set('lng', String(lng));
        navigate(`/search?${params.toString()}`, { replace: true });
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
    setLocationStatus('idle');
    setLocationName('');
    const params = new URLSearchParams(window.location.search);
    params.delete('lat');
    params.delete('lng');
    navigate(`/search?${params.toString()}`, { replace: true });
  }

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.set('keyword', keyword);
      if (selectedCategories.length) params.set('category', selectedCategories.join(','));
      if (userLat) params.set('lat', String(userLat));
      if (userLng) params.set('lng', String(userLng));
      params.set('radius', String(radius));
      if (minRating > 0) params.set('minRating', String(minRating));
      if (availableOnly) params.set('availability', 'available');
      params.set('sortBy', sortBy);
      params.set('page', String(page));
      params.set('limit', '20');

      const res = await fetch(`/api/providers?${params.toString()}`);
      const data = await res.json();
      setProviders(data.providers || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }, [keyword, selectedCategories, userLat, userLng, radius, minRating, availableOnly, sortBy, page]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  // Reverse geocode on mount if lat/lng already in URL
  useEffect(() => {
    if (userLat && userLng && !locationName) {
      reverseGeocode(userLat, userLng);
    }
  }, []);

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
    setPage(1);
  }

  function clearFilters() {
    setSelectedCategories([]);
    setRadius(25);
    setMinRating(0);
    setAvailableOnly(false);
    setSortBy('rating');
    setPage(1);
  }

  const activeFilterCount = selectedCategories.length + (minRating > 0 ? 1 : 0) + (availableOnly ? 1 : 0);

  return (
    <>
      <title>Find Services — ServiceFinder</title>
      <meta name="description" content="Search and filter local service providers by category, rating, and distance." />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search + Location bar */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <div className="flex-1 min-w-0 flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5">
            <Search size={18} className="text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
              onKeyDown={(e) => e.key === 'Enter' && fetchProviders()}
              placeholder={t('search', 'placeholder')}
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground min-w-0"
            />
            {keyword && (
              <button onClick={() => { setKeyword(''); setPage(1); }}>
                <X size={16} className="text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

        {/* Location button */}
          {locationStatus === 'done' ? (
            <div className="flex items-center gap-1.5 bg-secondary/10 text-secondary px-3 py-2 rounded-xl text-sm font-medium border border-secondary/20">
              <MapPin size={14} />
              <span className="max-w-[120px] truncate hidden sm:inline">{locationName || 'Located'}</span>
              <button onClick={clearLocation} className="ml-1 hover:text-secondary/60">
                <X size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={detectLocation}
              disabled={locationStatus === 'loading'}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-card text-sm font-medium hover:bg-muted transition-colors disabled:opacity-60"
            >
              {locationStatus === 'loading'
                ? <Loader2 size={16} className="animate-spin" />
                : <Locate size={16} className="text-primary" />}
              <span className="hidden sm:inline">
                {locationStatus === 'loading' ? 'Detecting...' : 'Near Me'}
              </span>
            </button>
          )}

          {/* Filters button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              showFilters || activeFilterCount > 0
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card border-border text-foreground hover:bg-muted'
            }`}
          >
            <SlidersHorizontal size={16} />
            {t('search', 'filters')}
            {activeFilterCount > 0 && (
              <span className="bg-primary-foreground text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* View toggle */}
          <div className="flex items-center bg-card border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors ${
                viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <List size={16} />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors ${
                viewMode === 'map' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <Map size={16} />
              <span className="hidden sm:inline">Map</span>
            </button>
          </div>
        </div>

        {/* Manual location input — shown when GPS is blocked */}
        {locationStatus === 'manual' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-card border border-border rounded-xl px-4 py-3"
          >
            <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1.5">
              <MapPin size={14} className="text-primary" />
              GPS is blocked in this browser. Enter your city or address:
            </p>
            <div className="flex gap-2">
              <input
                ref={manualInputRef}
                type="text"
                value={manualInput}
                onChange={(e) => { setManualInput(e.target.value); setGeocodeError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && geocodeManualInput()}
                placeholder="e.g. Mumbai, New York, London..."
                className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={geocodeManualInput}
                disabled={geocoding || !manualInput.trim()}
                className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {geocoding ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                Find
              </button>
              <button onClick={clearLocation} className="text-muted-foreground hover:text-foreground px-2">
                <X size={16} />
              </button>
            </div>
            {geocodeError && <p className="mt-1.5 text-xs text-destructive">{geocodeError}</p>}
          </motion.div>
        )}

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="w-64 flex-shrink-0 hidden md:block"
              >
                <div className="bg-card border border-border rounded-xl p-4 sticky top-24 space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">{t('search', 'filters')}</h3>
                    {activeFilterCount > 0 && (
                      <button onClick={clearFilters} className="text-xs text-primary hover:underline">
                        {t('search', 'clearFilters')}
                      </button>
                    )}
                  </div>

                  {/* Near Me quick filter */}
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                    <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                      <MapPin size={12} className="text-primary" /> Location Filter
                    </p>
                    {locationStatus === 'done' ? (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-secondary font-medium truncate max-w-[120px]">{locationName || 'Located'}</span>
                        <button onClick={clearLocation} className="text-xs text-muted-foreground hover:text-destructive">Clear</button>
                      </div>
                    ) : locationStatus === 'manual' ? (
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={manualInput}
                          onChange={(e) => { setManualInput(e.target.value); setGeocodeError(''); }}
                          onKeyDown={(e) => e.key === 'Enter' && geocodeManualInput()}
                          placeholder="City or address..."
                          className="w-full bg-background border border-border rounded-md px-2 py-1.5 text-xs outline-none"
                        />
                        <button
                          onClick={geocodeManualInput}
                          disabled={geocoding || !manualInput.trim()}
                          className="w-full flex items-center justify-center gap-1 bg-primary text-primary-foreground rounded-md py-1.5 text-xs font-medium disabled:opacity-60"
                        >
                          {geocoding ? <Loader2 size={10} className="animate-spin" /> : <Search size={10} />}
                          Search Location
                        </button>
                        {geocodeError && <p className="text-xs text-destructive">{geocodeError}</p>}
                      </div>
                    ) : (
                      <button
                        onClick={detectLocation}
                        disabled={locationStatus === 'loading'}
                        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg py-1.5 text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
                      >
                        {locationStatus === 'loading' ? <Loader2 size={12} className="animate-spin" /> : <Locate size={12} />}
                        {locationStatus === 'loading' ? 'Detecting...' : 'Detect My Location'}
                      </button>
                    )}
                  </div>

                  {/* Categories */}
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      {t('search', 'category')}
                    </h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {CATEGORIES.map((cat) => (
                        <label key={cat} className="flex items-center gap-2 cursor-pointer py-1">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat)}
                            onChange={() => toggleCategory(cat)}
                            className="rounded border-border text-primary"
                          />
                          <span className="text-sm text-foreground">{t('categories', cat)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Radius */}
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      {t('search', 'radius')}: {radius} {t('search', 'miles')}
                    </h4>
                    <input
                      type="range"
                      min={1}
                      max={50}
                      value={radius}
                      onChange={(e) => { setRadius(Number(e.target.value)); setPage(1); }}
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>1 mi</span>
                      <span>50 mi</span>
                    </div>
                  </div>

                  {/* Min Rating */}
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      {t('search', 'minRating')}
                    </h4>
                    <div className="flex gap-1">
                      {[0, 3, 4, 4.5].map((r) => (
                        <button
                          key={r}
                          onClick={() => { setMinRating(r); setPage(1); }}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            minRating === r ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {r === 0 ? 'All' : `${r}+`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('search', 'availability')}</span>
                    <button
                      onClick={() => { setAvailableOnly(!availableOnly); setPage(1); }}
                      className={`w-10 h-5 rounded-full transition-colors relative ${availableOnly ? 'bg-primary' : 'bg-muted'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${availableOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>

                  {/* Sort */}
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      {t('search', 'sortBy')}
                    </h4>
                    <select
                      value={sortBy}
                      onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                      className="w-full bg-muted border-0 rounded-lg px-3 py-2 text-sm outline-none"
                    >
                      <option value="rating">{t('search', 'sortRating')}</option>
                      <option value="distance">{t('search', 'sortDistance')}</option>
                      <option value="price">{t('search', 'sortPrice')}</option>
                    </select>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <p className="text-sm text-muted-foreground">
                {loading ? t('common', 'loading') : (
                  <>
                    {t('search', 'results').replace('{count}', String(total))}
                    {locationStatus === 'done' && (
                      <span className="ml-2 text-secondary font-medium">
                        · within {radius} mi of {locationName || 'you'}
                      </span>
                    )}
                  </>
                )}
              </p>
              <div className="flex flex-wrap gap-1">
                {selectedCategories.map((cat) => (
                  <span key={cat} className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                    {t('categories', cat)}
                    <button onClick={() => toggleCategory(cat)}><X size={10} /></button>
                  </span>
                ))}
              </div>
            </div>

            {/* Mobile filters */}
            {showFilters && (
              <div className="md:hidden bg-card border border-border rounded-xl p-4 mb-4 space-y-4">
                {/* Mobile location */}
                <div>
                  {locationStatus === 'done' ? (
                    <div className="flex items-center justify-between bg-secondary/10 rounded-lg px-3 py-2">
                      <span className="text-xs text-secondary font-medium flex items-center gap-1">
                        <MapPin size={12} /> {locationName || 'Located'}
                      </span>
                      <button onClick={clearLocation} className="text-xs text-muted-foreground">Clear</button>
                    </div>
                  ) : (
                    <button
                      onClick={detectLocation}
                      disabled={locationStatus === 'loading'}
                      className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg py-2 text-sm font-medium"
                    >
                      {locationStatus === 'loading' ? <Loader2 size={14} className="animate-spin" /> : <Locate size={14} />}
                      Detect My Location
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                      {t('search', 'radius')}: {radius}mi
                    </label>
                    <input type="range" min={1} max={50} value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="w-full accent-primary" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">{t('search', 'sortBy')}</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full bg-muted rounded-lg px-2 py-1.5 text-sm outline-none">
                      <option value="rating">{t('search', 'sortRating')}</option>
                      <option value="distance">{t('search', 'sortDistance')}</option>
                      <option value="price">{t('search', 'sortPrice')}</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        selectedCategories.includes(cat) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      {t('categories', cat)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Map View */}
            {viewMode === 'map' && (
              <div className="mb-4 h-[500px] rounded-xl overflow-hidden">
                <Suspense fallback={
                  <div className="w-full h-full bg-muted rounded-xl flex items-center justify-center">
                    <Loader2 size={24} className="animate-spin text-primary" />
                  </div>
                }>
                  <MapView
                    providers={providers}
                    userLat={userLat}
                    userLng={userLng}
                  />
                </Suspense>
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <>
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
                        <div className="flex gap-3 mb-3">
                          <div className="w-11 h-11 bg-muted rounded-lg" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4" />
                            <div className="h-3 bg-muted rounded w-1/2" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 bg-muted rounded" />
                          <div className="h-3 bg-muted rounded w-4/5" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : providers.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search size={28} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{t('search', 'noResults')}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{t('search', 'noResultsDesc')}</p>
                    <button onClick={clearFilters} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                      {t('search', 'clearFilters')}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {providers.map((p, i) => (
                        <ProviderCard key={p.id} provider={p} index={i} />
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-8">
                        <button
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border text-sm font-medium disabled:opacity-50 hover:bg-muted transition-colors"
                        >
                          <ChevronLeft size={16} />
                          {t('search', 'prev')}
                        </button>
                        <span className="text-sm text-muted-foreground">
                          {t('search', 'page')} {page} {t('search', 'of')} {totalPages}
                        </span>
                        <button
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border text-sm font-medium disabled:opacity-50 hover:bg-muted transition-colors"
                        >
                          {t('search', 'next')}
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* Split view: list + map side by side on large screens */}
          </div>
        </div>
      </div>

      <ChatBot />
    </>
  );
}
