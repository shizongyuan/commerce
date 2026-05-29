"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Search, Edit, Trash2, Upload, Grid, List, X } from "lucide-react";
import { productsApi, Product, getImageUrl } from "@/lib/api-client";
import { ErrorBoundary, PageSkeleton, toast, LazyImage } from "@/components/ui";

export default function ProductsPage() {
  return (
    <ErrorBoundary>
      <ProductsContent />
    </ErrorBoundary>
  );
}

function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await productsApi.list({ page_size: 100 });
      setProducts(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除此产品？")) return;
    try {
      await productsApi.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast("产品已删除", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "删除失败", "error");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleSave = async (product: Product) => {
    try {
      if (editingProduct) {
        const updated = await productsApi.update(product.id, product);
        setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)));
        toast("产品已更新", "success");
      } else {
        const created = await productsApi.create(product);
        setProducts((prev) => [...prev, created]);
        toast("产品已创建", "success");
      }
      setShowModal(false);
      setEditingProduct(null);
    } catch (err) {
      toast(err instanceof Error ? err.message : "保存失败", "error");
    }
  };

  const filteredProducts = products.filter(
    (p) => !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-apple-gray-1 tracking-tight">产品管理</h1>
          <p className="text-apple-gray-2 mt-1">管理您的产品列表</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-hermes-orange text-white text-sm font-medium rounded-full hover:bg-hermes-orange-light transition-all duration-200 btn-press"
        >
          <Plus className="w-4 h-4" />
          新增产品
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
          <button
            onClick={loadProducts}
            className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-800"
          >
            重试
          </button>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-apple-gray-2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索产品..."
            className="w-full max-w-md pl-12 pr-4 py-3 border border-apple-gray-3 rounded-full text-sm focus:outline-none focus:border-hermes-orange"
          />
        </div>
        <div className="flex items-center gap-2 bg-apple-gray-4 rounded-full p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-full transition-colors ${viewMode === "grid" ? "bg-white text-hermes-orange shadow-sm" : "text-apple-gray-2 hover:text-apple-gray-1"}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`p-2 rounded-full transition-colors ${viewMode === "table" ? "bg-white text-hermes-orange shadow-sm" : "text-apple-gray-2 hover:text-apple-gray-1"}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-apple hover:shadow-apple-lg transition-shadow duration-300 overflow-hidden">
        {isLoading ? (
          <div className="p-8">
            <table className="w-full">
              <thead className="bg-apple-gray-4">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-apple-gray-2 uppercase">产品</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-apple-gray-2 uppercase">分类</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-apple-gray-2 uppercase">价格</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-apple-gray-2 uppercase">库存</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-apple-gray-2 uppercase">状态</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-apple-gray-2 uppercase">操作</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-12 h-12 bg-gray-200 animate-pulse rounded-lg" /><div className="w-32 h-4 bg-gray-200 animate-pulse rounded" /></div></td>
                    <td className="px-6 py-4"><div className="w-20 h-4 bg-gray-200 animate-pulse rounded" /></td>
                    <td className="px-6 py-4"><div className="w-16 h-4 bg-gray-200 animate-pulse rounded" /></td>
                    <td className="px-6 py-4"><div className="w-12 h-4 bg-gray-200 animate-pulse rounded" /></td>
                    <td className="px-6 py-4"><div className="w-16 h-6 bg-gray-200 animate-pulse rounded-full" /></td>
                    <td className="px-6 py-4"><div className="w-20 h-8 bg-gray-200 animate-pulse rounded ml-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-apple-gray-2">
            {search ? "未找到匹配的产品" : "暂无产品"}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-apple-gray-4">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-apple-gray-2 uppercase tracking-wider">产品</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-apple-gray-2 uppercase tracking-wider">分类</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-apple-gray-2 uppercase tracking-wider">价格</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-apple-gray-2 uppercase tracking-wider">库存</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-apple-gray-2 uppercase tracking-wider">状态</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-apple-gray-2 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-apple-gray-3">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-apple-gray-4 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <LazyImage
                        src={product.images?.[0]}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg flex-shrink-0"
                      />
                      <div>
                        <p className="text-sm font-medium text-apple-gray-1">{product.name}</p>
                        <p className="text-xs text-apple-gray-2">ID: {product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-apple-gray-2">{product.category}</td>
                  <td className="px-6 py-4 text-sm font-medium text-hermes-orange">¥{product.price}</td>
                  <td className="px-6 py-4 text-sm text-apple-gray-2">{product.stock}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      product.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    }`}>
                      {product.status === "active" ? "上架" : "下架"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 text-apple-gray-2 hover:text-hermes-orange transition-colors btn-press"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-apple-gray-2 hover:text-red-500 transition-colors btn-press"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Products Grid View */}
      {viewMode === "grid" && !isLoading && filteredProducts.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-apple hover:shadow-apple-lg transition-all duration-300 overflow-hidden group cursor-pointer"
              onClick={() => handleEdit(product)}
            >
              <div className="aspect-square bg-apple-gray-4 relative overflow-hidden">
                <LazyImage
                  src={product.images?.[0]}
                  alt={product.name}
                  className="w-full h-full"
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(product);
                      }}
                      className="p-2 bg-white/90 rounded-full text-apple-gray-2 hover:text-hermes-orange shadow-sm"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(product.id);
                      }}
                      className="p-2 bg-white/90 rounded-full text-apple-gray-2 hover:text-red-500 shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-medium text-sm text-apple-gray-1 truncate">{product.name}</h3>
                <p className="text-xs text-apple-gray-2 mt-0.5">{product.category}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-semibold text-hermes-orange">¥{product.price}</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    product.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  }`}>
                    {product.status === "active" ? "上架" : "下架"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ProductModal
          product={editingProduct}
          onClose={() => {
            setShowModal(false);
            setEditingProduct(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function ProductModal({
  product,
  onClose,
  onSave,
}: {
  product: Product | null;
  onClose: () => void;
  onSave: (product: Product) => void;
}) {
  const [form, setForm] = useState<Product>(
    product || {
      id: "",
      name: "",
      category: "",
      price: 0,
      stock: 0,
      status: "active",
      images: [],
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [isUploading, setIsUploading] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "产品名称不能为空";
    if (form.price <= 0) newErrors.price = "价格必须大于0";
    if (!form.category.trim()) newErrors.category = "分类不能为空";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSave(form);
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    setIsUploading(true);
    try {
      const result = await productsApi.uploadImage(file);
      return result.url;
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      toast("请选择图片文件", "error");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast("图片大小不能超过 5MB", "error");
      return;
    }
    
    try {
      const url = await handleImageUpload(file);
      setForm({ ...form, images: [...(form.images || []), url] });
      toast("图片上传成功", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "上传失败", "error");
    }
    
    e.target.value = "";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-apple-gray-1 mb-6">
          {product ? "编辑产品" : "新增产品"}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-apple-gray-2 mb-1.5">产品名称</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-hermes-orange ${
                errors.name ? "border-red-500" : "border-apple-gray-3"
              }`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-apple-gray-2 mb-1.5">分类</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => {
                  setForm({ ...form, category: e.target.value });
                  if (errors.category) setErrors({ ...errors, category: "" });
                }}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-hermes-orange ${
                  errors.category ? "border-red-500" : "border-apple-gray-3"
                }`}
              />
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-apple-gray-2 mb-1.5">价格</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => {
                  setForm({ ...form, price: Number(e.target.value) });
                  if (errors.price) setErrors({ ...errors, price: "" });
                }}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-hermes-orange ${
                  errors.price ? "border-red-500" : "border-apple-gray-3"
                }`}
              />
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-apple-gray-2 mb-1.5">库存</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                className="w-full px-4 py-2.5 border border-apple-gray-3 rounded-xl text-sm focus:outline-none focus:border-hermes-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-apple-gray-2 mb-1.5">状态</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })}
                className="w-full px-4 py-2.5 border border-apple-gray-3 rounded-xl text-sm focus:outline-none focus:border-hermes-orange bg-white"
              >
                <option value="active">上架</option>
                <option value="inactive">下架</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-apple-gray-2 mb-1.5">产品图片</label>
            <div className="space-y-2">
              {form.images && form.images.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img src={getImageUrl(img)} alt="" className="w-16 h-16 rounded-lg object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, images: form.images?.filter((_, i) => i !== idx) })}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className="flex items-center justify-center gap-2 w-full h-16 border-2 border-dashed border-apple-gray-3 rounded-xl text-sm text-apple-gray-2 cursor-pointer hover:border-hermes-orange hover:text-hermes-orange transition-colors">
                {isUploading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    上传中...
                  </span>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    点击上传图片
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-apple-gray-3 text-apple-gray-1 rounded-xl text-sm font-medium hover:bg-apple-gray-4 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 bg-hermes-orange text-white rounded-xl text-sm font-medium hover:bg-hermes-orange-light transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}