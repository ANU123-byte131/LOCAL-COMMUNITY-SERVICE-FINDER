import { Users, Target, Globe, Award, TrendingUp, Heart } from 'lucide-react';

const stats = [
  { value: '35+', label: 'Service Categories' },
  { value: '500+', label: 'Verified Providers' },
  { value: '50K+', label: 'Happy Customers' },
  { value: '4.8★', label: 'Average Rating' },
];

const team = [
  { name: 'Alex Rivera', role: 'CEO & Co-Founder', bio: 'Former community organizer with 10+ years connecting people with local services.' },
  { name: 'Priya Nair', role: 'CTO & Co-Founder', bio: 'Full-stack engineer passionate about building platforms that empower local economies.' },
  { name: 'Marcus Chen', role: 'Head of Operations', bio: 'Ensures every provider on our platform meets our quality and trust standards.' },
  { name: 'Sofia Morales', role: 'Head of Growth', bio: 'Helps communities across the country discover and connect with great local talent.' },
];

const values = [
  { icon: Heart, title: 'Community First', desc: 'We exist to strengthen local communities by making it easy to find and support nearby professionals.' },
  { icon: Award, title: 'Trust & Quality', desc: 'Every provider is verified. We maintain high standards so you can hire with confidence.' },
  { icon: Globe, title: 'Inclusive Access', desc: 'Available in multiple languages so everyone — regardless of background — can access local services.' },
  { icon: TrendingUp, title: 'Empowering Providers', desc: 'We help skilled professionals grow their business and reach more customers in their community.' },
];

export default function CompanyPage() {

  return (
    <div className="min-h-screen">
      <title>About Us - ServiceFinder</title>
      <meta name="description" content="Learn about ServiceFinder's mission to connect communities with trusted local professionals." />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/5 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Users size={16} />
            Our Story
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            Connecting Communities with <span className="text-primary">Trusted Professionals</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ServiceFinder was founded with a simple belief: finding a reliable local professional should be easy, transparent, and accessible to everyone.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 px-4 bg-card border-y border-border">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-4xl font-bold text-primary mb-1">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 text-primary font-semibold mb-3">
              <Target size={18} />
              Our Mission
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Building Stronger Local Economies</h2>
            <p className="text-muted-foreground mb-4">
              We believe that local professionals are the backbone of every community. A great plumber, a dedicated tutor, a skilled electrician — these are the people who keep our neighborhoods running.
            </p>
            <p className="text-muted-foreground">
              ServiceFinder makes it effortless to discover, compare, and connect with these professionals — while helping providers grow their business and reputation in the community they serve.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card border border-border rounded-xl p-5">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <Icon size={20} className="text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{title}</h3>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">Meet the Team</h2>
            <p className="text-muted-foreground">The people behind ServiceFinder</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member) => (
              <div key={member.name} className="bg-card border border-border rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">{member.name[0]}</span>
                </div>
                <h3 className="font-semibold text-foreground mb-1">{member.name}</h3>
                <p className="text-xs text-primary font-medium mb-2">{member.role}</p>
                <p className="text-xs text-muted-foreground">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
