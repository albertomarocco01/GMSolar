import React from 'react';
import { motion } from 'motion/react';
import { Product } from '../types';
import { Check } from 'lucide-react';

interface ComparisonTableProps {
  products: Product[];
  recommendedId?: string;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ products, recommendedId }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mt-6 border border-zinc-800 bg-zinc-900/50 rounded-xl overflow-hidden"
    >
      <div className="p-3 border-b border-zinc-800 bg-zinc-900/80">
        <h4 className="text-sm font-semibold text-white">Confronto Rapido</h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-zinc-800/30 text-zinc-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 font-medium">Modello</th>
              <th className="px-4 py-3 font-medium text-center">Tipo</th>
              <th className="px-4 py-3 font-medium text-right">Prezzo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {products.map((p) => {
              const isRecommended = p.id === recommendedId;
              return (
                <tr key={p.id} className={isRecommended ? 'bg-acid/5' : ''}>
                  <td className="px-4 py-3 text-zinc-200">
                    <div className="flex items-center gap-2">
                      {isRecommended && <Check className="w-3.5 h-3.5 text-acid shrink-0" />}
                      <span className={isRecommended ? 'font-medium text-white' : ''}>
                        {p.title.replace('Mennekes ', '')}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded">
                      {p.badges[0]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-300 font-medium">
                    €{p.price}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
