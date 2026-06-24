import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Zap, PlugZap, Activity, ShoppingCart } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const IconMap: Record<string, React.ElementType> = {
  Cable: Zap,
  Activity: Activity,
  PlugZap: PlugZap,
};

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const Icon = product.icon ? IconMap[product.icon] || Zap : Zap;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl"
    >
      {/* Image / Header area */}
      <div className="h-32 bg-zinc-800/50 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-acid/10 to-transparent"></div>
        <Icon className="w-16 h-16 text-acid opacity-80" />
      </div>

      <div className="p-5">
        <div className="flex flex-wrap gap-2 mb-3">
          {product.badges.map((badge, i) => (
            <span
              key={i}
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                badge === 'Best Seller'
                  ? 'bg-acid text-zinc-950'
                  : 'bg-zinc-800 text-zinc-300'
              }`}
            >
              {badge}
            </span>
          ))}
        </div>

        <h3 className="font-display text-lg font-semibold text-white mb-2 leading-tight">
          {product.title}
        </h3>
        
        <div className="flex items-baseline mb-4">
          <span className="text-2xl font-bold text-white">€{product.price}</span>
        </div>

        <div className="space-y-2 mb-6">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Perché sceglierlo?</p>
          {product.reasons.map((reason, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-acid shrink-0 mt-0.5" />
              <span className="text-sm text-zinc-300 leading-tight">{reason}</span>
            </div>
          ))}
        </div>

        <button className="w-full bg-acid hover:bg-acid-hover text-zinc-950 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
          <ShoppingCart className="w-4 h-4" />
          <span>Aggiungi al carrello</span>
        </button>
      </div>
    </motion.div>
  );
};
