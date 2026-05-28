"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Send, MapPin, Phone, Mail, Clock, CheckCircle2 } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";
import { API_CONFIG } from "@/lib/config";

const contactReasons = [
  { value: "product", label: "产品咨询", icon: "🧴" },
  { value: "order", label: "订单支持", icon: "📦" },
  { value: "refund", label: "退货退款", icon: "💰" },
  { value: "business", label: "商务合作", icon: "🤝" },
  { value: "other", label: "其他", icon: "💬" },
];

const contactInfo = [
  { icon: Phone, label: "客服热线", value: "400-xxx-xxxx", desc: "9:00 - 22:00" },
  { icon: Mail, label: "邮箱地址", value: "contact@example.com", desc: "24小时内回复" },
  { icon: MapPin, label: "公司地址", value: "上海市浦东新区", desc: "xxx路xxx号" },
  { icon: Clock, label: "服务时间", value: "全年无休", desc: "AI客服 24h 在线" },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    reason: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_CONFIG.API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsSubmitted(true);
      }
    } catch (err) {
      console.warn("Failed to submit contact form:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-apple-gray-4 flex items-center justify-center px-6">
        <AnimatedSection direction="fade">
          <div className="text-center max-w-md">
            <AnimatedSection>
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/30">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
            </AnimatedSection>
            <AnimatedSection delay={150}>
              <h1 className="text-3xl font-semibold text-apple-gray-1 mb-4 tracking-tight">
                感谢您的留言！
              </h1>
            </AnimatedSection>
            <AnimatedSection delay={250}>
              <p className="text-apple-gray-2 mb-10 text-lg leading-relaxed">
                我们已收到您的消息，将在
                <span className="text-hermes-orange font-medium"> 24小时内 </span>
                回复您。
              </p>
            </AnimatedSection>
            <AnimatedSection delay={350}>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-hermes-orange to-hermes-orange-light text-white font-medium rounded-full hover:shadow-xl hover:shadow-hermes-orange/30 hover:-translate-y-1 transition-all"
              >
                返回首页
              </Link>
            </AnimatedSection>
          </div>
        </AnimatedSection>
      </div>
    );
  }

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
          <span className="text-apple-gray-1 font-medium">联系我们</span>
        </nav>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Header */}
        <AnimatedSection>
          <div className="text-center mb-12">
            <h1 className="text-4xl font-semibold text-apple-gray-1 tracking-tight mb-4">
              联系我们
            </h1>
            <p className="text-apple-gray-2 text-lg max-w-md mx-auto">
              有任何问题？请填写下方表单，我们会尽快与您联系。
            </p>
          </div>
        </AnimatedSection>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact Form */}
          <AnimatedSection direction="up" className="lg:col-span-3">
            <div className="bg-white rounded-3xl p-8 md:p-10 border border-apple-gray-3/30 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-apple-gray-1 mb-3">
                      姓名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="请输入您的姓名"
                      className="w-full px-5 py-4 border-2 border-apple-gray-3 rounded-2xl text-sm focus:outline-none focus:border-hermes-orange transition-all bg-apple-gray-4/50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-apple-gray-1 mb-3">
                      邮箱 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="you@example.com"
                      className="w-full px-5 py-4 border-2 border-apple-gray-3 rounded-2xl text-sm focus:outline-none focus:border-hermes-orange transition-all bg-apple-gray-4/50 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-apple-gray-1 mb-3">
                      电话
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="选填"
                      className="w-full px-5 py-4 border-2 border-apple-gray-3 rounded-2xl text-sm focus:outline-none focus:border-hermes-orange transition-all bg-apple-gray-4/50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-apple-gray-1 mb-3">
                      咨询类型 <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-4 border-2 border-apple-gray-3 rounded-2xl text-sm focus:outline-none focus:border-hermes-orange transition-all bg-apple-gray-4/50 focus:bg-white appearance-none cursor-pointer"
                    >
                      <option value="">请选择</option>
                      {contactReasons.map((reason) => (
                        <option key={reason.value} value={reason.value}>
                          {reason.icon} {reason.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-apple-gray-1 mb-3">
                    留言 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="请输入您想说的话..."
                    className="w-full px-5 py-4 border-2 border-apple-gray-3 rounded-2xl text-sm focus:outline-none focus:border-hermes-orange transition-all resize-none bg-apple-gray-4/50 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 bg-gradient-to-r from-hermes-orange to-hermes-orange-light text-white font-semibold rounded-full hover:shadow-xl hover:shadow-hermes-orange/30 hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed transition-all text-base flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      提交中...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      提交留言
                    </>
                  )}
                </button>
              </form>
            </div>
          </AnimatedSection>

          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatedSection delay={100} direction="up">
              <h2 className="text-xl font-semibold text-apple-gray-1 mb-6">其他联系方式</h2>
            </AnimatedSection>

            {contactInfo.map((info, i) => (
              <AnimatedSection key={info.label} delay={150 + i * 80} direction="right">
                <div className="flex items-start gap-5 p-6 bg-white rounded-2xl border border-apple-gray-3/30 hover:border-hermes-orange/30 hover:shadow-lg transition-all">
                  <div className="w-14 h-14 bg-gradient-to-br from-hermes-orange to-hermes-orange-light rounded-xl flex items-center justify-center shadow-lg shadow-hermes-orange/20 flex-shrink-0">
                    <info.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-apple-gray-2 mb-1">{info.label}</h3>
                    <p className="text-base font-semibold text-apple-gray-1 mb-1">{info.value}</p>
                    <p className="text-sm text-apple-gray-2">{info.desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}

            {/* WeChat QR Code Placeholder */}
            <AnimatedSection delay={500} direction="fade">
              <div className="p-6 bg-gradient-to-br from-hermes-orange to-hermes-orange-light rounded-2xl text-white">
                <h3 className="font-semibold mb-3">扫码添加客服微信</h3>
                <p className="text-sm text-white/80 mb-4">
                  专属客服为您服务，工作日 9:00-22:00
                </p>
                <div className="w-32 h-32 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-white/60 text-sm">二维码</span>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </main>
    </div>
  );
}