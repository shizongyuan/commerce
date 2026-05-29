"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { MessageCircle, Send, ChevronLeft, Bot, User } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";
import { API_CONFIG } from "@/lib/config";

interface Agent {
  id: string;
  name: string;
  avatar: string;
  greeting: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const DEFAULT_AGENTS = [
  { id: "xiaoxue", name: "小雪", avatar: "/images/agents/ai_xiaoxue.webp", greeting: "您好！我是小雪，您的专属客服。" },
  { id: "xiaobing", name: "小冰", avatar: "/images/agents/ai_xiaobing.webp", greeting: "您好！我是小冰，负责物流和售后。" },
  { id: "xiaoyu", name: "小雨", avatar: "/images/agents/ai_xiaoyu.webp", greeting: "您好！我是小雨，负责投诉建议和优惠活动。" },
];

const quickActions = [
  { label: "查订单", action: "帮我查一下我的订单" },
  { label: "产品推荐", action: "推荐一款适合干性皮肤的面霜" },
  { label: "优惠活动", action: "现在有什么优惠活动吗" },
  { label: "投诉建议", action: "我想反馈一个问题" },
];

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-apple-gray-3 border-t-hermes-orange rounded-full animate-spin" /></div>}>
      <ChatContent />
    </Suspense>
  );
}

function ChatContent() {
  const searchParams = useSearchParams();
  const agentId = searchParams.get("agent") || "xiaoxue";

  const [agents, setAgents] = useState<Agent[]>(DEFAULT_AGENTS);
  const [currentAgent, setCurrentAgent] = useState<Agent>(DEFAULT_AGENTS[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<Message[]>([]);

  // Keep messagesRef in sync with messages state
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Fetch agents from API
  useEffect(() => {
    fetch(`${API_CONFIG.API_URL}/agents`)
      .then((res) => res.json())
      .then((data) => {
        if (data.items && data.items.length > 0) {
          const apiAgents = data.items.map((a: any) => ({
            id: a.id,
            name: a.name,
            avatar: a.avatar || `/images/agents/ai_${a.id}.webp`,
            greeting: a.greeting || `您好！我是${a.name}。`,
          }));
          setAgents(apiAgents);
        }
      })
      .catch((err) => console.warn("Failed to fetch agents:", err));
  }, []);

  // Update current agent when agentId changes
  useEffect(() => {
    const agent = agents.find((a) => a.id === agentId) || agents[0];
    setCurrentAgent(agent);
    setMessages([{ role: "assistant", content: agent.greeting }]);
  }, [agentId, agents]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    // Use messagesRef to avoid stale closure
    const currentMessages = [...messagesRef.current, userMessage];

    try {
      const response = await fetch(`${API_CONFIG.API_URL}/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_id: currentAgent.id,
          messages: currentMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      // 流式处理 SSE (throttled to reduce re-renders)
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullReply = "";
      let lastFlush = Date.now();
      const FLUSH_INTERVAL = 100; // ms

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === "chunk" && data.content) {
                  fullReply += data.content;
                  const now = Date.now();
                  if (now - lastFlush >= FLUSH_INTERVAL || data.content.endsWith("\n")) {
                    setMessages((prev) => {
                      const updated = [...prev];
                      if (updated.length > 0 && updated[updated.length - 1].role === "assistant") {
                        updated[updated.length - 1] = { role: "assistant", content: fullReply };
                      }
                      return updated;
                    });
                    lastFlush = now;
                  }
                } else if (data.type === "done") {
                  break;
                } else if (data.type === "error") {
                  throw new Error(data.content);
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      }
    } catch (error) {
      setMessages((prev) => {
        const updated = [...prev];
        if (updated.length > 0 && updated[updated.length - 1].role === "assistant") {
          updated[updated.length - 1] = {
            role: "assistant",
            content: "抱歉，服务暂时不可用，请稍后再试。您也可以通过电话联系我们：400-xxx-xxxx",
          };
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-apple-gray-4 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-2xl border-b border-apple-gray-3/50 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-4 h-16">
            <Link
              href="/"
              className="flex items-center gap-2 text-apple-gray-2 hover:text-apple-gray-1 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">返回</span>
            </Link>
            <select
              value={agentId}
              onChange={(e) => {
                window.location.href = `/chat?agent=${e.target.value}`;
              }}
              className="flex-1 max-w-[200px] px-3 py-2 bg-apple-gray-4 rounded-lg text-sm border-none focus:outline-none focus:ring-2 focus:ring-hermes-orange/50 cursor-pointer"
            >
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-3 ml-auto">
              <div className="w-10 h-10 rounded-full overflow-hidden shadow-lg shadow-hermes-orange/20">
                <Image src={currentAgent.avatar} alt={`AI-${currentAgent.name}`} width={40} height={40} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-sm font-medium text-apple-gray-1">
                  {currentAgent.name} · AI 智能客服
                </div>
                <div className="text-xs text-green-500 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  7×24 小时专属服务
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 max-w-3xl mx-auto w-full p-4 overflow-y-auto">
        <div className="space-y-6 pb-4">
          {messages.map((msg, idx) => (
            <AnimatedSection key={idx} delay={idx * 50} direction="fade">
              <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0 shadow-lg">
                    <Image src={currentAgent.avatar} alt={`AI-${currentAgent.name}`} width={40} height={40} className="w-full h-full object-cover" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-6 py-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-hermes-orange to-hermes-orange-light text-white rounded-br-md shadow-lg shadow-hermes-orange/20"
                      : "bg-white text-apple-gray-1 rounded-bl-md shadow-lg"
                  }`}
                >
                  {msg.content.split("\n").map((line, i) => (
                    <p key={i} className={i > 0 ? "mt-2" : ""}>
                      {line}
                    </p>
                  ))}
                </div>
                {msg.role === "user" && (
                  <div className="w-10 h-10 bg-apple-gray-4 rounded-full flex items-center justify-center ml-3 flex-shrink-0">
                    <User className="w-5 h-5 text-apple-gray-2" />
                  </div>
                )}
              </div>
            </AnimatedSection>
          ))}
          {isLoading && (
            <AnimatedSection direction="fade">
              <div className="flex justify-start">
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3 shadow-lg">
                  <Image src={currentAgent.avatar} alt={`AI-${currentAgent.name}`} width={40} height={40} className="w-full h-full object-cover" />
                </div>
                <div className="bg-white px-6 py-4 rounded-2xl rounded-bl-md shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-hermes-orange rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-hermes-orange/60 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 bg-hermes-orange/30 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              </div>
            </AnimatedSection>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length === 1 && (
          <AnimatedSection delay={300} direction="up">
            <div className="mb-6">
              <p className="text-xs text-apple-gray-2 mb-3 font-medium">快捷操作：</p>
              <div className="flex flex-wrap gap-3">
                {quickActions.map((qa) => (
                  <button
                    key={qa.label}
                    onClick={() => setInput(qa.action)}
                    className="px-5 py-3 bg-white text-sm text-apple-gray-1 rounded-full shadow-md hover:shadow-lg hover:border-hermes-orange border border-transparent hover:-translate-y-0.5 transition-all"
                  >
                    {qa.label}
                  </button>
                ))}
              </div>
            </div>
          </AnimatedSection>
        )}
      </main>

      
      {/* Input */}
      <div className="bg-white/80 backdrop-blur-xl border-t border-apple-gray-3/50 sticky bottom-0">
        <div className="max-w-3xl mx-auto px-4 py-5">
          <div className="flex items-end gap-4">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入消息..."
                rows={1}
                className="w-full px-5 py-4 bg-apple-gray-4 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-hermes-orange/50 transition-all border-2 border-transparent focus:border-hermes-orange"
                style={{ minHeight: "52px", maxHeight: "120px" }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-4 bg-gradient-to-r from-hermes-orange to-hermes-orange-light text-white rounded-2xl hover:shadow-lg hover:shadow-hermes-orange/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-apple-gray-2 mt-3 text-center">
            AI 客服「{currentAgent.name}」7×24 小时在线 · 遇到问题请及时联系人工客服
          </p>
        </div>
      </div>
    </div>
  );
}