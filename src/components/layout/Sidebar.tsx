import { useState } from 'react';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Network, Brain, FileSearch, MessageSquare,
  Bell, Settings, ChevronLeft, ChevronRight, Activity,
} from 'lucide-react';
import { PulsingDot } from '@/components/shared/PulsingDot';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Activity },
  { path: '/network', label: 'Network Graph', icon: Network },
  { path: '/anomaly-detection', label: 'Anomaly Detection', icon: Brain },
  { path: '/threat-intel', label: 'Threat Intel', icon: FileSearch },
  { path: '/ai-analysis', label: 'AI Analysis', icon: MessageSquare },
  { path: '/alerts', label: 'Alerts', icon: Bell, hasBadge: true },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="h-screen bg-sidebar border-r border-sidebar-border flex flex-col flex-shrink-0 relative z-10"
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-sidebar-border gap-2">
        <Shield className="w-6 h-6 text-primary flex-shrink-0" />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="font-mono text-sm font-bold text-primary tracking-tight whitespace-nowrap overflow-hidden"
            >
              SENTINEL AI
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-hidden">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <RouterNavLink
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-sm text-[13px] font-medium
                transition-all duration-150 relative group
                ${isActive
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent border border-transparent'
                }
              `}
            >
              <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-primary' : ''}`} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {item.hasBadge && (
                <span className="ml-auto">
                  <PulsingDot color="red" size="sm" />
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r"
                />
              )}
            </RouterNavLink>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="h-10 flex items-center justify-center border-t border-sidebar-border text-muted-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </motion.aside>
  );
}
