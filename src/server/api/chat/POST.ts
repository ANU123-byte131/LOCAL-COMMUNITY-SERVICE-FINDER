import type { Request, Response } from 'express';
import db from '../../../lib/db.js';

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const categoryKeywords: Record<string, string[]> = {
  Plumber: ['plumb', 'pipe', 'leak', 'drain', 'water heater', 'faucet', 'toilet', 'sewage'],
  Electrician: ['electric', 'wiring', 'outlet', 'circuit', 'breaker', 'light', 'power', 'voltage'],
  Tutor: ['tutor', 'teach', 'lesson', 'homework', 'math', 'science', 'english', 'study', 'school'],
  Carpenter: ['carpenter', 'wood', 'furniture', 'cabinet', 'deck', 'floor', 'shelf', 'door'],
  'Car Repair': ['car', 'auto', 'vehicle', 'mechanic', 'engine', 'brake', 'tire', 'oil change', 'transmission'],
  Gardener: ['garden', 'lawn', 'grass', 'tree', 'plant', 'landscape', 'mow', 'trim', 'weed'],
  'House Cleaner': ['clean', 'maid', 'housekeep', 'sweep', 'vacuum', 'dust', 'sanitize', 'tidy'],
  Painter: ['paint', 'wall', 'color', 'brush', 'interior', 'exterior', 'coat', 'stain'],
  'HVAC Technician': ['hvac', 'air condition', 'heating', 'cooling', 'furnace', 'ac ', 'heat pump', 'duct', 'thermostat'],
  Locksmith: ['lock', 'key', 'lockout', 'rekey', 'safe', 'security', 'deadbolt'],
  'Pet Care': ['pet', 'dog', 'cat', 'animal', 'walk', 'groom', 'vet', 'boarding', 'sitter'],
  'Moving Service': ['mov', 'relocat', 'pack', 'truck', 'haul', 'transport', 'storage'],
  'IT Support': ['computer', 'laptop', 'tech', 'internet', 'network', 'virus', 'software', 'hardware', 'it support', 'data'],
  'Chef / Catering': ['chef', 'cater', 'cook', 'food', 'meal', 'dinner', 'party food', 'event food'],
  'Personal Trainer': ['trainer', 'fitness', 'workout', 'gym', 'exercise', 'weight', 'muscle', 'yoga', 'hiit'],
  Photographer: ['photo', 'picture', 'camera', 'shoot', 'portrait', 'wedding photo', 'event photo'],
  Handyman: ['handyman', 'repair', 'fix', 'maintenance', 'install', 'assemble', 'general'],
  Roofer: ['roof', 'shingle', 'gutter', 'skylight', 'leak roof', 'attic'],
};

const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy'];

const responses: Record<string, Record<string, string>> = {
  en: {
    greeting: "Hi there! I'm your ServiceFinder assistant. What service are you looking for today?",
    found: "Great! I found {count} {category} provider(s) near you. Here are the top matches:",
    notFound: "I couldn't find any {category} providers matching your criteria. Try expanding your search radius or check back later.",
    unknown: "I'm not sure what service you need. Could you be more specific? For example: 'I need a plumber' or 'looking for a tutor'.",
    askLocation: "I can help you find {category} services! To show providers near you, please enable location access or search from the main page.",
  },
  es: {
    greeting: "¡Hola! Soy tu asistente de ServiceFinder. ¿Qué servicio estás buscando hoy?",
    found: "¡Genial! Encontré {count} proveedor(es) de {category} cerca de ti. Aquí están los mejores:",
    notFound: "No encontré proveedores de {category} que coincidan con tus criterios. Intenta ampliar el radio de búsqueda.",
    unknown: "No estoy seguro de qué servicio necesitas. ¿Podrías ser más específico? Por ejemplo: 'Necesito un plomero'.",
    askLocation: "¡Puedo ayudarte a encontrar servicios de {category}! Para mostrar proveedores cerca de ti, habilita el acceso a la ubicación.",
  },
  fr: {
    greeting: "Bonjour! Je suis votre assistant ServiceFinder. Quel service recherchez-vous aujourd'hui?",
    found: "Super! J'ai trouvé {count} prestataire(s) de {category} près de vous. Voici les meilleurs:",
    notFound: "Je n'ai pas trouvé de prestataires de {category} correspondant à vos critères. Essayez d'élargir votre rayon de recherche.",
    unknown: "Je ne suis pas sûr du service dont vous avez besoin. Pourriez-vous être plus précis?",
    askLocation: "Je peux vous aider à trouver des services de {category}! Pour afficher les prestataires près de vous, veuillez activer l'accès à la localisation.",
  },
  hi: {
    greeting: "नमस्ते! मैं आपका ServiceFinder सहायक हूं। आज आप कौन सी सेवा ढूंढ रहे हैं?",
    found: "बढ़िया! मुझे आपके पास {count} {category} प्रदाता मिले। यहाँ शीर्ष परिणाम हैं:",
    notFound: "मुझे आपके मानदंडों से मेल खाने वाले {category} प्रदाता नहीं मिले। खोज त्रिज्या बढ़ाने का प्रयास करें।",
    unknown: "मुझे यकीन नहीं है कि आपको किस सेवा की जरूरत है। कृपया अधिक विशिष्ट बताएं।",
    askLocation: "मैं आपको {category} सेवाएं खोजने में मदद कर सकता हूं! आपके पास के प्रदाता दिखाने के लिए, कृपया स्थान एक्सेस सक्षम करें।",
  },
  ar: {
    greeting: "مرحباً! أنا مساعد ServiceFinder الخاص بك. ما الخدمة التي تبحث عنها اليوم؟",
    found: "رائع! وجدت {count} مزود(ين) لخدمة {category} بالقرب منك. إليك أفضل النتائج:",
    notFound: "لم أجد مزودي خدمة {category} المطابقين لمعاييرك. حاول توسيع نطاق البحث.",
    unknown: "لست متأكداً من الخدمة التي تحتاجها. هل يمكنك أن تكون أكثر تحديداً؟",
    askLocation: "يمكنني مساعدتك في العثور على خدمات {category}! لعرض مزودي الخدمة بالقرب منك، يرجى تفعيل الوصول إلى الموقع.",
  },
};

export default function handler(req: Request, res: Response) {
  try {
    const { message, userLat, userLng, language = 'en' } = req.body;
    const lang = (language in responses) ? language : 'en';
    const msgs = responses[lang];
    const lowerMsg = (message || '').toLowerCase();

    // Check for greeting
    if (greetings.some((g) => lowerMsg.includes(g)) && lowerMsg.length < 20) {
      return res.json({ type: 'greeting', message: msgs.greeting, providers: [] });
    }

    // Detect category
    let detectedCategory: string | null = null;
    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((kw) => lowerMsg.includes(kw))) {
        detectedCategory = cat;
        break;
      }
    }

    if (!detectedCategory) {
      return res.json({ type: 'unknown', message: msgs.unknown, providers: [] });
    }

    // Fetch providers
    let providers = db.prepare('SELECT * FROM providers WHERE category = ? ORDER BY rating DESC').all(detectedCategory) as any[];

    const lat = parseFloat(userLat);
    const lng = parseFloat(userLng);

    if (!isNaN(lat) && !isNaN(lng)) {
      providers = providers
        .map((p) => ({
          ...p,
          distance: p.lat && p.lng ? Math.round(haversineDistance(lat, lng, p.lat, p.lng) * 10) / 10 : null,
        }))
        .filter((p) => p.distance === null || p.distance <= 50)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3);
    } else {
      providers = providers.slice(0, 3);
    }

    if (providers.length === 0) {
      return res.json({
        type: 'notFound',
        message: msgs.notFound.replace('{category}', detectedCategory),
        providers: [],
      });
    }

    const responseMsg = msgs.found
      .replace('{count}', String(providers.length))
      .replace('{category}', detectedCategory);

    res.json({ type: 'found', message: responseMsg, category: detectedCategory, providers });
  } catch (error) {
    res.status(500).json({ error: 'Chat failed', message: String(error) });
  }
}
