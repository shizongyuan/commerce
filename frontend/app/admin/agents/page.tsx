"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Bot, Edit, Eye, Power, Plus, Save, X, Trash2 } from "lucide-react";
import { agentsApi, Agent, API_URL } from "@/lib/api-client";
import { getChatUrl } from "@/lib/config";
import { ErrorBoundary, toast } from "@/components/ui";
import { getCookie } from "@/lib/cookies";

const SKILL_OPTIONS = [
  "skill_order_query",
  "skill_product_query",
  "skill_complaint",
  "skill_logistics",
  "skill_after_sales",
  "skill_promotion",
];

// XSS protection: validate image URL
function validateImageUrl(url: string): boolean {
  if (!url) return true; // empty is ok
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// Safe image component - 使用 next/image 与官网一致
function SafeImage({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className={`bg-hermes-orange-pale rounded-xl flex items-center justify-center ${className}`}>
        <Bot className="w-6 h-6 text-hermes-orange" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      width={48}
      height={48}
      onError={() => setError(true)}
    />
  );
}

export default function AgentsPage() {
  return (
    <ErrorBoundary>
      <AgentsContent />
    </ErrorBoundary>
  );
}

function AgentsContent() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Agent>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [newForm, setNewForm] = useState<Partial<Agent>>({
    id: "",
    code: "",
    name: "",
    role: "",
    avatar: "",
    knowledge_files: [],
    skills: [],
    status: "active",
    greeting: "",
  });

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await agentsApi.list();
      setAgents(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (agent: Agent) => {
    const newStatus = agent.status === "active" ? "inactive" : "active";
    try {
      const updated = await agentsApi.update(agent.id, { status: newStatus });
      setAgents((prev) => prev.map((a) => (a.id === agent.id ? updated : a)));
      toast(`员工已${newStatus === "active" ? "上线" : "下线"}`, "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "更新失败", "error");
    }
  };

  const handleSave = async () => {
    if (!editForm?.id) return;
    try {
      const updated = await agentsApi.update(editForm.id, editForm);
      setAgents((prev) => prev.map((a) => (a.id === editForm.id ? updated : a)));
      setIsEditing(false);
      setSelectedAgent(null);
      toast("员工信息已保存", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "保存失败", "error");
    }
  };

  const handleCreate = async () => {
    if (!newForm.id || !newForm.name) return;
    try {
      await agentsApi.create(newForm);
      await loadAgents();
      setIsCreating(false);
      setNewForm({
        id: "",
        code: "",
        name: "",
        role: "",
        avatar: "",
        knowledge_files: [],
        skills: [],
        status: "active",
        greeting: "",
      });
      toast("员工创建成功", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "创建失败", "error");
    }
  };

  const handleDelete = async (agent: Partial<Agent>) => {
    if (!agent.id || !agent.name || !confirm(`确定删除员工「${agent.name}」吗？`)) return;
    try {
      await agentsApi.delete(agent.id);
      await loadAgents();
      setSelectedAgent(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "删除失败");
    }
  };

  const toggleSkill = (skill: string, isEdit: boolean) => {
    if (isEdit) {
      const currentSkills = editForm?.skills || [];
      const skills = currentSkills.includes(skill)
        ? currentSkills.filter((s) => s !== skill)
        : [...currentSkills, skill];
      setEditForm({ ...editForm, skills });
    } else {
      const currentSkills = newForm.skills || [];
      const skills = currentSkills.includes(skill)
        ? currentSkills.filter((s) => s !== skill)
        : [...currentSkills, skill];
      setNewForm({ ...newForm, skills });
    }
  };

  return (
    <div className="space-y-6 animate-fade-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-apple-gray-1 tracking-tight">AI 员工</h1>
          <p className="text-apple-gray-2 mt-1">配置和管理 AI 员工</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-hermes-orange text-white text-sm font-medium rounded-full hover:bg-hermes-orange-light transition-all duration-200 btn-press"
        >
          <Plus className="w-4 h-4" />
          新建员工
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
          <button onClick={loadAgents} className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-800">
            重试
          </button>
        </div>
      )}

      {/* Agents Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-apple">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 animate-pulse rounded-xl" />
                  <div>
                    <div className="w-24 h-4 bg-gray-200 animate-pulse rounded mb-2" />
                    <div className="w-16 h-3 bg-gray-200 animate-pulse rounded" />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="w-full h-4 bg-gray-200 animate-pulse rounded" />
                <div className="flex gap-2">
                  <div className="w-16 h-6 bg-gray-200 animate-pulse rounded-full" />
                  <div className="w-16 h-6 bg-gray-200 animate-pulse rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white rounded-2xl p-6 shadow-apple hover:shadow-apple-lg hover-lift"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <SafeImage src={agent.avatar} alt={agent.name} className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <p className="text-sm font-medium text-apple-gray-1">{agent.name}</p>
                    <p className="text-xs text-apple-gray-2">{agent.role}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                  agent.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                }`}>
                  {agent.status === "active" ? "在线" : "离线"}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-xs text-apple-gray-2 mb-1">员工编号</p>
                  <p className="text-sm text-apple-gray-1">{agent.code}</p>
                </div>
                <div>
                  <p className="text-xs text-apple-gray-2 mb-1">技能</p>
                  <div className="flex flex-wrap gap-1">
                    {agent.skills.map((skill) => (
                      <span key={skill} className="px-2 py-0.5 text-xs bg-apple-gray-4 text-apple-gray-2 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-apple-gray-3">
                <button
                  onClick={() => {
                    setSelectedAgent(agent);
                    setEditForm({ ...agent });
                    setIsEditing(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm text-apple-gray-2 hover:text-hermes-orange transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  查看
                </button>
                <button
                  onClick={() => {
                    window.open(getChatUrl(agent.id), "_blank");
                  }}
                  className="p-2 text-apple-gray-2 hover:text-hermes-orange transition-colors"
                  title="与该员工对话"
                >
                  <Bot className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleToggleStatus(agent)}
                  className="p-2 text-apple-gray-2 hover:text-hermes-orange transition-colors"
                >
                  <Power className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setSelectedAgent(agent);
                    setEditForm({ ...agent });
                    setIsEditing(true);
                  }}
                  className="p-2 text-apple-gray-2 hover:text-hermes-orange transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isCreating && (
        <AgentModal
          title="新建员工"
          form={newForm}
          setForm={setNewForm}
          onClose={() => setIsCreating(false)}
          onSubmit={handleCreate}
          onToggleSkill={(skill) => toggleSkill(skill, false)}
          isNew
        />
      )}

      {/* Detail/Edit Modal */}
      {selectedAgent && editForm && (
        <AgentModal
          title={isEditing ? "编辑" : "查看"}
          subtitle={selectedAgent.name}
          form={editForm}
          setForm={setEditForm}
          onClose={() => {
            setSelectedAgent(null);
            setIsEditing(false);
          }}
          onSubmit={isEditing ? handleSave : undefined}
          onToggleSkill={isEditing ? (skill) => toggleSkill(skill, true) : undefined}
          isEditing={isEditing}
          onDelete={isEditing && editForm?.id ? () => handleDelete(editForm) : undefined}
        />
      )}
    </div>
  );
}

interface AgentModalProps {
  title: string;
  subtitle?: string;
  form: Partial<Agent>;
  setForm: (form: Partial<Agent>) => void;
  onClose: () => void;
  onSubmit?: () => void;
  onToggleSkill?: (skill: string) => void;
  isEditing?: boolean;
  isNew?: boolean;
  onDelete?: () => void;
}

function AgentModal({ title, subtitle, form, setForm, onClose, onSubmit, onToggleSkill, isEditing, isNew, onDelete }: AgentModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-apple-gray-3">
          <h2 className="text-xl font-semibold text-apple-gray-1">
            {title}
            {subtitle && <span className="text-apple-gray-2 font-normal ml-2">- {subtitle}</span>}
          </h2>
          <button onClick={onClose} className="text-apple-gray-2 hover:text-apple-gray-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[75vh]">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-apple-gray-2 mb-1">员工ID</label>
                <input
                  type="text"
                  value={form.id || ""}
                  onChange={(e) => setForm({ ...form, id: e.target.value })}
                  disabled={!isNew}
                  className="w-full px-3 py-2 border border-apple-gray-3 rounded-lg text-sm bg-apple-gray-4"
                  placeholder="如: xiaoxue"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-apple-gray-2 mb-1">员工编号</label>
                <input
                  type="text"
                  value={form.code || ""}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  disabled={!isNew}
                  className="w-full px-3 py-2 border border-apple-gray-3 rounded-lg text-sm bg-apple-gray-4"
                  placeholder="如: AI-XIAOXUE"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-apple-gray-2 mb-1">名称</label>
                <input
                  type="text"
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  disabled={!isNew && !isEditing}
                  className={`w-full px-3 py-2 border border-apple-gray-3 rounded-lg text-sm focus:outline-none focus:border-hermes-orange ${!isNew && !isEditing ? "bg-apple-gray-4" : ""}`}
                  placeholder="如: 小雪"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-apple-gray-2 mb-1">角色</label>
                <input
                  type="text"
                  value={form.role || ""}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  disabled={!isNew && !isEditing}
                  className={`w-full px-3 py-2 border border-apple-gray-3 rounded-lg text-sm focus:outline-none focus:border-hermes-orange ${!isNew && !isEditing ? "bg-apple-gray-4" : ""}`}
                  placeholder="如: 智能客服专员"
                />
              </div>
            </div>

            {/* Avatar */}
            <div>
              <label className="block text-xs font-medium text-apple-gray-2 mb-1">头像</label>
              <div className="flex items-center gap-3">
                {form.avatar ? (
                  <SafeImage src={form.avatar} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-apple-gray-3 flex-shrink-0" />
                )}
                {isNew || isEditing ? (
                  <label className="px-3 py-2 border border-apple-gray-3 rounded-lg text-sm cursor-pointer hover:border-hermes-orange transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        // 获取 token
                        const token = getCookie("token");
                        // 上传头像
                        const formData = new FormData();
                        formData.append("file", file);
                        const res = await fetch(`${API_URL}/agents/upload-avatar`, {
                          method: "POST",
                          headers: { "Authorization": `Bearer ${token}` },
                          body: formData,
                        });
                        const data = await res.json();
                        const fullUrl = data.full_url || (data.url ? `${window.location.protocol}//${window.location.hostname}:8004${data.url}` : "");
                        if (fullUrl) {
                          setForm({ ...form, avatar: fullUrl });
                        }
                      }}
                    />
                    {form.avatar ? "更换头像" : "上传头像"}
                  </label>
                ) : null}
                {form.avatar && (isNew || isEditing) && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, avatar: "" })}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    删除
                  </button>
                )}
              </div>
            </div>

            {/* Greeting */}
            <div>
              <label className="block text-xs font-medium text-apple-gray-2 mb-1">欢迎语</label>
              <textarea
                value={form.greeting || ""}
                onChange={(e) => setForm({ ...form, greeting: e.target.value })}
                disabled={!isNew && !isEditing}
                rows={2}
                className={`w-full px-3 py-2 border border-apple-gray-3 rounded-lg text-sm focus:outline-none focus:border-hermes-orange ${!isNew && !isEditing ? "bg-apple-gray-4" : ""}`}
                placeholder="AI 首次接待时说的话语"
              />
            </div>

            {/* Knowledge Files */}
            <div>
              <label className="block text-xs font-medium text-apple-gray-2 mb-2">知识库文件</label>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-apple-gray-4 rounded-lg">
                {(form.knowledge_files || []).map((file) => (
                  <span key={file} className="px-2 py-1 text-xs bg-hermes-orange text-white rounded flex items-center gap-1">
                    {file}
                  </span>
                ))}
              </div>
              {isNew || isEditing ? (
                <input
                  type="text"
                  placeholder="输入知识库文件路径，按回车添加"
                  className="w-full mt-2 px-3 py-2 border border-apple-gray-3 rounded-lg text-sm focus:outline-none focus:border-hermes-orange"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value.trim()) {
                      const file = e.currentTarget.value.trim();
                      if (!(form.knowledge_files || []).includes(file)) {
                        setForm({ ...form, knowledge_files: [...(form.knowledge_files || []), file] });
                      }
                      e.currentTarget.value = "";
                    }
                  }}
                />
              ) : null}
            </div>

            {/* Skills */}
            <div>
              <label className="block text-xs font-medium text-apple-gray-2 mb-2">技能</label>
              <div className="flex flex-wrap gap-2">
                {SKILL_OPTIONS.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => onToggleSkill?.(skill)}
                    disabled={!isNew && !isEditing}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                      (form.skills || []).includes(skill)
                        ? "bg-hermes-orange text-white border-hermes-orange"
                        : "bg-white text-apple-gray-2 border-apple-gray-3 hover:border-hermes-orange"
                    } ${!isNew && !isEditing ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-apple-gray-3">
          <div>
            {isEditing && onDelete && (
              <button
                onClick={onDelete}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
                删除
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-apple-gray-2 hover:text-apple-gray-1">
              {isEditing ? "取消" : "关闭"}
            </button>
            {onSubmit && (
              <button
                onClick={onSubmit}
                className="flex items-center gap-1.5 px-4 py-2 bg-hermes-orange text-white text-sm font-medium rounded-lg hover:bg-hermes-orange-light"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}