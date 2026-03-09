import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Star,
  ChevronLeft,
  ChevronRight,
  Instagram,
  Truck,
  Shield,
  RefreshCw,
  Headphones,
} from "lucide-react";
import { productService } from "../services/productService";
import { Product } from "../types";
import ProductCard from "../components/ProductCard";
import LoadingSpinner from "../components/LoadingSpinner";

const reviews = [
  {
    id: 1,
    name: "Ahmed Hassan",
    location: "Cairo",
    rating: 5,
    text: "Best streetwear brand in Egypt! The quality is unmatched and the designs are so unique. Pharaoh Street Tee is my go-to piece.",
    avatar: "AH",
  },
  {
    id: 2,
    name: "Nour El-Din",
    location: "Alexandria",
    rating: 5,
    text: "Urban Nile perfectly blends Egyptian culture with modern fashion. I get compliments every time I wear my Nile Wave Hoodie.",
    avatar: "NE",
  },
  {
    id: 3,
    name: "Mariam Khalil",
    location: "Giza",
    rating: 5,
    text: "Fast delivery, excellent packaging, and the clothes look even better in person. Will definitely order again!",
    avatar: "MK",
  },
  {
    id: 4,
    name: "Omar Farouk",
    location: "Luxor",
    rating: 4,
    text: "The Luxor Tracksuit Set is absolutely fire! Great fit and the quality of the fabric is premium. Worth every pound.",
    avatar: "OF",
  },
  {
    id: 5,
    name: "Sara Mostafa",
    location: "Cairo",
    rating: 5,
    text: "Finally a local brand that understands streetwear. The attention to detail is incredible. Urban Nile for life!",
    avatar: "SM",
  },
];

const instagramPosts = [
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&q=80",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80",
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80",
];

const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentReview, setCurrentReview] = useState(0);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await productService.getProducts({ featured: true, limit: 4 });
        setFeaturedProducts(data.products);
      } catch (err) {
        console.error("Failed to fetch featured products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ── */}
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-dark-400">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80"
            alt="Urban Nile Hero"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark-400/60 via-dark-400/40 to-dark-400/90" />
        </div>

        {/* Decorative Lines */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 w-px h-32 bg-primary-500/40 hidden lg:block" />
        <div className="absolute right-8 top-1/2 -translate-y-1/2 w-px h-32 bg-primary-500/40 hidden lg:block" />

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto animate-fade-in">
          <p className="text-primary-500 text-xs md:text-sm tracking-[0.5em] uppercase font-medium mb-6 animate-slide-up">
            Egyptian Streetwear Brand
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-bold text-white tracking-[0.15em] mb-2 animate-slide-up">
            URBAN
          </h1>
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-bold text-primary-500 tracking-[0.4em] mb-8 animate-slide-up">
            NILE
          </h1>
          <p className="text-gray-300 text-base md:text-xl tracking-widest uppercase font-light mb-12 animate-slide-up">
            Modern Streetwear Inspired by the Nile
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Link
              to="/products"
              className="group inline-flex items-center gap-3 bg-primary-500 text-dark-400 px-10 py-4 text-sm font-bold tracking-widest uppercase hover:bg-white transition-all duration-300"
            >
              Shop Collection
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#about"
              className="inline-flex items-center gap-3 border border-white/30 text-white px-10 py-4 text-sm font-bold tracking-widest uppercase hover:border-primary-500 hover:text-primary-500 transition-all duration-300"
            >
              Our Story
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-gray-500 text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-primary-500 to-transparent" />
        </div>
      </section>

      {/* ── Features Bar ── */}
      <section className="bg-dark-300 border-y border-white/5 py-5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { Icon: Truck, text: "Free Shipping Over EGP 800" },
              { Icon: Shield, text: "Premium Quality Guaranteed" },
              { Icon: RefreshCw, text: "Easy 30-Day Returns" },
              { Icon: Headphones, text: "24/7 Customer Support" },
            ].map(({ Icon, text }, i) => (
              <div key={i} className="flex items-center gap-3 justify-center">
                <Icon size={18} className="text-primary-500 flex-shrink-0" />
                <span className="text-gray-400 text-xs tracking-wide">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-primary-500 text-xs tracking-[0.4em] uppercase font-semibold mb-3">
              Curated Selection
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-dark-400 tracking-wider mb-4">
              FEATURED DROPS
            </h2>
            <div className="w-16 h-0.5 bg-primary-500 mx-auto" />
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="md" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              <div className="text-center mt-12">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-3 border-2 border-dark-400 text-dark-400 px-12 py-4 text-sm font-bold tracking-widest uppercase hover:bg-dark-400 hover:text-white transition-all duration-300 group"
                >
                  View All Products
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── About Section ── */}
      <section id="about" className="py-20 bg-dark-400 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Images Grid */}
            <div className="relative grid grid-cols-2 gap-4 h-[500px]">
              <div className="space-y-4">
                <img
                  src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&q=80"
                  alt="Urban Nile Style"
                  className="w-full h-56 object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1516826957135-700dedea698c?w=400&q=80"
                  alt="Urban Nile Style"
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="mt-10 space-y-4">
                <img
                  src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80"
                  alt="Urban Nile Style"
                  className="w-full h-48 object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80"
                  alt="Urban Nile Style"
                  className="w-full h-56 object-cover"
                />
              </div>
              {/* Accent */}
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-primary-500 z-0" />
            </div>

            {/* Text Content */}
            <div className="text-white">
              <p className="text-primary-500 text-xs tracking-[0.4em] uppercase font-semibold mb-4">
                Our Story
              </p>
              <h2 className="text-4xl md:text-5xl font-bold tracking-wider mb-6 leading-tight">
                BORN FROM THE{" "}
                <span className="text-primary-500">NILE</span>
              </h2>
              <div className="w-12 h-0.5 bg-primary-500 mb-8" />
              <p className="text-gray-300 leading-relaxed mb-6 text-sm md:text-base">
                Urban Nile was born in the heart of Cairo, where ancient
                pyramids meet modern street culture. We believe that Egyptian
                heritage is not just history — it's a living, breathing source
                of inspiration for today's generation.
              </p>
              <p className="text-gray-400 leading-relaxed mb-8 text-sm md:text-base">
                Every piece in our collection tells a story — from the
                hieroglyphic-inspired prints to the sand beige color palettes
                that echo the desert landscape. We craft premium streetwear that
                honors where we come from while pushing boundaries of where
                we're going.
              </p>

              <div className="grid grid-cols-3 gap-6 mb-10">
                {[
                  { value: "5K+", label: "Happy Customers" },
                  { value: "50+", label: "Unique Designs" },
                  { value: "100%", label: "Egyptian Cotton" },
                ].map((stat) => (
                  <div key={stat.label} className="border-l-2 border-primary-500 pl-4">
                    <p className="text-2xl font-bold text-primary-500">{stat.value}</p>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mt-1">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              <Link
                to="/products"
                className="inline-flex items-center gap-3 bg-primary-500 text-dark-400 px-8 py-4 text-sm font-bold tracking-widest uppercase hover:bg-white transition-all duration-300 group"
              >
                Shop The Collection
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories Banner ── */}
      <section className="py-20 bg-sand-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary-500 text-xs tracking-[0.4em] uppercase font-semibold mb-3">
              Browse By Style
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-dark-400 tracking-wider">
              SHOP BY CATEGORY
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "T-Shirts", img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&q=80" },
              { name: "Hoodies", img: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=300&q=80" },
              { name: "Joggers", img: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&q=80" },
              { name: "Jackets", img: "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=300&q=80" },
              { name: "Sets", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&q=80" },
              { name: "Accessories", img: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=300&q=80" },
            ].map((cat) => (
              <Link
                key={cat.name}
                to={`/products?category=${cat.name}`}
                className="group relative overflow-hidden aspect-square rounded-none"
              >
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-dark-400/50 group-hover:bg-dark-400/70 transition-colors duration-300 flex items-end p-4">
                  <div>
                    <p className="text-white font-bold text-sm tracking-widest uppercase">
                      {cat.name}
                    </p>
                    <p className="text-primary-400 text-xs mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      Shop Now →
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section id="reviews" className="py-20 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-primary-500 text-xs tracking-[0.4em] uppercase font-semibold mb-3">
              What People Say
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-dark-400 tracking-wider mb-4">
              CUSTOMER REVIEWS
            </h2>
            <div className="w-16 h-0.5 bg-primary-500 mx-auto" />
          </div>

          {/* Featured Review */}
          <div className="bg-dark-400 p-10 md:p-14 text-center relative mb-6">
            <div className="text-primary-500 text-7xl font-serif absolute top-6 left-8 opacity-30">
              "
            </div>
            <div className="flex justify-center mb-4">
              {[...Array(reviews[currentReview].rating)].map((_, i) => (
                <Star key={i} size={18} className="text-primary-500 fill-current" />
              ))}
            </div>
            <p className="text-white text-base md:text-xl leading-relaxed mb-8 italic relative z-10 max-w-2xl mx-auto">
              "{reviews[currentReview].text}"
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-dark-400 font-bold text-sm">
                {reviews[currentReview].avatar}
              </div>
              <div className="text-left">
                <p className="text-white font-semibold text-sm">
                  {reviews[currentReview].name}
                </p>
                <p className="text-gray-500 text-xs">{reviews[currentReview].location}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() =>
                setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length)
              }
              className="w-10 h-10 border border-dark-400 flex items-center justify-center text-dark-400 hover:bg-dark-400 hover:text-white transition-all duration-300"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-2">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentReview(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === currentReview ? "bg-primary-500 w-6" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setCurrentReview((prev) => (prev + 1) % reviews.length)}
              className="w-10 h-10 border border-dark-400 flex items-center justify-center text-dark-400 hover:bg-dark-400 hover:text-white transition-all duration-300"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Instagram Gallery ── */}
      <section className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary-500 text-xs tracking-[0.4em] uppercase font-semibold mb-3">
              Follow @UrbanNile
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-dark-400 tracking-wider mb-2 flex items-center justify-center gap-3">
              <Instagram size={32} className="text-primary-500" />
              INSTAGRAM
            </h2>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {instagramPosts.map((src, i) => (
              <a
                key={i}
                href="#"
                className="group relative overflow-hidden aspect-square"
              >
                <img
                  src={src}
                  alt={`Instagram post ${i + 1}`}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-primary-500/0 group-hover:bg-primary-500/40 transition-colors duration-300 flex items-center justify-center">
                  <Instagram
                    size={24}
                    className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-24 bg-primary-500 text-center px-4">
        <p className="text-dark-400 text-xs tracking-[0.5em] uppercase font-semibold mb-4">
          Limited Drops
        </p>
        <h2 className="text-4xl md:text-6xl font-bold text-dark-400 tracking-wider mb-6">
          WEAR THE RIVER
        </h2>
        <p className="text-dark-300 text-sm md:text-base max-w-xl mx-auto mb-10 leading-relaxed">
          New collections dropping every season. Be the first to know when the
          next limited drop lands. Sign up and secure your piece of Egyptian
          streetwear history.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-3 bg-dark-400 text-white px-12 py-5 text-sm font-bold tracking-widest uppercase hover:bg-dark-300 transition-all duration-300 group"
        >
          Shop Now
          <ArrowRight
            size={16}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </section>
    </div>
  );
};

export default HomePage;