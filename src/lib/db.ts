import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.resolve('./data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'providers.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS providers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    lat REAL,
    lng REAL,
    rating REAL DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    availability TEXT DEFAULT 'available',
    years_experience INTEGER,
    hourly_rate TEXT,
    languages TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// Seed data if empty
const count = (db.prepare('SELECT COUNT(*) as c FROM providers').get() as { c: number }).c;
if (count === 0) {
  const insert = db.prepare(`
    INSERT INTO providers (name, category, description, phone, email, address, city, state, zip, lat, lng, rating, review_count, availability, years_experience, hourly_rate, languages)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const providers = [
    // Plumbers
    ['Mikes Plumbing Co', 'Plumber', 'Expert plumbing services for residential and commercial properties. Specializing in leak repairs, pipe installations, and drain cleaning.', '(212) 555-0101', 'mike@mikesplumbing.com', '123 Main St', 'New York', 'NY', '10001', 40.7128, -74.0060, 4.8, 142, 'available', 12, '$85/hr', 'English,Spanish'],
    ['QuickFix Plumbers', 'Plumber', 'Fast and reliable plumbing solutions. Available 24/7 for emergencies. Licensed and insured.', '(212) 555-0102', 'info@quickfixplumbing.com', '456 Park Ave', 'New York', 'NY', '10022', 40.7580, -73.9855, 4.5, 89, 'available', 8, '$75/hr', 'English'],
    ['LA Pipe Masters', 'Plumber', 'Professional plumbing services in Los Angeles. Water heater installation, sewer repair, and more.', '(310) 555-0201', 'contact@lapipemasters.com', '789 Sunset Blvd', 'Los Angeles', 'CA', '90028', 34.0928, -118.3287, 4.7, 203, 'available', 15, '$90/hr', 'English,Spanish'],

    // Electricians
    ['Bright Spark Electric', 'Electrician', 'Licensed electricians for all your electrical needs. Panel upgrades, wiring, outlets, and more.', '(212) 555-0103', 'info@brightspark.com', '321 Broadway', 'New York', 'NY', '10007', 40.7127, -74.0134, 4.9, 178, 'available', 20, '$95/hr', 'English'],
    ['PowerPro Electrical', 'Electrician', 'Commercial and residential electrical services. Smart home installations, EV charger setup.', '(312) 555-0301', 'hello@powerpro.com', '500 Michigan Ave', 'Chicago', 'IL', '60611', 41.8919, -87.6247, 4.6, 115, 'available', 10, '$88/hr', 'English,Polish'],
    ['Volt Masters Chicago', 'Electrician', 'Expert electrical repairs and installations. Emergency services available 24/7.', '(312) 555-0302', 'service@voltmasters.com', '200 N Clark St', 'Chicago', 'IL', '60601', 41.8858, -87.6308, 4.4, 67, 'busy', 7, '$80/hr', 'English'],

    // Tutors
    ['Sarah Chen - Math Tutor', 'Tutor', 'PhD in Mathematics. Specializing in SAT/ACT prep, calculus, algebra, and statistics. All grade levels.', '(415) 555-0401', 'sarah@sarahtutor.com', '100 Market St', 'San Francisco', 'CA', '94105', 37.7935, -122.3964, 5.0, 94, 'available', 9, '$60/hr', 'English,Mandarin'],
    ['James Wilson - Science Tutor', 'Tutor', 'Former high school science teacher. Biology, chemistry, physics tutoring for middle and high school students.', '(212) 555-0104', 'james@jameswilson.com', '88 Wall St', 'New York', 'NY', '10005', 40.7069, -74.0089, 4.7, 56, 'available', 14, '$55/hr', 'English'],
    ['Priya Sharma - Language Tutor', 'Tutor', 'Certified ESL instructor. English, Hindi, and Spanish tutoring. Online and in-person sessions available.', '(408) 555-0501', 'priya@priyatutor.com', '200 E Santa Clara St', 'San Jose', 'CA', '95113', 37.3382, -121.8863, 4.8, 112, 'available', 6, '$50/hr', 'English,Hindi,Spanish'],

    // Carpenters
    ['Woodcraft Solutions', 'Carpenter', 'Custom furniture, cabinetry, and woodwork. Deck building, flooring installation, and renovations.', '(713) 555-0601', 'info@woodcraftsolutions.com', '1200 Main St', 'Houston', 'TX', '77002', 29.7604, -95.3698, 4.6, 88, 'available', 18, '$70/hr', 'English,Spanish'],
    ['Fine Finish Carpentry', 'Carpenter', 'Precision carpentry for homes and offices. Trim work, built-ins, and custom shelving.', '(212) 555-0105', 'contact@finefinish.com', '555 5th Ave', 'New York', 'NY', '10017', 40.7549, -73.9840, 4.5, 43, 'available', 11, '$75/hr', 'English'],

    // Car Repair
    ['AutoFix Pro', 'Car Repair', 'Full-service auto repair shop. Oil changes, brake service, engine diagnostics, and transmission repair.', '(602) 555-0701', 'service@autofixpro.com', '3000 E Van Buren St', 'Phoenix', 'AZ', '85008', 33.4484, -112.0740, 4.7, 234, 'available', 16, '$65/hr', 'English,Spanish'],
    ['City Motors Repair', 'Car Repair', 'Certified mechanics for all makes and models. Quick turnaround, honest pricing, and quality parts.', '(312) 555-0303', 'hello@citymotors.com', '400 W Madison St', 'Chicago', 'IL', '60606', 41.8819, -87.6414, 4.5, 167, 'available', 12, '$70/hr', 'English'],
    ['LA Auto Care', 'Car Repair', 'European and domestic car specialists. BMW, Mercedes, Toyota, Honda experts. Free diagnostics.', '(310) 555-0202', 'info@laautocare.com', '1500 Wilshire Blvd', 'Los Angeles', 'CA', '90017', 34.0522, -118.2437, 4.8, 189, 'available', 20, '$80/hr', 'English,Korean'],

    // Gardeners
    ['Green Thumb Gardens', 'Gardener', 'Lawn care, landscaping, tree trimming, and garden design. Weekly and monthly maintenance plans available.', '(503) 555-0801', 'info@greenthumb.com', '100 SW Broadway', 'Portland', 'OR', '97201', 45.5231, -122.6765, 4.9, 156, 'available', 13, '$45/hr', 'English'],
    ['Natures Best Landscaping', 'Gardener', 'Professional landscaping and garden maintenance. Irrigation systems, sod installation, and seasonal cleanup.', '(602) 555-0702', 'contact@naturesbest.com', '2000 N Central Ave', 'Phoenix', 'AZ', '85004', 33.4734, -112.0740, 4.6, 98, 'available', 9, '$50/hr', 'English,Spanish'],

    // House Cleaners
    ['Sparkle Clean Services', 'House Cleaner', 'Professional home cleaning services. Deep cleaning, regular maintenance, move-in/out cleaning.', '(212) 555-0106', 'book@sparkleclean.com', '200 W 57th St', 'New York', 'NY', '10019', 40.7659, -73.9832, 4.8, 312, 'available', 7, '$40/hr', 'English,Spanish'],
    ['Fresh Start Cleaning', 'House Cleaner', 'Eco-friendly cleaning products. Residential and commercial cleaning. Flexible scheduling.', '(415) 555-0402', 'info@freshstart.com', '500 California St', 'San Francisco', 'CA', '94104', 37.7929, -122.4013, 4.7, 201, 'available', 5, '$45/hr', 'English,Tagalog'],

    // Painters
    ['ColorPro Painting', 'Painter', 'Interior and exterior painting. Residential and commercial. Free color consultation and estimates.', '(404) 555-0901', 'info@colorpro.com', '100 Peachtree St', 'Atlanta', 'GA', '30303', 33.7490, -84.3880, 4.7, 145, 'available', 14, '$55/hr', 'English'],
    ['Perfect Finish Painters', 'Painter', 'High-quality painting services. Wallpaper removal, drywall repair, and cabinet refinishing.', '(713) 555-0602', 'contact@perfectfinish.com', '800 Texas Ave', 'Houston', 'TX', '77002', 29.7530, -95.3677, 4.5, 87, 'available', 10, '$50/hr', 'English,Spanish'],

    // HVAC Technicians
    ['CoolBreeze HVAC', 'HVAC Technician', 'AC and heating installation, repair, and maintenance. All brands serviced. Emergency calls welcome.', '(602) 555-0703', 'service@coolbreeze.com', '1000 N 7th Ave', 'Phoenix', 'AZ', '85007', 33.4484, -112.0840, 4.8, 223, 'available', 17, '$85/hr', 'English,Spanish'],
    ['Climate Control Pros', 'HVAC Technician', 'Residential and commercial HVAC services. Energy-efficient systems, smart thermostats, duct cleaning.', '(312) 555-0304', 'info@climatecontrol.com', '300 N LaSalle St', 'Chicago', 'IL', '60654', 41.8858, -87.6308, 4.6, 134, 'available', 12, '$90/hr', 'English'],

    // Locksmiths
    ['SecureKey Locksmith', 'Locksmith', '24/7 locksmith services. Lockouts, rekeying, lock installation, and security upgrades.', '(212) 555-0107', 'help@securekey.com', '700 7th Ave', 'New York', 'NY', '10036', 40.7580, -73.9855, 4.9, 267, 'available', 11, '$65/hr', 'English'],
    ['FastLock Solutions', 'Locksmith', 'Residential and commercial locksmith. Car lockouts, safe opening, and master key systems.', '(310) 555-0203', 'info@fastlock.com', '2000 Sunset Blvd', 'Los Angeles', 'CA', '90026', 34.0780, -118.2600, 4.7, 178, 'available', 8, '$70/hr', 'English,Spanish'],

    // Pet Care
    ['Happy Paws Pet Care', 'Pet Care', 'Dog walking, pet sitting, grooming, and training. Certified and insured. All breeds welcome.', '(503) 555-0802', 'info@happypaws.com', '200 NW 23rd Ave', 'Portland', 'OR', '97210', 45.5231, -122.6965, 4.9, 189, 'available', 6, '$35/hr', 'English'],
    ['Furry Friends Services', 'Pet Care', 'In-home pet care, boarding, and grooming. Cats, dogs, and small animals. GPS-tracked walks.', '(415) 555-0403', 'hello@furryfriends.com', '300 Castro St', 'San Francisco', 'CA', '94114', 37.7609, -122.4350, 4.8, 134, 'available', 4, '$40/hr', 'English,French'],

    // Moving Services
    ['Swift Movers', 'Moving Service', 'Local and long-distance moving. Packing services, furniture assembly, and storage solutions.', '(212) 555-0108', 'book@swiftmovers.com', '100 W 42nd St', 'New York', 'NY', '10036', 40.7549, -73.9840, 4.6, 312, 'available', 9, '$120/hr', 'English,Spanish'],
    ['EasyMove Chicago', 'Moving Service', 'Affordable moving services. Residential and office moves. Same-day service available.', '(312) 555-0305', 'info@easymove.com', '600 N Michigan Ave', 'Chicago', 'IL', '60611', 41.8919, -87.6247, 4.5, 198, 'available', 7, '$110/hr', 'English,Polish'],

    // IT Support
    ['TechFix IT Solutions', 'IT Support', 'Computer repair, network setup, cybersecurity, and IT consulting. On-site and remote support.', '(415) 555-0404', 'support@techfix.com', '101 Market St', 'San Francisco', 'CA', '94105', 37.7935, -122.3964, 4.8, 156, 'available', 13, '$75/hr', 'English,Mandarin'],
    ['Geek Squad Alternative', 'IT Support', 'Affordable tech support for homes and small businesses. Virus removal, data recovery, upgrades.', '(212) 555-0109', 'help@techsupport.com', '400 Madison Ave', 'New York', 'NY', '10017', 40.7549, -73.9840, 4.5, 89, 'available', 6, '$65/hr', 'English'],

    // Chef / Catering
    ['Chef Marco Catering', 'Chef / Catering', 'Private chef and catering for events. Italian and Mediterranean cuisine. Weddings, parties, corporate events.', '(212) 555-0110', 'marco@chefmarco.com', '200 E 42nd St', 'New York', 'NY', '10017', 40.7549, -73.9840, 4.9, 78, 'available', 20, '$150/hr', 'English,Italian,Spanish'],
    ['Flavor Fusion Catering', 'Chef / Catering', 'Multicultural cuisine catering. Asian fusion, Mexican, and American dishes. Dietary accommodations available.', '(310) 555-0204', 'info@flavorfusion.com', '3000 Wilshire Blvd', 'Los Angeles', 'CA', '90010', 34.0622, -118.3037, 4.7, 112, 'available', 12, '$120/hr', 'English,Spanish,Mandarin'],

    // Personal Trainers
    ['FitLife Training', 'Personal Trainer', 'Certified personal trainer. Weight loss, muscle building, and sports performance. Home and gym sessions.', '(212) 555-0111', 'fit@fitlife.com', '300 W 57th St', 'New York', 'NY', '10019', 40.7659, -73.9832, 4.8, 145, 'available', 8, '$80/hr', 'English'],
    ['Peak Performance Fitness', 'Personal Trainer', 'NASM-certified trainer. Nutrition coaching, HIIT, yoga, and strength training. Online coaching available.', '(310) 555-0205', 'train@peakperformance.com', '1000 Santa Monica Blvd', 'Los Angeles', 'CA', '90401', 34.0195, -118.4912, 4.9, 201, 'available', 11, '$90/hr', 'English,Spanish'],

    // Photographers
    ['Capture Moments Photography', 'Photographer', 'Professional photography for weddings, portraits, events, and real estate. Drone photography available.', '(415) 555-0405', 'shoot@capturemoments.com', '200 Kearny St', 'San Francisco', 'CA', '94108', 37.7929, -122.4013, 4.9, 234, 'available', 10, '$200/hr', 'English'],
    ['Urban Lens Studio', 'Photographer', 'Commercial and editorial photography. Product photography, headshots, and brand photography.', '(212) 555-0112', 'info@urbanlens.com', '500 W 23rd St', 'New York', 'NY', '10011', 40.7459, -74.0001, 4.7, 167, 'available', 7, '$175/hr', 'English,French'],

    // Handymen
    ['All-Around Handyman', 'Handyman', 'General home repairs and maintenance. Furniture assembly, drywall, tile, and minor plumbing/electrical.', '(713) 555-0603', 'fix@allaround.com', '500 Main St', 'Houston', 'TX', '77002', 29.7604, -95.3698, 4.6, 189, 'available', 15, '$60/hr', 'English,Spanish'],
    ['Mr Fix It Services', 'Handyman', 'Reliable handyman for all home repairs. Painting, carpentry, plumbing, and electrical. No job too small.', '(404) 555-0902', 'mrfixit@gmail.com', '200 Peachtree Rd', 'Atlanta', 'GA', '30309', 33.7890, -84.3880, 4.5, 123, 'available', 9, '$55/hr', 'English'],

    // Roofers
    ['TopShield Roofing', 'Roofer', 'Residential and commercial roofing. Roof replacement, repair, gutters, and skylights. Free inspections.', '(602) 555-0704', 'info@topshield.com', '4000 N 7th St', 'Phoenix', 'AZ', '85014', 33.5084, -112.0740, 4.7, 145, 'available', 22, '$100/hr', 'English,Spanish'],
    ['StormProof Roofing', 'Roofer', 'Storm damage specialists. Insurance claims assistance, emergency tarping, and full roof replacement.', '(713) 555-0604', 'storm@stormproof.com', '1000 Westheimer Rd', 'Houston', 'TX', '77006', 29.7380, -95.4069, 4.8, 98, 'available', 18, '$95/hr', 'English'],
  ];

  const insertMany = db.transaction((rows: typeof providers) => {
    for (const row of rows) {
      insert.run(...row);
    }
  });
  insertMany(providers);
}

export default db;
