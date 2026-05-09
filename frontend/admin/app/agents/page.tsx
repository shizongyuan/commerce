"use client";

import { useState, useEffect } from "react";
import { Bot, Edit, Eye, Power, Plus, Save, X, Trash2 } from "lucide-react";

interface Agent {
  id: string;
  code: string;
  name: string;
  role: string;
  avatar?: string;
  knowledge_files: string[];
  skills: string[];
  status: string;
  greeting?: string;
}

const SKILL_OPTIONS = [
  "skill_order_query",
  "skill_product_query",
  "skill_complaint",
  "skill_logistics",
  "skill_after_sales",
  "skill_promotion",
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8004";

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Agent | null>(null);
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

  const fetchAgents = () => {
    fetch(`${API_BASE_URL}/api/agents`)
      .then((res) => res.json())
      .then((data) => setAgents(data.items || []))
      .catch(() => setAgents([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleToggleStatus = async (agent: Agent) => {
    const newStatus = agent.status === "active" ? "inactive" : "active";
    const res = await fetch(`${API_BASE_URL}/api/agents/${agent.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...agent, status: newStatus }),
    });
    if (res.ok) {
      setAgents((prev) =>
        prev.map((a) => (a.id === agent.id ? { ...a, status: newStatus } : a))
      );
    }
  };

  const handleSave = async () => {
    if (!editForm) return;
    const res = await fetch(`${API_BASE_URL}/api/agents/${editForm.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      setAgents((prev) =>
        prev.map((a) => (a.id === editForm.id ? editForm : a))
      );
      setIsEditing(false);
      setSelectedAgent(null);
    }
  };

  const handleCreate = async () => {
    if (!newForm.id || !newForm.name) return;
    const res = await fetch(`${API_BASE_URL}/api/agents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newForm),
    });
    if (res.ok) {
      fetchAgents();
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
    }
  };

  const handleDelete = async (agent: Agent) => {
    if (!confirm(`确定删除员工「${agent.name}」吗？`)) return;
    const res = await fetch(`${API_BASE_URL}/api/agents/${agent.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      fetchAgents();
      setSelectedAgent(null);
    }
  };

  const toggleSkill = (skill: string, isEdit: boolean) => {
    if (isEdit && editForm) {
      const skills = editForm.skills.includes(skill)
        ? editForm.skills.filter((s) => s !== skill)
        : [...editForm.skills, skill];
      setEditForm({ ...editForm, skills });
    } else if (!isEdit && newForm) {
      const skills = (newForm.skills || []).includes(skill)
        ? (newForm.skills as string[]).filter((s) => s !== skill)
        : [...(newForm.skills || []), skill];
      setNewForm({ ...newForm, skills });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-apple-gray-1 tracking-tight">AI 员工</h1>
          <p className="text-apple-gray-2 mt-1">配置和管理 AI 员工</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-hermes-orange text-white text-sm font-medium rounded-full hover:bg-hermes-orange-light transition-colors"
        >
          <Plus className="w-4 h-4" />
          新建员工
        </button>
      </div>

      {/* Agents Grid */}
      {isLoading ? (
        <div className="p-8 text-center">
          <div className="w-8 h-8 border-2 border-apple-gray-3 border-t-hermes-orange rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white rounded-2xl p-6 shadow-apple hover:shadow-apple-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {agent.avatar ? (
                    <img src={agent.avatar} alt={agent.name} className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-hermes-orange-pale rounded-xl flex items-center justify-center">
                      <Bot className="w-6 h-6 text-hermes-orange" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-apple-gray-1">{agent.name}</p>
                    <p className="text-xs text-apple-gray-2">{agent.role}</p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    agent.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  }`}
                >
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
                  查看配置
                </button>
                <button
                  onClick={() => {
                    window.open(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8004".replace("8004", "3001")}/chat?agent=${agent.id}`, "_blank");
                  }}
                  className="p-2 text-apple-gray-2 hover:text-hermes-orange transition-colors"
                  title="与该员工对话"
                >
                  <Bot className="w-4 h-4" />
                </button>
                <button onClick={() => handleToggleStatus(agent)} className="p-2 text-apple-gray-2 hover:text-hermes-orange transition-colors">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-apple-gray-3">
              <h2 className="text-xl font-semibold text-apple-gray-1">新建员工</h2>
              <button onClick={() => setIsCreating(false)} className="text-apple-gray-2 hover:text-apple-gray-1">
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
                      value={newForm.id || ""}
                      onChange={(e) => setNewForm({ ...newForm, id: e.target.value })}
                      className="w-full px-3 py-2 border border-apple-gray-3 rounded-lg text-sm focus:outline-none focus:border-hermes-orange"
                      placeholder="如: xiaoxue"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-apple-gray-2 mb-1">员工编号</label>
                    <input
                      type="text"
                      value={newForm.code || ""}
                      onChange={(e) => setNewForm({ ...newForm, code: e.target.value })}
                      className="w-full px-3 py-2 border border-apple-gray-3 rounded-lg text-sm focus:outline-none focus:border-hermes-orange"
                      placeholder="如: AI-XIAOXUE"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-apple-gray-2 mb-1">名称</label>
                    <input
                      type="text"
                      value={newForm.name || ""}
                      onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-apple-gray-3 rounded-lg text-sm focus:outline-none focus:border-hermes-orange"
                      placeholder="如: 小雪"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-apple-gray-2 mb-1">角色</label>
                    <input
                      type="text"
                      value={newForm.role || ""}
                      onChange={(e) => setNewForm({ ...newForm, role: e.target.value })}
                      className="w-full px-3 py-2 border border-apple-gray-3 rounded-lg text-sm focus:outline-none focus:border-hermes-orange"
                      placeholder="如: 智能客服专员"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-apple-gray-2 mb-1">头像 URL</label>
                  <div className="flex items-center gap-3">
                    {newForm.avatar ? (
                      <img src={newForm.avatar} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 bg-apple-gray-4 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Bot className="w-6 h-6 text-apple-gray-2" />
                      </div>
                    )}
                    <input
                      type="text"
                      value={newForm.avatar || ""}
                      onChange={(e) => setNewForm({ ...newForm, avatar: e.target.value })}
                      className="flex-1 px-3 py-2 border border-apple-gray-3 rounded-lg text-sm focus:outline-none focus:border-hermes-orange"
                      placeholder="输入头像图片URL"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-apple-gray-2 mb-1">欢迎语</label>
                  <textarea
                    value={newForm.greeting || ""}
                    onChange={(e) => setNewForm({ ...newForm, greeting: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-apple-gray-3 rounded-lg text-sm focus:outline-none focus:border-hermes-orange"
                    placeholder="AI 首次接待时说的话语"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-apple-gray-2 mb-2">知识库文件</label>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-apple-gray-4 rounded-lg">
                    {(newForm.knowledge_files || []).map((file) => (
                      <span key={file} className="px-2 py-1 text-xs bg-hermes-orange text-white rounded flex items-center gap-1">
                        {file}
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="输入知识库文件路径，如: products/skincare.md"
                    className="w-full mt-2 px-3 py-2 border border-apple-gray-3 rounded-lg text-sm focus:outline-none focus:border-hermes-orange"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.currentTarget.value.trim()) {
                        const file = e.currentTarget.value.trim();
                        if (!(newForm.knowledge_files || []).includes(file)) {
                          setNewForm({ ...newForm, knowledge_files: [...(newForm.knowledge_files || []), file] });
                        }
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                  <p className="text-xs text-apple-gray-2 mt-1">按回车添加文件路径</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-apple-gray-2 mb-2">技能</label>
                  <div className="flex flex-wrap gap-2">
                    {SKILL_OPTIONS.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill, false)}
                        className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                          (newForm.skills || []).includes(skill)
                            ? "bg-hermes-orange text-white border-hermes-orange"
                            : "bg-white text-apple-gray-2 border-apple-gray-3 hover:border-hermes-orange"
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-apple-gray-3">
              <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-sm text-apple-gray-2 hover:text-apple-gray-1">
                取消
              </button>
              <button onClick={handleCreate} className="px-4 py-2 bg-hermes-orange text-white text-sm font-medium rounded-lg hover:bg-hermes-orange-light">
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail/Edit Modal */}
      {selectedAgent && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-apple-gray-3">
              <h2 className="text-xl font-semibold text-apple-gray-1">
                {isEditing ? "编辑" : "查看"} - {selectedAgent.name}
              </h2>
              <button
                onClick={() => {
                  setSelectedAgent(null);
                  setIsEditing(false);
                }}
                className="text-apple-gray-2 hover:text-apple-gray-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[75vh]">
              <div className="space-y-6">
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-apple-gray-2 mb-1">员工ID</label>
                        <input
                          type="text"
                          value={editForm.id}
                          disabled
                          className="w-full px-3 py-2 border border-apple-gray-3 rounded-lg text-sm bg-apple-gray-4"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-apple-gray-2 mb-1">员工编号</label>
                        <input
                          type="text"
                          value={editForm.code}
                          onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                          className="w-full px-3 py-2 border border-apple-gray-3 rounded-lg text-sm focus:outline-none focus:border-hermes-orange"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-apple-gray-2 mb-1">名称</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-3 py-2 border border-apple-gray-3 rounded-lg text-sm focus:outline-none focus:border-hermes-orange"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-apple-gray-2 mb-1">角色</label>
                        <input
                          type="text"
                          value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                          className="w-full px-3 py-2 border border-apple-gray-3 rounded-lg text-sm focus:outline-none focus:border-hermes-orange"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-apple-gray-2 mb-1">头像 URL</label>
                      <div className="flex items-center gap-3">
                        {editForm.avatar ? (
                          <img src={editForm.avatar} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-12 bg-apple-gray-4 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Bot className="w-6 h-6 text-apple-gray-2" />
                          </div>
                        )}
                        <input
                          type="text"
                          value={editForm.avatar || ""}
                          onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                          className="flex-1 px-3 py-2 border border-apple-gray-3 rounded-lg text-sm focus:outline-none focus:border-hermes-orange"
                          placeholder="输入头像图片URL"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-apple-gray-2 mb-1">欢迎语</label>
                      <textarea
                        value={editForm.greeting || ""}
                        onChange={(e) => setEditForm({ ...editForm, greeting: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-apple-gray-3 rounded-lg text-sm focus:outline-none focus:border-hermes-orange"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-apple-gray-2 mb-2">知识库文件</label>
                      <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-apple-gray-4 rounded-lg">
                        {(editForm.knowledge_files || []).map((file) => (
                          <span key={file} className="px-2 py-1 text-xs bg-hermes-orange text-white rounded flex items-center gap-1">
                            {file}
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="输入知识库文件路径，按回车添加"
                        className="w-full mt-2 px-3 py-2 border border-apple-gray-3 rounded-lg text-sm focus:outline-none focus:border-hermes-orange"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.currentTarget.value.trim()) {
                            const file = e.currentTarget.value.trim();
                            if (!(editForm.knowledge_files || []).includes(file)) {
                              setEditForm({ ...editForm, knowledge_files: [...(editForm.knowledge_files || []), file] });
                            }
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-apple-gray-2 mb-2">技能</label>
                      <div className="flex flex-wrap gap-2">
                        {SKILL_OPTIONS.map((skill) => (
                          <button
                            key={skill}
                            onClick={() => toggleSkill(skill, true)}
                            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                              editForm.skills.includes(skill)
                                ? "bg-hermes-orange text-white border-hermes-orange"
                                : "bg-white text-apple-gray-2 border-apple-gray-3 hover:border-hermes-orange"
                            }`}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h3 className="text-xs font-medium text-apple-gray-2 mb-3 uppercase">基础信息</h3>
                      <div className="flex items-center gap-4 mb-4">
                        {editForm.avatar ? (
                          <img src={editForm.avatar} alt={editForm.name} className="w-16 h-16 rounded-xl object-cover" />
                        ) : (
                          <div className="w-16 h-16 bg-hermes-orange-pale rounded-xl flex items-center justify-center">
                            <Bot className="w-8 h-8 text-hermes-orange" />
                          </div>
                        )}
                        <div>
                          <p className="text-apple-gray-1 font-medium text-lg">{editForm.name}</p>
                          <p className="text-apple-gray-2 text-sm">{editForm.role}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-apple-gray-2">员工编号</p>
                          <p className="text-apple-gray-1 font-medium">{editForm.code}</p>
                        </div>
                        <div>
                          <p className="text-apple-gray-2">状态</p>
                          <p className="text-apple-gray-1 font-medium">{editForm.status === "active" ? "在线" : "离线"}</p>
                        </div>
                      </div>
                    </div>
                    {editForm.greeting && (
                      <div>
                        <h3 className="text-xs font-medium text-apple-gray-2 mb-3 uppercase">欢迎语</h3>
                        <div className="bg-apple-gray-4 rounded-xl p-4 text-sm text-apple-gray-1">
                          {editForm.greeting}
                        </div>
                      </div>
                    )}
                    {editForm.knowledge_files && editForm.knowledge_files.length > 0 && (
                      <div>
                        <h3 className="text-xs font-medium text-apple-gray-2 mb-3 uppercase">知识库文件</h3>
                        <div className="flex flex-wrap gap-2">
                          {editForm.knowledge_files.map((file) => (
                            <span key={file} className="px-3 py-1.5 text-sm bg-hermes-orange-pale text-hermes-orange rounded-full">
                              {file}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <h3 className="text-xs font-medium text-apple-gray-2 mb-3 uppercase">技能列表</h3>
                      <div className="flex flex-wrap gap-2">
                        {editForm.skills.map((skill) => (
                          <span key={skill} className="px-3 py-1.5 text-sm bg-hermes-orange-pale text-hermes-orange rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-apple-gray-3">
              {isEditing ? (
                <>
                  <button
                    onClick={() => handleDelete(editForm)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                    删除
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-sm text-apple-gray-2 hover:text-apple-gray-1"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-1.5 px-4 py-2 bg-hermes-orange text-white text-sm font-medium rounded-lg hover:bg-hermes-orange-light"
                    >
                      <Save className="w-4 h-4" />
                      保存
                    </button>
                  </div>
                </>
              ) : (
                <div />
              )}
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-hermes-orange text-white text-sm font-medium rounded-lg hover:bg-hermes-orange-light"
                >
                  <Edit className="w-4 h-4" />
                  编辑
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}