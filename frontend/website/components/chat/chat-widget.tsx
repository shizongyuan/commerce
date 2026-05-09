"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { X, Minimize2, Send, Paperclip, Image as ImageIcon } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatWidgetProps {
  defaultOpen?: boolean;
}

export function ChatWidget({ defaultOpen = false }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "您好！我是 AI-小雪，您的专属客服。有什么可以帮您？" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8004";

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_id: "agent-001",
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "抱歉，服务暂时不可用，请稍后再试。" },
      ]);
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

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-hermes-orange text-white rounded-full shadow-lg hover:bg-hermes-orange-light transition-colors flex items-center justify-center z-50 overflow-hidden"
      >
        <Image src="/images/agents/ai_xiaoxue.png" alt="AI小雪" width={56} height={56} className="w-full h-full object-cover" />
      </button>
    );
  }

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 bg-hermes-orange text-white rounded-full shadow-lg hover:bg-hermes-orange-light transition-colors z-50 flex items-center gap-2 px-3 py-2"
      >
        <div className="w-7 h-7 rounded-full overflow-hidden">
          <Image src="/images/agents/ai_xiaoxue.png" alt="AI小雪" width={28} height={28} className="w-full h-full object-cover" />
        </div>
        <span className="text-sm font-medium">AI-小雪</span>
        <Minimize2 className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 md:w-96 bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-hermes-orange text-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden shadow-md">
            <Image src="/images/agents/ai_xiaoxue.png" alt="AI小雪" width={36} height={36} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="text-sm font-medium">AI-小雪</div>
            <div className="text-xs text-white/70">Online</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-80">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                msg.role === "user"
                  ? "bg-hermes-orange text-white rounded-br-md"
                  : "bg-apple-gray-4 text-apple-gray-1 rounded-bl-md"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-apple-gray-4 text-apple-gray-2 px-4 py-2.5 rounded-2xl rounded-bl-md text-sm">
              typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-2 flex gap-2 flex-wrap">
        {["查订单", "咨询产品", "优惠活动"].map((action) => (
          <button
            key={action}
            onClick={() => setInput(action)}
            className="px-3 py-1.5 text-xs bg-apple-gray-4 text-apple-gray-1 rounded-full hover:bg-apple-gray-3 transition-colors"
          >
            {action}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-apple-gray-3">
        <div className="flex items-center gap-2">
          <button className="p-2 text-apple-gray-2 hover:text-hermes-orange transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>
          <button className="p-2 text-apple-gray-2 hover:text-hermes-orange transition-colors">
            <ImageIcon className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-apple-gray-4 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-hermes-orange"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 bg-hermes-orange text-white rounded-full hover:bg-hermes-orange-light disabled:opacity-50 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
