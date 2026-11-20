import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Wallet,
  User,
} from 'lucide-react';

export const BottomNav = () => {
  const navItems = [
    { name: 'Home', path: '/', icon: LayoutDashboard },
    { name: 'Orders', path: '/orders', icon: ShoppingBag },
    { name: 'Food', path: '/foods', icon: UtensilsCrossed },
    { name: 'Earnings', path: '/earnings', icon: Wallet },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8ECE7] shadow-[0_-4px_16px_rgba(0,0,0,0.04)] pb-safe"
    >
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all duration-200 select-none group min-h-[48px] ${
                  isActive
                    ? 'text-[#14513F] font-bold'
                    : 'text-[#737B76] hover:text-[#27352F] font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`relative p-1 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-[#14513F]/10 scale-105'
                        : 'group-hover:bg-[#F7F8F5]'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 transition-transform duration-200 ${
                        isActive ? 'text-[#14513F] stroke-[2.4]' : 'text-[#737B76]'
                      }`}
                    />
                    {isActive && (
                      <span className="absolute -top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-[#F6A23A]" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] mt-0.5 tracking-tight transition-colors ${
                      isActive ? 'text-[#14513F]' : 'text-[#737B76]'
                    }`}
                  >
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
