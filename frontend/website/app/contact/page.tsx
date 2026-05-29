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
  { icon: Phone, label: "客服热线", value: "19310089818", desc: "9:00 - 22:00" },
  { icon: Mail, label: "邮箱地址", value: "muru2021@163.com", desc: "24小时内回复" },
  { icon: MapPin, label: "公司地址", value: "长沙自贸区，上海路88号", desc: "长沙自贸区" },
  { icon: Clock, label: "服务时间", value: "全年无休", desc: "工作日 9:00-22:00" },
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
      const res = await fetch(`${API_CONFIG.API_URL}/contact`, {
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
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-apple-gray-1 mb-3">
              感谢您的留言！
            </h1>
            <p className="text-apple-gray-2 mb-8">
              我们已收到您的消息，将在 24小时内 回复您。
            </p>
            <Link
              href="/"
              className="px-6 py-3 bg-hermes-orange text-white text-sm font-medium rounded-full hover:bg-hermes-orange-light transition-colors"
            >
              返回首页
            </Link>
          </div>
        </AnimatedSection>
      </div>
    );
  }

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
          <span className="text-apple-gray-1 font-medium">联系我们</span>
        </nav>
      </div>

      <main className="max-w-4xl mx-auto px-6 pb-16">
        {/* Page Header */}
        <AnimatedSection>
          <div className="text-center mb-10 py-6">
            <h1 className="text-3xl font-semibold text-apple-gray-1 tracking-tight mb-3">
              联系我们
            </h1>
            <p className="text-apple-gray-2 max-w-md mx-auto">
              有任何问题？请填写表单，我们会尽快与您联系
            </p>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <AnimatedSection direction="left">
            <div className="bg-white rounded-2xl p-6 border border-apple-gray-3/30">
              <h2 className="text-base font-semibold text-apple-gray-1 mb-5">填写留言</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-apple-gray-2 mb-2">
                      姓名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="请输入姓名"
                      className="w-full px-4 py-3 border border-apple-gray-3 rounded-lg text-sm focus:outline-none focus:border-hermes-orange transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-apple-gray-2 mb-2">
                      邮箱 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 border border-apple-gray-3 rounded-lg text-sm focus:outline-none focus:border-hermes-orange transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-apple-gray-2 mb-2">电话</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="选填"
                      className="w-full px-4 py-3 border border-apple-gray-3 rounded-lg text-sm focus:outline-none focus:border-hermes-orange transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-apple-gray-2 mb-2">
                      咨询类型 <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-apple-gray-3 rounded-lg text-sm focus:outline-none focus:border-hermes-orange transition-colors cursor-pointer"
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
                  <label className="block text-xs font-medium text-apple-gray-2 mb-2">
                    留言内容 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="请输入您想说的话..."
                    className="w-full px-4 py-3 border border-apple-gray-3 rounded-lg text-sm focus:outline-none focus:border-hermes-orange transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-hermes-orange text-white text-sm font-medium rounded-lg hover:bg-hermes-orange-light transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      提交中...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      提交留言
                    </>
                  )}
                </button>
              </form>
            </div>
          </AnimatedSection>

          {/* Contact Info */}
          <AnimatedSection direction="right" delay={100}>
            <div className="space-y-3">
              {contactInfo.map((info, i) => (
                <AnimatedSection key={info.label} delay={150 + i * 80} direction="up">
                  <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-apple-gray-3/30">
                    <div className="w-10 h-10 bg-hermes-orange/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <info.icon className="w-5 h-5 text-hermes-orange" />
                    </div>
                    <div>
                      <h3 className="text-xs font-medium text-apple-gray-2">{info.label}</h3>
                      <p className="text-sm font-semibold text-apple-gray-1">{info.value}</p>
                      <p className="text-xs text-apple-gray-2">{info.desc}</p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}

              {/* WeChat QR Code */}
              <AnimatedSection delay={500} direction="fade">
                <div className="p-4 bg-gradient-to-r from-hermes-orange to-hermes-orange-light rounded-xl text-white">
                  <h3 className="font-semibold text-sm mb-1">扫码添加客服微信</h3>
                  <p className="text-xs text-white/80 mb-3">专属客服为您服务，工作日 9:00-22:00</p>
                  <div className="w-20 h-20 bg-white rounded-lg overflow-hidden">
                    <img src="/images/qrcode.webp" alt="客服微信二维码" className="w-full h-full object-cover" />
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </AnimatedSection>
        </div>
      </main>
    </div>
  );
}