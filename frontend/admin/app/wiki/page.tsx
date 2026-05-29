"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Upload, Search, Trash2, RefreshCw, FileText, Link, CheckCircle2, Clock, AlertCircle, X, Brain, Users, FileSearch, Shield, Bot } from "lucide-react";
import { PageSkeleton } from "@/components/ui";
import { ErrorBoundary } from "@/components/ui";
import { wikiApi, WikiDocument } from "@/lib/api-client";
import { getChatUrl } from "@/lib/config";
import { toast } from "@/components/ui";

const statusConfig = {
  pending: { label: "待处理", icon: Clock, color: "bg-gray-100 text-gray-600" },
  processing: { label: "处理中", icon: RefreshCw, color: "bg-yellow-100 text-yellow-600" },
  done: { label: "已完成", icon: CheckCircle2, color: "bg-green-100 text-green-600" },
  failed: { label: "失败", icon: AlertCircle, color: "bg-red-100 text-red-600" },
};

const sourceTypeConfig = {
  file: { label: "文件", icon: FileText },
  url: { label: "URL", icon: Link },
  doc: { label: "文档", icon: FileText },
};

export default function WikiPage() {
  const [documents, setDocuments] = useState<WikiDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await wikiApi.list({ page_size: 100 });
      setDocuments(response.items);
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadTitle) {
      toast("请选择文件并填写标题", "error");
      return;
    }

    try {
      setUploading(true);
      const result = await wikiApi.uploadAndProcess(selectedFile, uploadTitle);
      toast(`文档 "${uploadTitle}" 处理完成，创建了 ${result.pages_created} 个页面`, "success");
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadTitle("");
      loadDocuments();
    } catch (err: any) {
      toast(err.message || "上传失败", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleReingest = async (docId: string) => {
    try {
      setProcessing(docId);
      const result = await wikiApi.ingest(docId);
      toast(`重新消化完成，创建了 ${result.pages_created} 个页面`, "success");
      loadDocuments();
    } catch (err: any) {
      toast(err.message || "消化失败", "error");
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("确定要删除这个文档吗？")) return;

    try {
      await wikiApi.delete(docId);
      toast("删除成功", "success");
      loadDocuments();
    } catch (err: any) {
      toast(err.message || "删除失败", "error");
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadDocuments();
      return;
    }

    try {
      setLoading(true);
      const response = await wikiApi.search(searchQuery);
      setDocuments(response.results);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents;

  return (
    <ErrorBoundary fallback={<PageSkeleton />}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">知识库</h1>
            <p className="text-sm text-gray-500 mt-1">管理企业文档，AI 自动整理成知识库</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-hermes-orange text-white text-sm font-medium rounded-lg hover:bg-hermes-orange-light transition-colors"
          >
            <Upload className="w-4 h-4" />
            上传文档
          </button>
          <button
            onClick={() => window.open(getChatUrl("knowledge_manager"), "_blank")}
            className="flex items-center gap-2 px-4 py-2 bg-apple-gray-4 text-apple-gray-1 text-sm font-medium rounded-lg hover:bg-apple-gray-3 transition-colors"
          >
            <Bot className="w-4 h-4" />
            知识库管理
          </button>
        </div>

        {/* LLM-Wiki 框架介绍 */}
        <div className="mb-6 bg-gradient-to-r from-hermes-orange/5 to-hermes-orange-light/5 rounded-xl p-5 border border-hermes-orange/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-hermes-orange/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Brain className="w-6 h-6 text-hermes-orange" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900 mb-2">LLM Wiki 知识库框架</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                基于蚁群协作模式的多 Agent 知识库管理系统。文档经过 Scout（侦察）、Worker（执行）、Reviewer（审查）三个阶段的智能处理，自动提取概念、生成摘要、构建关联知识网络。
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FileSearch className="w-4 h-4 text-hermes-orange" />
                  <span>Scout - 分析文档结构</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Users className="w-4 h-4 text-hermes-orange" />
                  <span>Worker - 生成知识页面</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Shield className="w-4 h-4 text-hermes-orange" />
                  <span>Reviewer - 质量审查</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索文档..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-hermes-orange"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
          >
            搜索
          </button>
          <button
            onClick={loadDocuments}
            className="p-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            title="刷新"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Documents Table */}
        {loading ? (
          <PageSkeleton />
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">暂无文档</p>
            <p className="text-sm text-gray-400 mt-1">上传文档开始构建知识库</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">文档</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">来源</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">概念</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">更新时间</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredDocuments.map((doc) => {
                  const status = statusConfig[doc.status as keyof typeof statusConfig] || statusConfig.pending;
                  const sourceType = sourceTypeConfig[doc.source_type as keyof typeof sourceTypeConfig] || sourceTypeConfig.file;
                  const StatusIcon = status.icon;

                  return (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-hermes-orange/10 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-hermes-orange" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{doc.title}</p>
                            {doc.summary && (
                              <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{doc.summary}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <sourceType.icon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{sourceType.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {doc.concepts.slice(0, 3).map((concept, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                              {concept}
                            </span>
                          ))}
                          {doc.concepts.length > 3 && (
                            <span className="px-2 py-0.5 text-gray-400 text-xs">+{doc.concepts.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(doc.updated_at).toLocaleDateString("zh-CN")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {doc.status === "done" && (
                            <button
                              onClick={() => handleReingest(doc.id)}
                              disabled={processing === doc.id}
                              className="p-1.5 text-gray-400 hover:text-hermes-orange transition-colors disabled:opacity-50"
                              title="重新消化"
                            >
                              <RefreshCw className={`w-4 h-4 ${processing === doc.id ? "animate-spin" : ""}`} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-500">文档总数</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{documents.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-500">已完成</p>
            <p className="text-2xl font-semibold text-green-600 mt-1">
              {documents.filter(d => d.status === "done").length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-500">待处理</p>
            <p className="text-2xl font-semibold text-gray-400 mt-1">
              {documents.filter(d => d.status === "pending" || d.status === "processing").length}
            </p>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 m-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">上传文档</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  文档标题
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="输入文档标题"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-hermes-orange"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择文件
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-hermes-orange/50 transition-colors">
                  <input
                    type="file"
                    accept=".txt,.md,.pdf,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <FileText className="w-8 h-8 text-hermes-orange" />
                        <span className="text-sm text-gray-700">{selectedFile.name}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">点击选择文件</p>
                        <p className="text-xs text-gray-400 mt-1">支持 TXT, MD, PDF, DOCX</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <button
                onClick={handleUpload}
                disabled={!selectedFile || !uploadTitle || uploading}
                className="w-full py-3 bg-hermes-orange text-white font-medium rounded-lg hover:bg-hermes-orange-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    处理中...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    上传并处理
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
}