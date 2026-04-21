import {
  Wrench, Zap, BookOpen, Hammer, Car, Leaf, SprayCan, Paintbrush,
  Wind, KeyRound, PawPrint, Truck, Monitor, ChefHat, Dumbbell,
  Camera, Settings, Home, LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  'Plumber': Wrench,
  'Electrician': Zap,
  'Tutor': BookOpen,
  'Carpenter': Hammer,
  'Car Repair': Car,
  'Gardener': Leaf,
  'House Cleaner': SprayCan,
  'Painter': Paintbrush,
  'HVAC Technician': Wind,
  'Locksmith': KeyRound,
  'Pet Care': PawPrint,
  'Moving Service': Truck,
  'IT Support': Monitor,
  'Chef / Catering': ChefHat,
  'Personal Trainer': Dumbbell,
  'Photographer': Camera,
  'Handyman': Settings,
  'Roofer': Home,
};

export function getCategoryIcon(category: string): LucideIcon {
  return iconMap[category] || Settings;
}

export { iconMap };
