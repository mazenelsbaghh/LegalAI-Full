import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BreadcrumbProps {
  items: Array<{
    label: string;
    href?: string;
  }>;
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-4 mb-4 text-sm" dir="rtl">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronLeft className="w-4 h-4 text-gray-400" />}
          {item.href ? (
            <Link 
              to={item.href}
              className="text-gold-400 hover:text-gold-300 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-400">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}