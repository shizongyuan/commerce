"use client";

import { useState, useEffect } from "react";
import { Database, RefreshCw, CheckCircle, XCircle, ExternalLink, Plus, Search, Download, Trash2, Loader2, Globe, User, Lock, X, Bot } from "lucide-react";
import { scraperApi, ScraperTask, ScraperResult } from "@/lib/api-client";
import { getChatUrl } from "@/lib/config";

interface DataSource {
  id: string;
  name: string;
  type: string;
  status: "connected" | "disconnected" | "syncing";
  lastSync: string;
  recordCount: number;
}

export default function DataSourcesPage() {
  const [sources, setSources] = useState<DataSource[]>([
    {
      id: "ds-001",
      name: "亚马逊模拟数据",
      type: "amazon_mock",
      status: "connected",
      lastSync: "2026-05-01 10:30:00",
      recordCount: 12580,
    },
    {
      id: "ds-002",
      name: "京东平台模拟数据",
      type: "product_db",
      status: "connected",
      lastSync: "2026-05-01 10:00:00",
      recordCount: 156,
    },
    {
      id: "ds-003",
      name: "淘宝平台模拟数据",
      type: "xiaohongshu",
      status: "disconnected",
      lastSync: "-",
      recordCount: 0,
    },
  ]);

  const [syncingId, setSyncingId] = useState<string | null>(null);

  const [showScrapeModal, setShowScrapeModal] = useState(false);
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [scrapeUsername, setScrapeUsername] = useState("");
  const [scrapePassword, setScrapePassword] = useState("");
  const [scrapeDescription, setScrapeDescription] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState("");

  const [tasks, setTasks] = useState<ScraperTask[]>([]);
  const [results, setResults] = useState<ScraperResult[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [pollingTaskId, setPollingTaskId] = useState<string | null>(null);

  const handleSync = async (id: string) => {
    setSyncingId(id);
    setSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "syncing" } : s))
    );

    await new Promise((resolve) => setTimeout(resolve, 2000));

    setSources((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: "connected", lastSync: new Date().toISOString().replace("T", " ").slice(0, 19) }
          : s
      )
    );
    setSyncingId(null);
  };

  const getStatusIcon = (status: DataSource["status"]) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "disconnected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "syncing":
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
    }
  };

  useEffect(() => {
    loadTasks();
    loadResults();
  }, []);

  useEffect(() => {
    if (!pollingTaskId) return;

    const interval = setInterval(async () => {
      try {
        const task = await scraperApi.getTask(pollingTaskId);
        setTasks((prev) => {
          const existing = prev.findIndex((t) => t.task_id === task.task_id);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = task;
            return updated;
          }
          return [...prev, task];
        });

        if (task.status === "done" || task.status === "failed") {
          setPollingTaskId(null);
          setIsScraping(false);
          if (task.status === "done") {
            setShowScrapeModal(false);
            resetScrapeForm();
            loadResults();
          }
          clearInterval(interval);
        }
      } catch (e) {
        console.error("Poll error:", e);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [pollingTaskId]);

  const loadTasks = async () => {
    setLoadingTasks(true);
    try {
      const data = await scraperApi.listTasks();
      setTasks(data.items);
    } catch (e) {
      console.error("Load tasks error:", e);
    } finally {
      setLoadingTasks(false);
    }
  };

  const loadResults = async () => {
    try {
      const data = await scraperApi.listResults();
      setResults(data.items);
    } catch (e) {
      console.error("Load results error:", e);
    }
  };

  const resetScrapeForm = () => {
    setScrapeUrl("");
    setScrapeUsername("");
    setScrapePassword("");
    setScrapeDescription("");
    setScrapeError("");
  };

  const handleScrape = async () => {
    if (!scrapeUrl) {
      setScrapeError("请输入网址");
      return;
    }

    setIsScraping(true);
    setScrapeError("");

    try {
      const result = await scraperApi.scrape({
        url: scrapeUrl,
        username: scrapeUsername,
        password: scrapePassword,
        description: scrapeDescription,
      });

      setPollingTaskId(result.task_id);
      loadTasks();
    } catch (e: any) {
      setScrapeError(e.message || "创建任务失败");
      setIsScraping(false);
    }
  };

  const handleDeleteTask = async (task_id: string) => {
    try {
      await scraperApi.deleteTask(task_id);
      loadTasks();
    } catch (e) {
      console.error("Delete error:", e);
    }
  };

  const handleDownload = (filename: string) => {
    const url = scraperApi.downloadResult(filename);
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-4xl font-semibold text-apple-gray-1 tracking-tight">数据源管理</h1>
          <p className="text-apple-gray-2 mt-1">配置和管理外部数据源连接</p>
          <p className="text-sm text-apple-gray-2 mt-2 bg-apple-gray-4 inline-block px-3 py-1.5 rounded-lg">
            基于 multi-agent-universal-scraper 多Agent框架，支持自动登录抓取网页数据并导出为JSON/Excel文件
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <button
            onClick={() => setShowScrapeModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-hermes-orange text-white rounded-full hover:bg-hermes-orange-light transition-colors"
          >
            <Plus className="w-4 h-4" />
            抓取数据
          </button>
          <button
            onClick={() => window.open(getChatUrl("data_manager"), "_blank")}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-hermes-orange to-hermes-orange-light text-white rounded-full hover:shadow-apple transition-all"
          >
            <Bot className="w-4 h-4" />
            问问数据管理
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sources.map((source) => (
          <div
            key={source.id}
            className="bg-white rounded-2xl p-6 shadow-apple hover:shadow-apple-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-hermes-orange-pale rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-hermes-orange" />
              </div>
              {getStatusIcon(source.status)}
            </div>

            <h3 className="text-base font-medium text-apple-gray-1 mb-1">
              {source.name}
            </h3>
            <p className="text-xs text-apple-gray-2 mb-4">
              类型：{source.type}
            </p>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-apple-gray-2">记录数</span>
                <span className="text-apple-gray-1 font-medium">
                  {source.recordCount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-apple-gray-2">最后同步</span>
                <span className="text-apple-gray-1">{source.lastSync}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleSync(source.id)}
                disabled={source.status === "syncing"}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm bg-apple-gray-4 text-apple-gray-1 rounded-xl hover:bg-apple-gray-3 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${source.status === "syncing" ? "animate-spin" : ""}`} />
                同步
              </button>
              <button className="p-2 border border-apple-gray-3 rounded-xl hover:border-hermes-orange transition-colors">
                <ExternalLink className="w-4 h-4 text-apple-gray-2" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {tasks.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-apple">
          <h3 className="text-xl font-semibold text-apple-gray-1 mb-4 flex items-center gap-2">
            <Search className="w-5 h-5" />
            采集任务
          </h3>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.task_id} className="flex items-center justify-between p-4 bg-apple-gray-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    task.status === "done" ? "bg-green-500" :
                    task.status === "failed" ? "bg-red-500" :
                    task.status === "running" ? "bg-blue-500 animate-pulse" :
                    "bg-gray-400"
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-apple-gray-1">{task.url}</p>
                    <p className="text-xs text-apple-gray-2">{task.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {task.status === "done" && task.result_file ? (
                    <button
                      onClick={() => {
                        const filename = task.result_file?.split(/[/\\]/).pop();
                        if (filename) handleDownload(filename);
                      }}
                      className="p-2 text-hermes-orange hover:bg-hermes-orange-pale rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  ) : null}
                  <button
                    onClick={() => handleDeleteTask(task.task_id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-apple">
          <h3 className="text-xl font-semibold text-apple-gray-1 mb-4 flex items-center gap-2">
            <Download className="w-5 h-5" />
            采集结果
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {results.map((result) => (
              <div key={result.filename} className="p-4 bg-apple-gray-4 rounded-xl">
                <p className="text-xs text-apple-gray-2 truncate">{result.filename}</p>
                <p className="text-sm text-apple-gray-1 font-medium">{(result.size / 1024).toFixed(1)} KB</p>
                <button
                  onClick={() => handleDownload(result.filename)}
                  className="mt-2 text-xs text-hermes-orange hover:underline"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 数据文件展示区 - 数据洞察基础数据 */}
      <div className="bg-white rounded-2xl p-6 shadow-apple">
        <h3 className="text-xl font-semibold text-apple-gray-1 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" />
          数据文件
          <span className="text-sm font-normal text-apple-gray-2 ml-2">爬取的数据文件，数据洞察的基础数据来源</span>
        </h3>

        {results.length === 0 ? (
          <div className="text-center py-12 text-apple-gray-2">
            <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>暂无数据文件</p>
            <p className="text-sm mt-1">点击上方"抓取数据"开始采集网页数据</p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result) => (
              <div key={result.filename} className="border border-apple-gray-3 rounded-xl p-4 hover:border-hermes-orange transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-hermes-orange-pale rounded-lg flex items-center justify-center">
                      <Database className="w-5 h-5 text-hermes-orange" />
                    </div>
                    <div>
                      <p className="font-medium text-apple-gray-1">{result.filename}</p>
                      <p className="text-xs text-apple-gray-2">{(result.size / 1024).toFixed(1)} KB · {result.created_at}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(result.filename)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-hermes-orange text-white rounded-lg hover:bg-hermes-orange-light transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      下载
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-apple">
        <h3 className="text-xl font-semibold text-apple-gray-1 mb-4">亚马逊模拟数据说明</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xs font-medium text-apple-gray-2 mb-2">数据格式</h4>
            <div className="bg-apple-gray-4 rounded-xl p-4">
              <pre className="text-xs text-apple-gray-1 font-mono whitespace-pre-wrap">{`{
  "asin": "B09N5ZNWWX",
  "title": "Premium Skincare Set",
  "price": 299.00,
  "category": "Skincare",
  "stock": 156,
  "rating": 4.5,
  "reviewCount": 128
}`}</pre>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-medium text-apple-gray-2 mb-2">数据统计</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-3 bg-apple-gray-4 rounded-lg">
                <span className="text-apple-gray-2">商品数据</span>
                <span className="text-apple-gray-1 font-medium">156</span>
              </div>
              <div className="flex justify-between p-3 bg-apple-gray-4 rounded-lg">
                <span className="text-apple-gray-2">订单数据</span>
                <span className="text-apple-gray-1 font-medium">12,000+</span>
              </div>
              <div className="flex justify-between p-3 bg-apple-gray-4 rounded-lg">
                <span className="text-apple-gray-2">评价数据</span>
                <span className="text-apple-gray-1 font-medium">3,200+</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showScrapeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-apple-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-apple-gray-1">网页数据采集</h3>
              <button
                onClick={() => { setShowScrapeModal(false); resetScrapeForm(); }}
                className="p-2 hover:bg-apple-gray-4 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-apple-gray-2 mb-1.5">
                  <Globe className="w-4 h-4 inline mr-1" />
                  目标网址
                </label>
                <input
                  type="url"
                  value={scrapeUrl}
                  onChange={(e) => setScrapeUrl(e.target.value)}
                  placeholder="https://example.com/data"
                  className="w-full px-4 py-2.5 border border-apple-gray-3 rounded-xl focus:outline-none focus:border-hermes-orange transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-apple-gray-2 mb-1.5">
                  <User className="w-4 h-4 inline mr-1" />
                  用户名
                </label>
                <input
                  type="text"
                  value={scrapeUsername}
                  onChange={(e) => setScrapeUsername(e.target.value)}
                  placeholder="登录用户名(可选)"
                  className="w-full px-4 py-2.5 border border-apple-gray-3 rounded-xl focus:outline-none focus:border-hermes-orange transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-apple-gray-2 mb-1.5">
                  <Lock className="w-4 h-4 inline mr-1" />
                  密码
                </label>
                <input
                  type="password"
                  value={scrapePassword}
                  onChange={(e) => setScrapePassword(e.target.value)}
                  placeholder="登录密码(可选)"
                  className="w-full px-4 py-2.5 border border-apple-gray-3 rounded-xl focus:outline-none focus:border-hermes-orange transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-apple-gray-2 mb-1.5">
                  数据描述
                </label>
                <input
                  type="text"
                  value={scrapeDescription}
                  onChange={(e) => setScrapeDescription(e.target.value)}
                  placeholder="如：订单数据、产品列表"
                  className="w-full px-4 py-2.5 border border-apple-gray-3 rounded-xl focus:outline-none focus:border-hermes-orange transition-colors"
                />
              </div>

              {scrapeError && (
                <p className="text-sm text-red-500">{scrapeError}</p>
              )}

              <button
                onClick={handleScrape}
                disabled={isScraping || !scrapeUrl}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-hermes-orange text-white rounded-xl hover:bg-hermes-orange-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isScraping ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    采集中...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    开始采集
                  </>
                )}
              </button>

              <p className="text-xs text-apple-gray-2 text-center">
                基于 multi-agent-universal-scraper 多Agent框架<br/>
                自动分析页面结构并提取数据
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}