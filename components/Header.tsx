
import React, { useState } from 'react';
import { View, AppData } from '../types';
import { LOGO_URL } from '../constants';
import { Menu, X, MessageCircle } from 'lucide-react';

interface HeaderProps {
  currentView: View;
  onNavigate: (view: View) => void;
  appData: AppData;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, appData }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems: { label: string; view: View }[] = [
    { label: 'Stays', view: 'stays' },
    { label: 'Transport', view: 'transport' },
    { label: 'Food & Services', view: 'food' },
    { label: 'Become a Host', view: 'host' },
  ];

  const handleNav = (view: View) => {
    onNavigate(view);
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
        <div className="flex items-center cursor-pointer" onClick={() => handleNav('home')}>
          <img src={LOGO_URL} alt={appData.meta.brand_name} className="h-10 md:h-12 w-auto object-contain" />
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNav(item.view)}
              className={`text-sm font-medium transition-colors hover:text-[#C46210] ${
                currentView === item.view ? 'text-[#C46210]' : 'text-gray-600'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Desktop Mobile Nav Toggle */}
        <div className="lg:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* WhatsApp Desktop Button */}
        <a
          href={`https://wa.me/${appData.meta.whatsapp_main_number}?text=Hello%20${encodeURIComponent(appData.meta.brand_name)},%20I%20would%20like%20to%20inquire%20about%20your%20services.`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-full font-semibold text-sm hover:bg-[#20bd5a] transition-all"
        >
          <MessageCircle size={18} />
          Concierge
        </a>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-xl animate-in fade-in slide-in-from-top-4">
          <nav className="flex flex-col p-6 space-y-4">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNav(item.view)}
                className="text-left text-lg font-medium text-gray-800"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
