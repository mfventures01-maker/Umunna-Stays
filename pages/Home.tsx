
import React, { useState, useEffect } from 'react';
import { View, Property, AppData } from '../types';
import { getFeaturedProperties, getServicesByType } from '../dataStore';
import PropertyCarousel from '../components/PropertyCarousel';
import ConciergeLeadForm from '../components/concierge/ConciergeLeadForm';
import { Search, ChevronRight, ArrowRight, ShieldCheck, Zap, Wifi, Droplets, AlertTriangle, Star, MapPin } from 'lucide-react';
import ServiceHeroCarousel from '../src/components/ServiceHeroCarousel';
import LeadCapturePopup from '../src/components/LeadCapturePopup';
import nateImg from '../src/assets/nate-signature-hero.jpg';
import foodImg from '../src/assets/rice-chicken.png';
import transportImg from '../src/assets/land-cruiser.png';
import { motion, useScroll, useTransform } from 'framer-motion';
import { BlogPostData } from '../blogData';
import { fetchBlogPosts } from '../src/services/blogService';

interface HomeProps {
  onNavigate: (view: View, property?: Property) => void;
  appData: AppData;
}

const Home: React.FC<HomeProps> = ({ onNavigate, appData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [blogPosts, setBlogPosts] = useState<BlogPostData[]>([]);

  useEffect(() => {
    fetchBlogPosts().then(data => setBlogPosts(data));
  }, []);

  const featured = getFeaturedProperties(appData);
  const mainServices = [
    ...getServicesByType(appData, 'Food').slice(0, 1),
    ...getServicesByType(appData, 'Ride').slice(0, 1),
    ...getServicesByType(appData, 'Security').slice(0, 1)
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('stays');
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  return (
    <div className="pt-16 md:pt-20 bg-gray-50/50">
      <ServiceHeroCarousel
        slides={[
          {
            id: "apartments",
            badge: "Sanctuary",
            title: "Arrive. Exhale. No Stories.",
            subtitle: "The only short-let where 24/7 power is guaranteed, not prayed for.",
            ctaText: "Check Availability",
            route: "/properties",
            imageUrl: nateImg
          },
          {
            id: "transport",
            badge: "Ghost Protocol",
            title: "Secure Logistics",
            subtitle: "Unmarked assets. Tinted SUVs. Drivers vetted for silence.",
            ctaText: "Secure Movement",
            route: "/transport",
            imageUrl: transportImg
          },
          {
            id: "food",
            badge: "Fuel",
            title: "Kitchen Logic",
            subtitle: "Hot meals delivered. Comfort without leaving your fortress.",
            ctaText: "Order Intake",
            route: "/food",
            imageUrl: foodImg
          }
        ]}
        autoPlayMs={5000}
      />
      <LeadCapturePopup />

      {/* Concierge Command Form */}
      <motion.section
        className="py-12 relative -mt-20 z-20 hidden md:block"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto shadow-2xl rounded-3xl overflow-hidden border border-gray-100 bg-white/95 backdrop-blur-sm">
            <ConciergeLeadForm />
          </div>
        </div>
      </motion.section>

      {/* Video Pattern Interrupt */}
      <section className="py-20 bg-black text-white overflow-hidden relative">
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            className="max-w-4xl mx-auto border border-gray-800 p-8 md:p-12 rounded-[2.5rem] bg-gray-900/80 backdrop-blur-md shadow-2xl shadow-black/50"
            {...fadeInUp}
          >
            <p className="text-[#C46210] font-black uppercase tracking-[0.3em] text-xs mb-6">The Standard</p>
            <h3 className="text-3xl md:text-5xl font-heading font-bold mb-10 tracking-tight leading-tight">"Clean is not luxury.<br />It is the minimum."</h3>

            <div className="relative group">
              {/* Glow effect behind video */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#C46210] to-orange-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>

              <div className="aspect-video bg-gray-800 rounded-xl flex items-center justify-center relative overflow-hidden shadow-2xl ring-1 ring-white/10">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/DxluWGwlSX8?rel=0"
                  title="Umunna Experience"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full rounded-xl"
                ></iframe>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Authority / Partner Badges */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4">
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-8">Trusted by Executives From</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <h4 className="text-xl font-black font-heading tracking-tighter">CHEVRON</h4>
            <h4 className="text-xl font-black font-heading tracking-widest text-[#C46210]">SHELL</h4>
            <h4 className="text-xl font-black font-heading font-serif italic">NNPC</h4>
            <h4 className="text-xl font-bold font-heading">ZENITH BANK</h4>
            <h4 className="text-xl font-black font-heading tracking-tight">MTN</h4>
          </div>
        </div>
      </section>

      {/* Infrastructure Audit */}
      <section className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <span className="text-[#C46210] font-black uppercase tracking-[0.3em] text-xs mb-4 block">No Stories</span>
            <h2 className="text-4xl md:text-5xl font-heading font-black text-gray-900 tracking-tight">Infrastructure Audit</h2>
            <p className="text-gray-500 mt-4 font-medium text-lg">Physics over promises. We don't hope for light, we engineer it.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: <Zap size={24} fill="currentColor" />,
                color: "green",
                title: "Power Redundancy",
                desc: <>Grid + Solar + Diesel Gen. <br /><span className="text-green-600 font-bold">0ms Transfer Switch.</span> <br />We do not "manage" light.</>
              },
              {
                icon: <Wifi size={24} />,
                color: "blue",
                title: "Connectivity",
                desc: <>Starlink Primary + Fiber Failover. <br /><span className="text-blue-600 font-bold">150Mbps+ Verified.</span> <br />Video calls do not freeze here.</>
              },
              {
                icon: <Droplets size={24} />,
                color: "cyan",
                title: "Water Pressure",
                desc: <>Industrial treatment plant. <br /><span className="text-cyan-600 font-bold">6.5 Bar Pressure.</span> <br />Showers that actually work.</>
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className={`w-14 h-14 bg-${item.color}-50 text-${item.color}-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <h4 className="font-bold font-heading text-2xl mb-3 text-gray-900">{item.title}</h4>
                <p className="text-gray-500 font-medium leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Not For Everyone Filter */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4">
          <motion.div
            className="bg-red-50/50 border border-red-100 rounded-[32px] p-8 md:p-12 md:flex items-center gap-12 max-w-4xl mx-auto hover:bg-red-50 transition-colors duration-500"
            {...fadeInUp}
          >
            <div className="flex-shrink-0 mb-6 md:mb-0">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-100">
                <AlertTriangle size={32} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black font-heading text-red-900 mb-4">Umunna is not for everyone.</h3>
              <ul className="space-y-3">
                {[
                  "We do not negotiate prices on arrival.",
                  "We do not accept cash at the gate.",
                  "We do not do surprise fees. We adhere to protocol."
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3 text-red-800 font-medium text-sm">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Signature Collection */}
      <section className="py-24 bg-white">
        <div className="container mx-auto">
          <motion.div
            className="flex flex-col md:flex-row justify-between items-end mb-12 px-4 gap-6"
            {...fadeInUp}
          >
            <div className="max-w-2xl">
              <span className="text-[#C46210] font-black uppercase tracking-[0.3em] text-xs mb-4 block">The Assets</span>
              <h2 className="text-4xl md:text-6xl font-black font-heading text-gray-900 mb-6 tracking-tight">Signature Collection</h2>
              <p className="text-gray-500 text-lg md:text-xl font-medium max-w-lg">Extraordinary residences vetted for design, security, and silence.</p>
            </div>
            <button
              onClick={() => onNavigate('stays')}
              className="flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-gray-800 hover:scale-105 transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              View Full Registry <ChevronRight size={18} />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <PropertyCarousel properties={featured} appData={appData} onNavigate={onNavigate} />
          </motion.div>
        </div>
      </section>

      {/* Featured Reviews / Brand Authority */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-[#C46210] font-black uppercase tracking-[0.3em] text-xs mb-4 block">Reputation</span>
            <h2 className="text-4xl md:text-5xl font-black font-heading text-gray-900 tracking-tight">Don't Take Our Word For It</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { text: "The first shortlet in Asaba where the WiFi actually supported my Zoom calls seamlessly. The 24/7 power claim is not a gimmick. Excellent.", author: "Dr. K. Obi", role: "Diaspora Investor" },
              { text: "Secure, discreet, and exceptionally clean. The concierge even organized our local transport. The only place my firm uses in Delta State.", author: "Sarah M.", role: "Corporate Executive" },
              { text: "Finally, luxury that matches international standards here in Asaba. Arrived late, but check-in was smooth and food was ready.", author: "Chief E. Nnamdi", role: "Business Owner" }
            ].map((review, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} size={16} fill="currentColor" />)}
                </div>
                <p className="text-gray-700 italic mb-6">"{review.text}"</p>
                <div>
                  <h5 className="font-bold text-gray-900">{review.author}</h5>
                  <span className="text-xs text-brand font-medium tracking-wider uppercase">{review.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Logistics / Concierge */}
      <section className="py-24 bg-gray-900 text-white rounded-t-[3rem] mt-12 relative overflow-hidden">
        {/* Subtle pattern or gradient */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-800/20 to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h2
            className="text-4xl md:text-5xl font-black font-heading mb-16 tracking-tight"
            {...fadeInUp}
          >
            Logistics handled so you don't think.
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mainServices.map((service, i) => (
              <motion.div
                key={service.service_id}
                className="bg-gray-800/50 backdrop-blur-sm p-10 rounded-[2.5rem] shadow-2xl border border-gray-700 hover:border-gray-600 hover:bg-gray-800 transition-all duration-300 group text-left"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="mb-6 w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center group-hover:bg-[#C46210] transition-colors duration-300">
                  <ShieldCheck size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold font-heading mb-4">{service.name}</h3>
                <p className="text-gray-400 mb-8 min-h-[48px] line-clamp-2">{service.description}</p>
                <a
                  href={`https://wa.me/${appData.meta.whatsapp_main_number}?text=${encodeURIComponent(service.whatsapp_prefill)}`}
                  className="text-[#C46210] font-black uppercase tracking-widest text-sm flex items-center gap-2 hover:text-white transition-colors group-hover:gap-4"
                >
                  Request Service <ArrowRight size={16} />
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest from the Blog */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <span className="text-[#C46210] font-black uppercase tracking-[0.3em] text-xs mb-4 block">Executive Intel</span>
              <h2 className="text-4xl md:text-5xl font-black font-heading text-gray-900 tracking-tight">Latest from the Blog</h2>
              <p className="text-gray-500 text-lg md:text-xl font-medium mt-4">Insights, guides, and infrastructure audits for the premium traveler.</p>
            </div>
            <button
              onClick={() => onNavigate('blog')}
              className="group flex items-center gap-3 bg-white border-2 border-gray-900 text-gray-900 px-8 py-4 rounded-2xl font-bold text-sm hover:bg-gray-900 hover:text-white transition-all shadow-md"
            >
              View All Posts <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {blogPosts.slice(0, 2).map((post, i) => (
              <motion.div
                key={post.slug}
                className="group relative bg-gray-50 rounded-[2.5rem] overflow-hidden border border-gray-100 cursor-pointer hover:shadow-2xl transition-all duration-500"
                onClick={() => window.location.hash = `blog/${post.slug}`}
                {...fadeInUp}
                transition={{ delay: i * 0.2 }}
              >
                <div className="aspect-[16/9] overflow-hidden">
                  <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-6 left-6">
                    <span className="bg-[#C46210] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-8 md:p-10">
                  <h3 className="text-2xl md:text-3xl font-bold font-heading text-gray-900 mb-4 line-clamp-2 group-hover:text-[#C46210] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-500 font-medium mb-8 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                    Read Intelligence <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform text-[#C46210]" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Google Maps Embed & Book Now CTA */}
      <section className="bg-white py-12 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-center bg-gray-50 rounded-3xl overflow-hidden border border-gray-100">
            <div className="w-full md:w-1/2 h-[400px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126839.1179040004!2d6.6212163!3d6.2341257!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1043f16dc448bc55%3A0xeab50d4fdbcbbf!2sAsaba%2C%20Delta!5e0!3m2!1sen!2sng!4v1714150000000!5m2!1sen!2sng"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Umunna Stays Location"
              ></iframe>
            </div>
            <div className="w-full md:w-1/2 p-8 md:p-12 text-center md:text-left">
              <h3 className="text-3xl font-black font-heading text-gray-900 mb-4">Command Your Stay</h3>
              <p className="text-gray-600 mb-8 max-w-md">Our properties are strategically located in Asaba's most secure estates. Minutes from the airport, secluded from the noise.</p>
              <button
                onClick={() => onNavigate('stays')}
                className="inline-flex flex-col items-center justify-center md:items-start bg-brand text-white px-8 py-4 rounded-xl font-bold hover:bg-[#A3520D] transition-colors shadow-lg hover:shadow-xl w-full sm:w-auto"
              >
                <span>Book Now</span>
                <span className="text-xs font-normal opacity-80 mt-1">3 Units Available This Week</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Book Now Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 z-[60] flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div>
          <p className="font-bold text-gray-900">Need a Stay?</p>
          <p className="text-xs text-brand font-medium">Fast action recommended</p>
        </div>
        <button
          onClick={() => onNavigate('stays')}
          className="bg-brand text-white px-6 py-3 rounded-lg font-bold shadow-md active:scale-95 transition-transform"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default Home;
