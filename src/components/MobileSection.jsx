import React from 'react';
import { ChevronDown } from 'lucide-react';

const isPhoneWidth = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches;

// A card whose body can be collapsed. Starts closed on phones so the detail
// panel stays short, and open on larger screens.
export default function MobileSection({ title, icon, className = '', titleClassName = '', children }) {
  return (
    <details open={!isPhoneWidth()} className={`group ${className}`}>
      <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer select-none flex items-center justify-between gap-2">
        <h4 className={`text-sm font-bold flex items-center gap-2 ${titleClassName}`}>
          {icon}
          <span>{title}</span>
        </h4>
        <ChevronDown className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-180 shrink-0" />
      </summary>
      <div className="pt-2 space-y-2">{children}</div>
    </details>
  );
}
