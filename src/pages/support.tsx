import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, BookOpen, MessageCircle, Video, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const faqs = [
  {
    category: 'Getting Started',
    items: [
      { q: 'How do I find a service provider near me?', a: 'Use the search bar on the homepage or click "Find Services" in the navigation. Enter the service you need and your location, then browse results filtered by distance, rating, and availability.' },
      { q: 'Is ServiceFinder free to use?', a: 'Yes! Searching for and contacting service providers is completely free for customers. Providers may have listing fees for premium features.' },
      { q: 'How do I contact a provider?', a: 'Click on any provider card to view their full profile. You\'ll find their phone number and email address there. You can call or email them directly.' },
    ],
  },
  {
    category: 'For Service Providers',
    items: [
      { q: 'How do I list my business on ServiceFinder?', a: 'Contact us at providers@servicefinder.com with your business details. Our team will review your application and get you set up within 2–3 business days.' },
      { q: 'How are providers verified?', a: 'We verify provider identity, licenses (where applicable), and review their history. Providers with the "Verified" badge have passed our full verification process.' },
      { q: 'Can I update my profile information?', a: 'Yes. Contact our support team or use the Admin panel if you have admin access to update your listing details, availability, and pricing.' },
    ],
  },
  {
    category: 'Account & Privacy',
    items: [
      { q: 'Do I need an account to search for services?', a: 'No account is needed to browse and search for providers. You can contact providers directly without signing up.' },
      { q: 'How is my data used?', a: 'We only use your location data to show nearby providers. We do not sell your personal data to third parties. See our Privacy Policy for full details.' },
      { q: 'How do I report a problem with a provider?', a: 'Use the "Report an Issue" option on the Contact page, or email us at support@servicefinder.com. We take all reports seriously and investigate promptly.' },
    ],
  },
];

const resources = [
  { icon: BookOpen, title: 'User Guide', desc: 'Step-by-step guide to using ServiceFinder', href: '/contact' },
  { icon: Video, title: 'Video Tutorials', desc: 'Watch how to find and connect with providers', href: '/contact' },
  { icon: FileText, title: 'Provider Handbook', desc: 'Everything providers need to know', href: '/contact' },
  { icon: MessageCircle, title: 'Live Chat', desc: 'Chat with our support team in real time', href: '/contact' },
];

export default function SupportPage() {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const toggle = (key: string) => {
    setOpenItems(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const filteredFaqs = faqs.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      !search || item.q.toLowerCase().includes(search.toLowerCase()) || item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="min-h-screen">
      <title>Support - ServiceFinder</title>
      <meta name="description" content="Get help with ServiceFinder. Browse FAQs, guides, and contact our support team." />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/5 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">How Can We Help?</h1>
          <p className="text-muted-foreground mb-8">Search our knowledge base or browse the FAQs below.</p>
          <div className="relative max-w-xl mx-auto">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10 h-12 text-base"
              placeholder="Search for answers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-12 px-4 border-b border-border">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {resources.map(({ icon: Icon, title, desc, href }) => (
            <Link key={title} to={href} className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-sm transition-all group text-center">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                <Icon size={20} className="text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">{title}</h3>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Frequently Asked Questions</h2>

          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-4">No results found for "{search}"</p>
              <Button variant="outline" onClick={() => setSearch('')}>Clear Search</Button>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredFaqs.map((cat) => (
                <div key={cat.category}>
                  <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">{cat.category}</h3>
                  <div className="space-y-2">
                    {cat.items.map((item, i) => {
                      const key = `${cat.category}-${i}`;
                      const isOpen = openItems.includes(key);
                      return (
                        <div key={key} className="bg-card border border-border rounded-xl overflow-hidden">
                          <button
                            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors"
                            onClick={() => toggle(key)}
                          >
                            <span className="font-medium text-foreground text-sm">{item.q}</span>
                            {isOpen ? <ChevronUp size={16} className="text-muted-foreground shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground shrink-0" />}
                          </button>
                          {isOpen && (
                            <div className="px-5 pb-4 text-sm text-muted-foreground border-t border-border pt-3">
                              {item.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
            <h3 className="font-bold text-foreground mb-2">Still need help?</h3>
            <p className="text-muted-foreground text-sm mb-4">Our support team is ready to assist you.</p>
            <Link to="/contact">
              <Button>Contact Support</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
