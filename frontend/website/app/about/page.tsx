"use client";

import Link from "next/link";
import { ChevronLeft, Sparkles, Users, TrendingUp, Award } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";

const milestones = [
  { year: "2015", event: "公司成立，开始运营" },
  { year: "2018", event: "开设第一家线下体验店" },
  { year: "2020", event: "启动数字化转型战略" },
  { year: "2024", event: "引入 AI 智能化服务" },
  { year: "2026", event: "企业 AI 管理平台正式上线" },
];

const team = [
  { name: "张明", role: "创始人 & CEO", desc: "15年电商行业经验" },
  { name: "李华", role: "技术负责人", desc: "前阿里技术专家" },
  { name: "王芳", role: "运营总监", desc: "10年品牌运营经验" },
  { name: "刘伟", role: "AI 产品负责人", desc: "AI 技术领域专家" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-apple-gray-4">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-apple-gray-3/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-4 h-16">
            <Link
              href="/"
              className="flex items-center gap-2 text-apple-gray-2 hover:text-apple-gray-1 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">返回</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-6 py-4">
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/" className="text-apple-gray-2 hover:text-hermes-orange transition-colors">首页</Link>
          <span className="text-apple-gray-3">/</span>
          <span className="text-apple-gray-1 font-medium">关于我们</span>
        </nav>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero */}
        <AnimatedSection>
          <div className="text-center mb-20">
            <h1 className="text-5xl font-semibold text-apple-gray-1 tracking-tight mb-6">
              关于焕美严选
            </h1>
            <p className="text-xl text-apple-gray-2 max-w-2xl mx-auto leading-relaxed">
              致力于成为最懂消费者的电商平台，让购物变得简单快乐。
              <br />
              用科技定义品质生活，用 AI 提升服务体验。
            </p>
          </div>
        </AnimatedSection>

        {/* Values */}
        <AnimatedSection direction="fade">
          <div className="grid md:grid-cols-4 gap-6 mb-20">
            {[
              { icon: Sparkles, label: "客户至上", desc: "一切以用户需求为核心" },
              { icon: TrendingUp, label: "创新进取", desc: "持续探索新技术新体验" },
              { icon: Users, label: "合作共赢", desc: "与伙伴共同成长" },
              { icon: Award, label: "诚信经营", desc: "正品保障，透明定价" },
            ].map((value, i) => (
              <AnimatedSection key={value.label} delay={i * 100} direction="up">
                <div className="p-8 bg-white rounded-3xl border border-apple-gray-3/30 hover:border-hermes-orange/30 hover:shadow-2xl transition-all duration-300 text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-hermes-orange to-hermes-orange-light rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-hermes-orange/20 group-hover:scale-110 transition-transform">
                    <value.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-apple-gray-1 mb-2">{value.label}</h3>
                  <p className="text-sm text-apple-gray-2">{value.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>

        {/* Timeline */}
        <AnimatedSection direction="fade">
          <div className="mb-20">
            <h2 className="text-3xl font-semibold text-apple-gray-1 tracking-tight mb-10 text-center">
              发展历程
            </h2>
            <div className="relative">
              <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-hermes-orange to-hermes-orange-light" />
              <div className="space-y-12">
                {milestones.map((m, i) => (
                  <AnimatedSection key={m.year} delay={i * 100} direction={i % 2 === 0 ? "left" : "right"}>
                    <div className={`flex items-center gap-8 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}>
                      <div className={`flex-1 ${i % 2 === 0 ? "text-right" : "text-left"}`}>
                        <div className="inline-block px-5 py-3 bg-white rounded-2xl shadow-lg border border-apple-gray-3/30">
                          <span className="text-2xl font-bold text-hermes-orange">{m.year}</span>
                          <p className="text-apple-gray-1 mt-1">{m.event}</p>
                        </div>
                      </div>
                      <div className="w-4 h-4 bg-hermes-orange rounded-full shadow-lg shadow-hermes-orange/30 flex-shrink-0" />
                      <div className="flex-1" />
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Team */}
        <AnimatedSection direction="fade">
          <div className="mb-20">
            <h2 className="text-3xl font-semibold text-apple-gray-1 tracking-tight mb-10 text-center">
              核心团队
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              {team.map((member, i) => (
                <AnimatedSection key={member.name} delay={i * 100} direction="up">
                  <div className="p-6 bg-white rounded-2xl border border-apple-gray-3/30 hover:border-hermes-orange/30 hover:shadow-xl transition-all duration-300 text-center group">
                    <div className="w-20 h-20 bg-gradient-to-br from-apple-gray-4 to-apple-gray-3 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-2xl font-bold text-apple-gray-2">
                        {member.name[0]}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-apple-gray-1 mb-1">{member.name}</h3>
                    <p className="text-sm text-hermes-orange font-medium mb-2">{member.role}</p>
                    <p className="text-xs text-apple-gray-2">{member.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* CTA */}
        <AnimatedSection direction="fade">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-apple-gray-1 mb-4">
              了解更多
            </h2>
            <p className="text-apple-gray-2 mb-8">
              欢迎探索我们的产品，或直接与 AI 客服交流
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/products"
                className="px-8 py-4 bg-gradient-to-r from-hermes-orange to-hermes-orange-light text-white font-medium rounded-full hover:shadow-xl hover:shadow-hermes-orange/30 hover:-translate-y-1 transition-all"
              >
                浏览产品
              </Link>
              <Link
                href="/chat"
                className="px-8 py-4 border-2 border-hermes-orange text-hermes-orange font-medium rounded-full hover:bg-hermes-orange-pale transition-all"
              >
                与 AI 客服交流
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </main>
    </div>
  );
}