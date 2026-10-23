import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function HrBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Navegação estrutural" className="flex items-center text-xs text-[var(--hr-text-muted)] mb-3 overflow-x-auto no-scrollbar whitespace-nowrap">
      <ol className="flex items-center gap-1.5 list-none p-0 m-0">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center gap-1.5">
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-[var(--hr-text-light)] flex-shrink-0" />}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-[var(--hr-primary)] transition-colors py-1"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={`py-1 ${isLast ? 'font-semibold text-[var(--hr-text)]' : ''}`}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
