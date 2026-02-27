
import React from 'react';
import { View, AppData } from '../types';
import { LOGO_URL } from '../constants';
import { Instagram, Twitter, Facebook } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: View) => void;
  appData: AppData;
}

const Footer: React.FC<FooterProps> = ({ onNavigate, appData }) => {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-1">
            <img src={LOGO_URL} alt={appData.meta.brand_name} className="h-10 mb-6" />
            <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">
              Umunna Stays is not a generic shortlet. It is an exclusive concierge-backed hospitality brand in Asaba designed for executives, diaspora visitors, and premium travelers.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-[#C46210] transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-[#C46210] transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-[#C46210] transition-colors"><Facebook size={20} /></a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Company</h4>
            <ul className="space-y-4">
              <li><button onClick={() => onNavigate('home')} className="text-gray-500 hover:text-[#C46210] transition-colors">About Us</button></li>
              <li><button onClick={() => window.location.hash = 'blog'} className="text-gray-500 hover:text-[#C46210] transition-colors">Executive Travel Blog</button></li>
              <li><button onClick={() => onNavigate('host')} className="text-gray-500 hover:text-[#C46210] transition-colors">Become a Host</button></li>
              <li><button className="text-gray-500 hover:text-[#C46210] transition-colors">Trust & Safety</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Explore</h4>
            <ul className="space-y-4">
              <li><button onClick={() => onNavigate('stays')} className="text-gray-500 hover:text-[#C46210] transition-colors">Luxury Shortlets Asaba</button></li>
              <li><button onClick={() => onNavigate('food')} className="text-gray-500 hover:text-[#C46210] transition-colors">Private Chef & Food</button></li>
              <li><button onClick={() => onNavigate('transport')} className="text-gray-500 hover:text-[#C46210] transition-colors">Executive Transport</button></li>
              <li><button className="text-gray-500 hover:text-[#C46210] transition-colors">Concierge Services</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Cities</h4>
            <ul className="space-y-4">
              {appData.city_summary.slice(0, 4).map((cityInfo) => (
                <li key={cityInfo.city}>
                  <button
                    onClick={() => onNavigate('stays')}
                    className="text-gray-500 hover:text-[#C46210] transition-colors"
                  >
                    {cityInfo.city}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2 lg:col-span-4 border-t border-gray-100 pt-8 mt-4">
            <h4 className="font-bold text-sm uppercase tracking-widest text-[#C46210] mb-6">Corporate & Institutional Trust</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs font-bold text-gray-700">VAT Compliant Invoicing</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs font-bold text-gray-700">Corporate Accounts Accepted</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs font-bold text-gray-700">NGO / Oil & Gas Vetted</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs font-bold text-gray-700">24/7 Logistics Support</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400 text-xs gap-4">
          <p>© {new Date().getFullYear()} {appData.meta.brand_name}. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
