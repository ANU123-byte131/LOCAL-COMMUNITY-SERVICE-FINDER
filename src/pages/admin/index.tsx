import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, LogOut, Users, Tag, Star, X, Save } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { CATEGORIES } from '@/lib/i18n';
import StarRating from '@/components/StarRating';

interface Provider {
  id: number;
  name: string;
  category: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  lat?: number;
  lng?: number;
  rating: number;
  review_count: number;
  availability: string;
  years_experience?: number;
  hourly_rate?: string;
  languages?: string;
}

const emptyForm: Omit<Provider, 'id'> = {
  name: '', category: CATEGORIES[0], description: '', phone: '', email: '',
  address: '', city: '', state: '', zip: '', lat: undefined, lng: undefined,
  rating: 0, review_count: 0, availability: 'available', years_experience: undefined,
  hourly_rate: '', languages: '',
};

function getAuthHeader() {
  return 'Basic ' + btoa('admin:admin123');
}

export default function AdminPage() {
  const { t } = useLanguage();
  const [authed, setAuthed] = useState(() => localStorage.getItem('sf-admin') === 'true');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [providers, setProviders] = useState<Provider[]>([]);
  const [stats, setStats] = useState({ total: 0, categories: 0, avgRating: 0 });
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<Provider, 'id'>>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authed) fetchData();
  }, [authed]);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/providers', {
        headers: { Authorization: getAuthHeader() },
      });
      if (res.status === 401) { logout(); return; }
      const data = await res.json();
      setProviders(data.providers || []);
      setStats(data.stats || { total: 0, categories: 0, avgRating: 0 });
    } catch {}
    setLoading(false);
  }

  function login() {
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('sf-admin', 'true');
      setAuthed(true);
      setLoginError('');
    } else {
      setLoginError('Invalid credentials. Use admin / admin123');
    }
  }

  function logout() {
    localStorage.removeItem('sf-admin');
    setAuthed(false);
  }

  function openAdd() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(p: Provider) {
    const { id, ...rest } = p;
    setForm(rest);
    setEditingId(id);
    setShowForm(true);
  }

  async function saveProvider() {
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/providers/${editingId}` : '/api/admin/providers';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: getAuthHeader() },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        fetchData();
      }
    } catch {}
    setSaving(false);
  }

  async function deleteProvider(id: number) {
    if (!confirm(t('admin', 'confirmDelete'))) return;
    await fetch(`/api/admin/providers/${id}`, {
      method: 'DELETE',
      headers: { Authorization: getAuthHeader() },
    });
    fetchData();
  }

  function updateForm(key: keyof typeof form, value: string | number) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  if (!authed) {
    return (
      <>
        <title>Admin Login — ServiceFinder</title>
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-sm shadow-lg">
            <h1 className="text-2xl font-bold text-foreground mb-2">{t('admin', 'title')}</h1>
            <p className="text-muted-foreground text-sm mb-6">{t('admin', 'login')}</p>
            {loginError && (
              <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-lg mb-4">{loginError}</div>
            )}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">{t('admin', 'username')}</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && login()}
                  className="w-full bg-muted border-0 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="admin"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">{t('admin', 'password')}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && login()}
                  className="w-full bg-muted border-0 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="admin123"
                />
              </div>
              <button
                onClick={login}
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                {t('admin', 'loginBtn')}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">Demo: admin / admin123</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <title>Admin Panel — ServiceFinder</title>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">{t('admin', 'dashboard')}</h1>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut size={16} />
            {t('admin', 'logout')}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { icon: Users, label: t('admin', 'totalProviders'), value: stats.total, color: 'text-primary bg-primary/10' },
            { icon: Tag, label: t('admin', 'categories'), value: stats.categories, color: 'text-secondary bg-secondary/10' },
            { icon: Star, label: t('admin', 'avgRating'), value: stats.avgRating, color: 'text-yellow-500 bg-yellow-50' },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Add button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} />
            {t('admin', 'addProvider')}
          </button>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  {[t('admin', 'name'), t('admin', 'category'), t('admin', 'city'), t('admin', 'ratingField'), t('admin', 'availabilityField'), t('admin', 'actions')].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : providers.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                    <td className="px-4 py-3">
                      <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">{p.category}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.city}, {p.state}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <StarRating rating={p.rating} size={12} />
                        <span className="text-xs text-muted-foreground">{p.rating}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        p.availability === 'available' ? 'bg-green-100 text-green-700' :
                        p.availability === 'busy' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {p.availability}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => deleteProvider(p.id)} className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card">
                <h2 className="font-bold text-lg">{editingId ? t('admin', 'editProvider') : t('admin', 'addProvider')}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'name', label: t('admin', 'name'), required: true },
                  { key: 'phone', label: t('admin', 'phone') },
                  { key: 'email', label: t('admin', 'emailField') },
                  { key: 'address', label: t('admin', 'address') },
                  { key: 'city', label: t('admin', 'city') },
                  { key: 'state', label: t('admin', 'state') },
                  { key: 'zip', label: t('admin', 'zip') },
                  { key: 'lat', label: t('admin', 'lat'), type: 'number' },
                  { key: 'lng', label: t('admin', 'lng'), type: 'number' },
                  { key: 'rating', label: t('admin', 'ratingField'), type: 'number' },
                  { key: 'review_count', label: t('admin', 'reviewCount'), type: 'number' },
                  { key: 'years_experience', label: t('admin', 'yearsExp'), type: 'number' },
                  { key: 'hourly_rate', label: t('admin', 'hourlyRate') },
                  { key: 'languages', label: t('admin', 'languagesField') },
                ].map(({ key, label, required, type }) => (
                  <div key={key}>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                      {label}{required && ' *'}
                    </label>
                    <input
                      type={type || 'text'}
                      value={(form as any)[key] ?? ''}
                      onChange={(e) => updateForm(key as any, type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                      className="w-full bg-muted border-0 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                ))}

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">{t('admin', 'category')} *</label>
                  <select
                    value={form.category}
                    onChange={(e) => updateForm('category', e.target.value)}
                    className="w-full bg-muted border-0 rounded-xl px-3 py-2 text-sm outline-none"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">{t('admin', 'availabilityField')}</label>
                  <select
                    value={form.availability}
                    onChange={(e) => updateForm('availability', e.target.value)}
                    className="w-full bg-muted border-0 rounded-xl px-3 py-2 text-sm outline-none"
                  >
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">{t('admin', 'description')}</label>
                  <textarea
                    value={form.description || ''}
                    onChange={(e) => updateForm('description', e.target.value)}
                    rows={3}
                    className="w-full bg-muted border-0 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 p-5 border-t border-border">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
                >
                  {t('admin', 'cancel')}
                </button>
                <button
                  onClick={saveProvider}
                  disabled={saving || !form.name}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving ? '...' : t('admin', 'save')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
