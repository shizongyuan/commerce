"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";

const milestones = [
  { year: "2015", event: "公司成立" },
  { year: "2018", event: "开设线下体验店" },
  { year: "2020", event: "启动数字化转型" },
  { year: "2024", event: "引入 AI 服务" },
  { year: "2026", event: "AI 管理平台上线" },
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
        <div className="max-w-4xl mx-auto px-6">
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
      <div className="max-w-4xl mx-auto px-6 py-3">
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/" className="text-apple-gray-2 hover:text-hermes-orange transition-colors">首页</Link>
          <span className="text-apple-gray-3">/</span>
          <span className="text-apple-gray-1 font-medium">关于我们</span>
        </nav>
      </div>

      <main className="max-w-4xl mx-auto px-6 pb-16">
        {/* Hero */}
        <AnimatedSection>
          <div className="text-center mb-12 py-8">
            <h1 className="text-3xl font-semibold text-apple-gray-1 tracking-tight mb-4">
              关于焕美严选
            </h1>
            <p className="text-base text-apple-gray-2 max-w-xl mx-auto leading-relaxed">
              致力于成为最懂消费者的电商平台，用科技定义品质生活，用 AI 提升服务体验。
            </p>
          </div>
        </AnimatedSection>

        {/* Timeline */}
        <AnimatedSection direction="fade">
          <div className="mb-12">
            <h2 className="text-lg font-semibold text-apple-gray-1 tracking-tight mb-6 text-center">
              发展历程
            </h2>
            <div className="bg-white rounded-2xl p-6 border border-apple-gray-3/30">
              <div className="flex items-center justify-between">
                {milestones.map((m, i) => (
                  <AnimatedSection key={m.year} delay={i * 60} direction="up">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-hermes-orange rounded-full mx-auto mb-2 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                      <span className="text-sm font-bold text-hermes-orange">{m.year}</span>
                      <p className="text-xs text-apple-gray-2 mt-1">{m.event}</p>
                    </div>
                    {i < milestones.length - 1 && (
                      <div className="flex-1 h-0.5 bg-apple-gray-3 mx-2 mb-6" />
                    )}
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Team */}
        <AnimatedSection direction="fade">
          <div>
            <h2 className="text-lg font-semibold text-apple-gray-1 tracking-tight mb-6 text-center">
              核心团队
            </h2>
            <div className="grid grid-cols-4 gap-4">
              {team.map((member, i) => (
                <AnimatedSection key={member.name} delay={i * 80} direction="up">
                  <div className="bg-white rounded-xl p-4 border border-apple-gray-3/30 text-center">
                    <div className="w-12 h-12 bg-apple-gray-4 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <span className="text-lg font-bold text-apple-gray-2">
                        {member.name[0]}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-apple-gray-1 mb-0.5">{member.name}</h3>
                    <p className="text-xs text-hermes-orange font-medium mb-1">{member.role}</p>
                    <p className="text-xs text-apple-gray-2">{member.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* CTA */}
        <AnimatedSection direction="fade">
          <div className="text-center pt-10">
            <p className="text-sm text-apple-gray-2 mb-4">
              欢迎探索我们的产品，或直接与 AI 客服交流
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/products"
                className="px-6 py-2.5 bg-hermes-orange text-white text-sm font-medium rounded-full hover:bg-hermes-orange-light transition-colors"
              >
                浏览产品
              </Link>
              <Link
                href="/chat"
                className="px-6 py-2.5 border border-hermes-orange text-hermes-orange text-sm font-medium rounded-full hover:bg-hermes-orange-pale transition-colors"
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