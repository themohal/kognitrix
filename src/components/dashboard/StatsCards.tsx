'use client';

import Link from 'next/link';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  href: string;
}

interface StatsCardsProps {
  stats: StatItem[];
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Link key={stat.label} href={stat.href}>
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
