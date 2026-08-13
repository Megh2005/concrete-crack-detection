"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LogIn, FileText, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DOCK_ITEMS = [
  { id: 'home', name: 'Home', href: '/', icon: Home },
  { id: 'auth', name: 'Authentication', href: '/auth', icon: LogIn },
  { id: 'docs', name: 'Documentation', href: '/docs', icon: FileText },
  { id: 'profile', name: 'Profile', href: '/profile', icon: User },
];

export default function NavigationDock() {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 select-none">
      <div className="glass-panel-light-theme rounded-full px-4 py-2 flex items-center gap-3 shadow-2xl border border-black/15 bg-white/80 backdrop-blur-xl">
        {DOCK_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <div
              key={item.id}
              className="relative flex flex-col items-center"
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <AnimatePresence>
                {hoveredItem === item.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.9 }}
                    animate={{ opacity: 1, y: -8, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.9 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute bottom-full mb-1 px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-bold tracking-wide shadow-lg whitespace-nowrap pointer-events-none"
                  >
                    {item.name}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                  </motion.div>
                )}
              </AnimatePresence>

              <Link href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.16, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-3 rounded-full transition-all duration-200 flex items-center justify-center ${
                    isActive
                      ? 'bg-blue-700 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-white/90 text-slate-700 hover:text-blue-700 hover:bg-white border border-black/10'
                  }`}
                >
                  <Icon size={19} />
                </motion.div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
