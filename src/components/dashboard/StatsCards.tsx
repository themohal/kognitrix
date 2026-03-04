'use client';

import Link from 'next/link';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { SpotlightCard } from '@/components/ui/animations';

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
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: i * 0.08,
            duration: 0.4,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <Link href={stat.href}>
            <SpotlightCard>
              <Card className="hover:border-primary/50 transition-all duration-300 cursor-pointer hover-lift">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    >
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </motion.div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            </SpotlightCard>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
