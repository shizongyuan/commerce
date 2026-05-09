"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { MessageCircle, ShoppingBag, ChevronRight, Shield, Truck, Gift, Star, Gem, Zap, Headphones, Bot, Instagram, Youtube, MessageSquare } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { AnimatedSection, FloatingOrb, MagneticWrapper } from "@/components/animated-section";

const agents = [
  { id: "xiaoxue", name: "小雪", avatar: "/images/agents/ai_xiaoxue.webp", specialty: "产品咨询 | 订单查询" },
  { id: "xiaobing", name: "小冰", avatar: "/images/agents/ai_xiaobing.webp", specialty: "物流跟踪 | 售后服务" },
  { id: "xiaoyu", name: "小雨", avatar: "/images/agents/ai_xiaoyu.webp", specialty: "投诉建议 | 优惠活动" },
];

const navItems = [
  { href: "/products", label: "产品", sublabel: "Products" },
  { href: "/about", label: "关于我们", sublabel: "About" },
  { href: "/contact", label: "联系我们", sublabel: "Contact" },
];

export default function WebsiteHome() {
  const { products, isLoading } = useProducts();
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-apple-gray-3/50 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <MagneticWrapper strength={0.1}>
              <Link
                href="/"
                className="text-xl font-semibold text-apple-gray-1 tracking-tight hover:text-hermes-orange transition-colors text-center group"
              >
                <span className="block group-hover:scale-105 transition-transform duration-300">焕美严选</span>
                <span className="block text-xs font-normal tracking-wider text-apple-gray-2 group-hover:text-hermes-orange transition-colors">HUANMEI</span>
              </Link>
            </MagneticWrapper>
            <div className="flex items-center gap-8">
              <nav className="hidden md:flex items-center gap-8">
                {navItems.map((item, idx) => (
                  <MagneticWrapper key={item.href} strength={0.15}>
                    <Link
                      href={item.href}
                      className="group flex flex-col items-center relative"
                    >
                      <span className="text-sm text-apple-gray-2 group-hover:text-hermes-orange transition-colors duration-300 leading-tight">{item.label}</span>
                      <span className="text-[10px] text-apple-gray-2/70 leading-tight transition-all duration-300 group-hover:text-hermes-orange/70">{item.sublabel}</span>
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-hermes-orange transition-all duration-300 group-hover:w-full" />
                    </Link>
                  </MagneticWrapper>
                ))}
              </nav>
              <MagneticWrapper strength={0.2}>
                <a
                  href="http://localhost:3000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-magnetic btn-glow px-5 py-2.5 bg-gradient-to-r from-hermes-orange to-hermes-orange-light text-white text-sm font-medium rounded-full hover:shadow-lg hover:shadow-hermes-orange/25"
                >
                  AI管理入口
                </a>
              </MagneticWrapper>
            </div>
          </div>
        </div>
      </header>

      {/* Hero - 品牌故事 */}
      <section ref={heroRef} className="relative min-h-[100vh] flex items-center overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0f0f0f]">
        {/* Dynamic Background Layer */}
        <div className="absolute inset-0">
          {/* Animated Grid */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(rgba(230, 92, 0, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(230, 92, 0, 0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            transform: `translateY(${scrollY * 0.1}px)`,
          }} />

          {/* Floating Orbs */}
          <FloatingOrb className="top-0 left-1/4" color="orange" size="lg" />
          <FloatingOrb className="bottom-0 right-1/4" color="gold" size="md" />
          <FloatingOrb className="top-1/3 right-1/6" color="white" size="sm" />

          {/* Animated Particles */}
          <div className="absolute top-1/4 left-1/6 w-2 h-2 bg-hermes-orange/50 rounded-full animate-float" />
          <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-white/40 rounded-full animate-float-delayed" />
          <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-hermes-orange/40 rounded-full animate-float-slow" />
          <div className="absolute top-1/2 right-1/6 w-1 h-1 bg-white/30 rounded-full animate-float" />
          <div className="absolute top-1/4 right-1/3 w-3 h-3 bg-gold/20 rounded-full animate-float-slow" />

          {/* Decorative Lines */}
          <div className="absolute top-20 left-0 w-40 h-[1px] bg-gradient-to-r from-transparent via-hermes-orange/60 to-transparent" />
          <div className="absolute bottom-40 right-0 w-60 h-[1px] bg-gradient-to-l from-transparent via-hermes-orange/40 to-transparent" />
          <div className="absolute top-1/3 left-0 w-[1px] h-40 bg-gradient-to-b from-transparent via-[#D4AF37]/50 to-transparent" />
          <div className="absolute bottom-1/4 right-8 w-[1px] h-60 bg-gradient-to-t from-transparent via-hermes-orange/40 to-transparent" />

          {/* Rotating Decorative Circle */}
          <div className="absolute top-1/4 right-1/4 w-64 h-64 border border-hermes-orange/10 rounded-full animate-rotate-slow" />
          <div className="absolute top-1/4 right-1/4 w-48 h-48 border border-[#D4AF37]/10 rounded-full animate-rotate-slow" style={{ animationDirection: 'reverse' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-8 lg:px-16 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
            {/* Left Content - Brand Story */}
            <div className="space-y-10">
              {/* Brand Label */}
              <AnimatedSection delay={0}>
                <div className="flex items-center gap-4 group">
                  <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-hermes-orange transition-all duration-500 group-hover:w-24" />
                  <span className="text-[#D4AF37] text-sm tracking-[0.3em] uppercase font-light animate-shimmer">
                    Est. 2015 · Premium Selection
                  </span>
                </div>
              </AnimatedSection>

              {/* Main Title */}
              <AnimatedSection delay={100}>
                <h1 className="text-5xl md:text-6xl lg:text-8xl font-extralight text-white tracking-tight leading-[1.05]">
                  <span className="block text-[#E5E5E5] mb-3 animate-reveal-up" style={{ animationDelay: '200ms' }}>焕美</span>
                  <span className="block bg-gradient-to-r from-hermes-orange via-[#FF8533] to-[#D4AF37] bg-clip-text text-transparent text-gradient-animated">
                    严选
                  </span>
                </h1>
              </AnimatedSection>

              {/* Brand Story */}
              <AnimatedSection delay={200}>
                <div className="space-y-6 max-w-lg">
                  <p className="text-lg text-[#E5E5E5]/80 leading-relaxed font-light">
                    从一瓶精华的匠心甄选，到一套护肤方案的全程呵护。
                    <br />
                    我们相信，美不是奢望，而是生活应有的仪式感。
                  </p>
                  <div className="w-20 h-[1px] bg-gradient-to-r from-hermes-orange to-transparent" />
                  <p className="text-[#86868B] leading-relaxed">
                    七年间，我们走遍全球只为寻找那一抹纯粹。
                    <br />
                    携手 AI 科技，让每一位顾客都能找到专属的美丽方案。
                  </p>
                </div>
              </AnimatedSection>

              {/* Stats */}
              <AnimatedSection delay={300}>
                <div className="flex gap-12 pt-4">
                  {[
                    { num: "7+", label: "年品质坚守", suffix: "" },
                    { num: "500", label: "全球好物", suffix: "+" },
                    { num: "24", label: "AI 服务", suffix: "h" },
                  ].map((stat, idx) => (
                    <div key={stat.label} className="text-center lg:text-left group">
                      <div className="text-4xl md:text-5xl font-extralight bg-gradient-to-r from-hermes-orange to-[#FF8533] bg-clip-text text-transparent transition-all duration-500 group-hover:scale-110">
                        {stat.num}{stat.suffix}
                      </div>
                      <div className="text-xs text-[#86868B] mt-2 tracking-wider">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </AnimatedSection>

              {/* CTA Buttons */}
              <AnimatedSection delay={400}>
                <div className="flex flex-wrap gap-5 pt-4">
                  <MagneticWrapper strength={0.25}>
                    <Link
                      href="/products"
                      className="group relative px-10 py-5 bg-gradient-to-r from-hermes-orange via-[#E65C00] to-hermes-orange text-white font-light tracking-wider overflow-hidden rounded-full transition-all duration-500 hover:shadow-[0_0_50px_rgba(230,92,0,0.5)]"
                    >
                      <span className="relative z-10 flex items-center gap-4">
                        探索臻品
                        <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </Link>
                  </MagneticWrapper>
                  <MagneticWrapper strength={0.2}>
                    <Link
                      href="/about"
                      className="group px-10 py-5 border border-white/20 text-white font-light tracking-wider rounded-full hover:border-hermes-orange/60 hover:bg-hermes-orange/10 transition-all duration-500"
                    >
                      <span className="flex items-center gap-4">
                        了解更多
                        <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-y-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </Link>
                  </MagneticWrapper>
                </div>
              </AnimatedSection>
            </div>

            {/* Right Content - Hero Image */}
            <AnimatedSection delay={200} direction="fade">
              <div className="relative group">
                {/* Main Image Container */}
                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
                  <img
                    src="https://images.unsplash.com/photo-1571781926291-c477ebfd024b?fm=jpg&w=800"
                    alt="焕美严选 HUANMEI"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-8 -right-8 w-40 h-40 border-2 border-hermes-orange/30 rounded-full animate-pulse-ring" />
                <div className="absolute -bottom-6 -left-6 w-32 h-32 border border-[#D4AF37]/30 rounded-full" />

                {/* Corner Accents */}
                <div className="absolute top-0 right-0 w-20 h-20">
                  <div className="absolute top-0 right-0 w-10 h-[1px] bg-gradient-to-l from-hermes-orange transition-all duration-500" />
                  <div className="absolute top-0 right-0 w-[1px] h-10 bg-gradient-to-b from-hermes-orange transition-all duration-500" />
                </div>

                {/* Floating Badge */}
                <div className="absolute bottom-8 left-8 px-5 py-3 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl animate-float-slow">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-hermes-orange to-hermes-orange-light rounded-xl flex items-center justify-center">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-apple-gray-1">精选好物</p>
                      <p className="text-xs text-apple-gray-2">源自全球</p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>

        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#FAFAFA] to-transparent" />

        {/* Scroll Indicator */}
        <AnimatedSection delay={1200}>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-[#86868B]">
            <span className="text-xs tracking-widest uppercase">Scroll</span>
            <div className="w-[1px] h-16 bg-gradient-to-b from-hermes-orange to-transparent animate-scroll-indicator" />
          </div>
        </AnimatedSection>
      </section>

      {/* Trust Badges */}
      <section className="bg-gradient-to-b from-[#FAFAFA] to-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 noise-overlay" />
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Shield, text: "正品保障", desc: "假一赔十" },
              { icon: Truck, text: "极速发货", desc: "下单即发" },
              { icon: MessageCircle, text: "AI客服 24h", desc: "随时响应" },
              { icon: Gift, text: "新人专享", desc: "首单优惠" },
            ].map((item, i) => (
              <AnimatedSection key={i} delay={i * 100} direction="scale">
                <MagneticWrapper strength={0.1}>
                  <div className="group relative p-6 bg-white rounded-2xl border border-apple-gray-3/20 hover:border-hermes-orange/30 hover:shadow-[0_8px_40px_rgba(230,92,0,0.15)] transition-all duration-500 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-hermes-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                    <div className="relative flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-hermes-orange to-hermes-orange-light flex items-center justify-center shadow-lg shadow-hermes-orange/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                        <item.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-apple-gray-1 block">{item.text}</span>
                        <span className="text-xs text-apple-gray-2">{item.desc}</span>
                      </div>
                    </div>
                  </div>
                </MagneticWrapper>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <AnimatedSection>
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-semibold text-apple-gray-1 mb-3 tracking-tight">
                热门好物
              </h2>
              <p className="text-apple-gray-2">精选品质，值得信赖</p>
            </div>
            <MagneticWrapper strength={0.15}>
              <Link
                href="/products"
                className="group flex items-center gap-2 text-sm text-hermes-orange hover:text-hermes-orange-light transition-colors font-medium"
              >
                <span>查看全部</span>
                <ChevronRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" />
              </Link>
            </MagneticWrapper>
          </div>
        </AnimatedSection>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gradient-to-br from-apple-gray-4 to-apple-gray-3 rounded-2xl mb-4" />
                <div className="h-4 bg-apple-gray-3 rounded w-3/4 mb-2" />
                <div className="h-4 bg-apple-gray-3 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product, i) => (
              <AnimatedSection key={product.id} delay={i * 80} direction="up">
                <MagneticWrapper strength={0.08}>
                  <Link
                    href={`/products/${product.id}`}
                    className="group card-3d-effect bg-white rounded-2xl p-4 border border-apple-gray-3/30 hover:border-hermes-orange/40 hover:shadow-[0_20px_60px_rgba(230,92,0,0.2)] transition-all duration-500"
                  >
                    <div className="aspect-square bg-gradient-to-br from-apple-gray-4 to-apple-gray-3 rounded-xl mb-4 overflow-hidden relative">
                      {product.images && product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <ShoppingBag className="w-12 h-12 text-apple-gray-3" />
                        </div>
                      )}
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-hermes-orange/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      {/* Quick View Badge */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="px-4 py-2 bg-white/95 backdrop-blur-sm text-sm font-medium text-apple-gray-1 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          查看详情
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-hermes-orange font-medium mb-2 tracking-wide">{product.category}</p>
                    <h3 className="text-sm font-medium text-apple-gray-1 line-clamp-2 group-hover:text-hermes-orange transition-colors duration-300 min-h-[2.5rem]">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-xl font-bold bg-gradient-to-r from-hermes-orange to-[#FF8533] bg-clip-text text-transparent">
                        ¥{product.price}
                      </p>
                      {product.rating && (
                        <span className="flex items-center gap-1 text-xs bg-apple-gray-4 px-2 py-1 rounded-full">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-apple-gray-2">{product.rating}</span>
                        </span>
                      )}
                    </div>
                  </Link>
                </MagneticWrapper>
              </AnimatedSection>
            ))}
          </div>
        )}
      </section>

      {/* AI Chat CTA */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <AnimatedSection direction="fade">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0f0f0f] rounded-[2rem]">
            {/* Background decoration */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-hermes-orange/40 to-transparent rounded-full blur-[120px] animate-pulse" />
              <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-tr from-[#D4AF37]/30 to-transparent rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
              {/* Animated grid */}
              <div className="absolute inset-0 opacity-[0.05]" style={{
                backgroundImage: `linear-gradient(rgba(230, 92, 0, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(230, 92, 0, 0.5) 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
              }} />
              <div className="absolute top-1/2 right-8 w-[1px] h-64 bg-gradient-to-b from-transparent via-hermes-orange/50 to-transparent" />
              <div className="absolute top-1/3 left-8 w-[1px] h-48 bg-gradient-to-b from-transparent via-[#D4AF37]/40 to-transparent" />
            </div>

            <div className="relative z-10 grid md:grid-cols-2 gap-12 p-12 md:p-16 items-center">
              {/* Left - Text */}
              <div className="space-y-8">
                <MagneticWrapper strength={0.1}>
                  <div className="inline-flex items-center gap-3 px-5 py-3 bg-hermes-orange/20 rounded-full border border-hermes-orange/40">
                    <Bot className="w-5 h-5 text-hermes-orange" />
                    <span className="text-sm text-hermes-orange font-medium tracking-wide">AI 智能客服</span>
                  </div>
                </MagneticWrapper>
                <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight leading-tight">
                  有任何疑问？
                  <br />
                  <span className="bg-gradient-to-r from-hermes-orange to-[#FF8533] bg-clip-text text-transparent">AI 员工</span> 全天候在线
                </h2>
                <p className="text-lg text-gray-400 leading-relaxed">
                  选择您想要咨询的 AI 员工，他们 7×24 小时在线，随时为您服务。
                </p>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
                    <span>3 位 AI 员工在线</span>
                  </div>
                  <span className="w-1 h-1 bg-gray-600 rounded-full" />
                  <span>平均响应 &lt; 1 分钟</span>
                </div>
              </div>

              {/* Right - Agent Selection */}
              <div className="space-y-4">
                {agents.map((agent, idx) => (
                  <AnimatedSection key={agent.id} delay={idx * 100} direction="right">
                    <MagneticWrapper strength={0.15}>
                      <Link
                        href={`/chat?agent=${agent.id}`}
                        className="group flex items-center gap-5 p-5 bg-white/[0.03] hover:bg-white/[0.08] rounded-2xl border border-white/[0.08] hover:border-hermes-orange/50 backdrop-blur-sm transition-all duration-500"
                      >
                        {/* Avatar */}
                        <div className="relative w-16 h-16 rounded-full overflow-hidden shadow-xl flex-shrink-0 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500">
                          <Image
                            src={agent.avatar}
                            alt={agent.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-br from-hermes-orange/20 to-transparent" />
                          <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-400 rounded-full border-2 border-[#0a0a0a]" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-medium text-white">{agent.name}</span>
                            <span className="text-xs text-gray-400 px-2 py-1 bg-white/5 rounded-full">{agent.specialty}</span>
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="w-10 h-10 rounded-full bg-hermes-orange/20 flex items-center justify-center group-hover:bg-hermes-orange group-hover:scale-110 transition-all duration-500">
                          <ChevronRight className="w-5 h-5 text-hermes-orange group-hover:text-white" />
                        </div>
                      </Link>
                    </MagneticWrapper>
                  </AnimatedSection>
                ))}
              </div>
            </div>

            {/* Bottom gradient line */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-hermes-orange to-transparent" />
          </div>
        </AnimatedSection>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <AnimatedSection>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-semibold text-apple-gray-1 mb-4 tracking-tight">
              为什么选择我们
            </h2>
            <p className="text-apple-gray-2 text-lg">品质与服务并重</p>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "严格选品",
              desc: "每一件商品都经过精心挑选，品质为先",
              icon: Gem,
            },
            {
              title: "极速物流",
              desc: "智能仓储系统，下单即发货",
              icon: Zap,
            },
            {
              title: "专属服务",
              desc: "AI+人工双重客服，随时解决您的问题",
              icon: Headphones,
            },
          ].map((feature, i) => (
            <AnimatedSection key={feature.title} delay={i * 120} direction="up">
              <MagneticWrapper strength={0.1}>
                <div className="group relative p-10 bg-white border border-apple-gray-3/30 rounded-3xl hover:border-hermes-orange/40 hover:shadow-[0_25px_80px_rgba(230,92,0,0.15)] transition-all duration-500 hover:-translate-y-3">
                  {/* Background gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-hermes-orange/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />

                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-hermes-orange to-hermes-orange-light rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-hermes-orange/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                      <feature.icon className="w-7 h-7 text-white stroke-1.5" />
                    </div>
                    <h3 className="text-xl font-semibold text-apple-gray-1 mb-4 group-hover:text-hermes-orange transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-apple-gray-2 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>

                  {/* Corner decoration */}
                  <div className="absolute top-4 right-4 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="w-full h-[1px] bg-hermes-orange/30" />
                    <div className="w-[1px] h-full bg-hermes-orange/30 absolute top-0 right-0" />
                  </div>
                </div>
              </MagneticWrapper>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <AnimatedSection direction="fade">
          <div className="relative overflow-hidden bg-gradient-to-r from-apple-gray-4 via-white to-apple-gray-4 rounded-[2rem] p-12 md:p-16 border border-apple-gray-3/30">
            {/* Background decoration */}
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br from-hermes-orange/10 to-transparent rounded-full blur-[80px]" />
            </div>

            <div className="relative max-w-xl mx-auto text-center">
              <h2 className="text-3xl font-semibold text-apple-gray-1 mb-4 tracking-tight">
                订阅专属优惠
              </h2>
              <p className="text-apple-gray-2 mb-10 text-lg">
                输入邮箱，获取最新优惠信息和专属折扣
              </p>
              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                <div className="relative flex-1">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-6 py-4 bg-white border border-apple-gray-3 rounded-full text-sm focus:outline-none focus:border-hermes-orange focus:ring-4 focus:ring-hermes-orange/10 transition-all duration-300"
                  />
                </div>
                <MagneticWrapper strength={0.15}>
                  <button
                    type="submit"
                    className="px-8 py-4 bg-gradient-to-r from-hermes-orange to-hermes-orange-light text-white text-sm font-medium rounded-full hover:shadow-lg hover:shadow-hermes-orange/30 hover:-translate-y-1 transition-all duration-300"
                  >
                    订阅
                  </button>
                </MagneticWrapper>
              </form>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="border-t border-apple-gray-3 py-20 mt-8 bg-gradient-to-b from-white to-apple-gray-4">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div>
              <h3 className="text-2xl font-bold text-apple-gray-1 mb-4">焕美严选 <span className="text-hermes-orange">HUANMEI</span></h3>
              <p className="text-sm text-apple-gray-2 leading-relaxed mb-6">
                品质生活，从这里开始。精选全球好物，让购物变得简单快乐。
              </p>
              <div className="flex gap-4">
                {[
                  { icon: Instagram, label: "Instagram" },
                  { icon: MessageSquare, label: "Weibo" },
                  { icon: Youtube, label: "Douyin" },
                ].map((social) => (
                  <MagneticWrapper key={social.label} strength={0.2}>
                    <div className="w-11 h-11 bg-apple-gray-4 rounded-full flex items-center justify-center text-apple-gray-2 hover:bg-hermes-orange hover:text-white transition-all duration-300 cursor-pointer group">
                      <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </div>
                  </MagneticWrapper>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-apple-gray-1 mb-5 text-lg">快速链接</h4>
              <ul className="space-y-3">
                {[
                  { href: "/products", label: "产品列表", sublabel: "Products" },
                  { href: "/chat", label: "在线咨询", sublabel: "Chat" },
                  { href: "/contact", label: "联系我们", sublabel: "Contact" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex flex-col hover:text-hermes-orange transition-colors duration-300"
                    >
                      <span className="text-sm">{link.label}</span>
                      <span className="text-xs text-apple-gray-2/70 group-hover:text-hermes-orange/70">{link.sublabel}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-apple-gray-1 mb-5 text-lg">客户服务</h4>
              <ul className="space-y-3">
                {[
                  { label: "退货政策", sublabel: "Return Policy" },
                  { label: "配送说明", sublabel: "Shipping" },
                  { label: "常见问题", sublabel: "FAQ" },
                ].map((item) => (
                  <li key={item.label}>
                    <span className="group flex flex-col cursor-pointer hover:text-hermes-orange transition-colors duration-300">
                      <span className="text-sm">{item.label}</span>
                      <span className="text-xs text-apple-gray-2/70 group-hover:text-hermes-orange/70">{item.sublabel}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-apple-gray-1 mb-5 text-lg">联系我们</h4>
              <ul className="space-y-3 text-sm text-apple-gray-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-hermes-orange rounded-full" />
                  客服热线：400-xxx-xxxx
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-hermes-orange rounded-full" />
                  服务时间：9:00 - 22:00
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-hermes-orange rounded-full" />
                  邮箱：contact@example.com
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-apple-gray-3 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-apple-gray-2">
              © 2026 焕美严选 HUANMEI. 品质好物，智能服务
            </p>
            <div className="flex gap-8">
              <span className="text-sm text-apple-gray-2 cursor-pointer hover:text-hermes-orange transition-colors">隐私政策</span>
              <span className="text-sm text-apple-gray-2 cursor-pointer hover:text-hermes-orange transition-colors">服务条款</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
