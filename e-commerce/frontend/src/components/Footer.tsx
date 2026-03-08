import React from "react";
import { Link } from "react-router-dom";
import {
  Instagram,
  Facebook,
  Twitter,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-400 text-white">
      {/* Newsletter Section */}
      <div className="bg-primary-500 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-dark-400 text-2xl font-bold tracking-wider mb-2">
            JOIN THE MOVEMENT
          </h3>
          <p className="text-dark-300 text-sm mb-6">
            Get exclusive drops, behind-the-scenes, and 10% off your first order
          </p>
          <form
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 bg-white text-dark-400 px-4 py-3 text-sm focus:outline-none placeholder-gray-400"
            />
            <button
              type="submit"
              className="bg-dark-400 text-white px-6 py-3 text-xs font-bold tracking-widest uppercase hover:bg-dark-300 transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <h2 className="text-3xl font-bold tracking-[0.3em] text-white">URBAN</h2>
              <p className="text-xs tracking-[0.6em] text-primary-500 -mt-1">NILE</p>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Modern streetwear inspired by Egypt's timeless culture and the
              eternal Nile. Wear the river. Live the culture.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Instagram, href: "#" },
                { Icon: Facebook, href: "#" },
                { Icon: Twitter, href: "#" },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 border border-white/20 flex items-center justify-center text-gray-400 hover:bg-primary-500 hover:border-primary-500 hover:text-white transition-all duration-300"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.3em] uppercase mb-5 text-primary-500">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { to: "/", label: "Home" },
                { to: "/products", label: "Shop All" },
                { to: "/products?category=T-Shirts", label: "T-Shirts" },
                { to: "/products?category=Hoodies", label: "Hoodies" },
                { to: "/products?category=Sets", label: "Sets" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-white text-sm transition-colors duration-300 hover:pl-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.3em] uppercase mb-5 text-primary-500">
              Customer Care
            </h4>
            <ul className="space-y-3">
              {[
                "Size Guide",
                "Shipping & Returns",
                "FAQ",
                "Contact Us",
                "Privacy Policy",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm transition-colors duration-300 hover:pl-1"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.3em] uppercase mb-5 text-primary-500">
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-primary-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  123 Tahrir Square, Cairo, Egypt
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-primary-500 flex-shrink-0" />
                <a
                  href="tel:+201000000000"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  +20 100 000 0000
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-primary-500 flex-shrink-0" />
                <a
                  href="mailto:support@urbannile.com"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  support@urbannile.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} Urban Nile. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs tracking-widest uppercase">
            Wear The River. Live The Culture.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;