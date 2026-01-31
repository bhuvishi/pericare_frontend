'use client';

import { Flower2 } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title = 'Bloom', subtitle }: HeaderProps) {
  return (
    <header className="pt-6 pb-4 px-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10">
            <Flower2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-serif text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
