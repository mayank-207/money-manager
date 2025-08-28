import React from 'react';
import {
  Utensils,
  Home,
  Car,
  ShoppingBag,
  Heart,
  Film,
  GraduationCap,
  Gift,
  Coffee,
  Bus,
  Train,
  Plane,
  Wifi,
  Zap,
  Droplets,
  BookOpen,
  Gamepad2,
  Music,
  Camera,
  Dumbbell,
  Briefcase,
  PiggyBank,
  CreditCard,
  Wallet,
  Banknote,
  Coins,
  TrendingUp,
  TrendingDown,
  DollarSign,
  IndianRupee,
  Laptop,
} from 'lucide-react';

export interface CategoryIconProps {
  category: string;
  size?: number;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ 
  category, 
  size = 20, 
  className = '' 
}) => {
  const normalizedCategory = category.toLowerCase().trim();
  
  // Define category mappings with colors and icons
  const categoryConfig = {
    'food & dining': {
      icon: Utensils,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100',
    },
    'food': {
      icon: Utensils,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100',
    },
    'dining': {
      icon: Coffee,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100',
    },
    'housing': {
      icon: Home,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
    },
    'rent': {
      icon: Home,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
    },
    'transportation': {
      icon: Car,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
    },
    'transport': {
      icon: Car,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
    },
    'uber': {
      icon: Car,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
    },
    'ola': {
      icon: Car,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
    },
    'shopping': {
      icon: ShoppingBag,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100',
    },
    'healthcare': {
      icon: Heart,
      color: 'text-red-500',
      bgColor: 'bg-red-100',
    },
    'medical': {
      icon: Heart,
      color: 'text-red-500',
      bgColor: 'bg-red-100',
    },
    'entertainment': {
      icon: Film,
      color: 'text-pink-500',
      bgColor: 'bg-pink-100',
    },
    'education': {
      icon: GraduationCap,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-100',
    },
    'gifts': {
      icon: Gift,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100',
    },
    'utilities': {
      icon: Zap,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    'electricity': {
      icon: Zap,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    'water': {
      icon: Droplets,
      color: 'text-blue-400',
      bgColor: 'bg-blue-50',
    },
    'internet': {
      icon: Wifi,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    'books': {
      icon: BookOpen,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    'gaming': {
      icon: Gamepad2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    'music': {
      icon: Music,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
    'photography': {
      icon: Camera,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
    'fitness': {
      icon: Dumbbell,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    'work': {
      icon: Briefcase,
      color: 'text-slate-600',
      bgColor: 'bg-slate-100',
    },
    'salary': {
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    'income': {
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    'freelance': {
      icon: Laptop,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    'investment': {
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    'savings': {
      icon: PiggyBank,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
    },
    'banking': {
      icon: Banknote,
      color: 'text-green-700',
      bgColor: 'bg-green-100',
    },
    'atm': {
      icon: CreditCard,
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
    },
    'cash': {
      icon: Wallet,
      color: 'text-green-700',
      bgColor: 'bg-green-100',
    },
    'other': {
      icon: Coins,
      color: 'text-gray-500',
      bgColor: 'bg-gray-100',
    },
  };

  // Find the best matching category
  let bestMatch = categoryConfig['other'];
  
  for (const [key, config] of Object.entries(categoryConfig)) {
    if (normalizedCategory.includes(key) || key.includes(normalizedCategory)) {
      bestMatch = config;
      break;
    }
  }

  const IconComponent = bestMatch.icon;

  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bestMatch.bgColor} ${className}`}>
      <IconComponent size={size} className={bestMatch.color} />
    </div>
  );
};

// Export individual category icons for specific use cases
export const FoodIcon = ({ size = 20, className = '' }) => (
  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-orange-100">
    <Utensils size={size} className="text-orange-500" />
  </div>
);

export const HousingIcon = ({ size = 20, className = '' }) => (
  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100">
    <Home size={size} className="text-blue-500" />
  </div>
);

export const TransportationIcon = ({ size = 20, className = '' }) => (
  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100">
    <Car size={size} className="text-green-500" />
  </div>
);

export const ShoppingIcon = ({ size = 20, className = '' }) => (
  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-100">
    <ShoppingBag size={size} className="text-purple-500" />
  </div>
);

export const HealthcareIcon = ({ size = 20, className = '' }) => (
  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-100">
    <Heart size={size} className="text-red-500" />
  </div>
);

export const EntertainmentIcon = ({ size = 20, className = '' }) => (
  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-pink-100">
    <Film size={size} className="text-pink-500" />
  </div>
);

export const IncomeIcon = ({ size = 20, className = '' }) => (
  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100">
    <TrendingUp size={size} className="text-green-600" />
  </div>
);

export const ExpenseIcon = ({ size = 20, className = '' }) => (
  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-100">
    <TrendingDown size={size} className="text-red-600" />
  </div>
);

// Payment method icons
export const PaytmIcon = ({ size = 20, className = '' }) => (
  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-blue-100">
    <span className="text-blue-600 font-bold text-xs">P</span>
  </div>
);

export const BHIMIcon = ({ size = 20, className = '' }) => (
  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-green-100">
    <span className="text-green-600 font-bold text-xs">B</span>
  </div>
);
