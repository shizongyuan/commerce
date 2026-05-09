"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, ChevronRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  images: string[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8004";

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products?page_size=100`)
      .then((res) => res.json())
      .then((data) => setProducts(data.items || []))
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除此产品？")) return;
    await fetch(`${API_BASE_URL}/api/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleSave = async (product: Product) => {
    if (editingProduct) {
      await fetch(`${API_BASE_URL}/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
    } else {
      const res = await fetch(`${API_BASE_URL}/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      const newProduct = await res.json();
      setProducts((prev) => [...prev, newProduct]);
    }
    setShowModal(false);
    setEditingProduct(null);
  };

  const filteredProducts = products.filter(
    (p) => !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
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
          className="flex items-center gap-2 px-5 py-2.5 bg-hermes-orange text-white text-sm font-medium rounded-full hover:bg-hermes-orange-light transition-colors"
        >
          <Plus className="w-4 h-4" />
          新增产品
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-apple-gray-2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索产品..."
          className="w-full max-w-md pl-12 pr-4 py-3 border border-apple-gray-3 rounded-full text-sm focus:outline-none focus:border-hermes-orange"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-apple hover:shadow-apple-lg transition-all duration-300 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-apple-gray-3 border-t-hermes-orange rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-apple-gray-2">暂无产品</div>
        ) : (
          <table className="w-full">
            <thead className="bg-apple-gray-4">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-apple-gray-2 uppercase tracking-wider">
                  产品
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-apple-gray-2 uppercase tracking-wider">
                  分类
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-apple-gray-2 uppercase tracking-wider">
                  价格
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-apple-gray-2 uppercase tracking-wider">
                  库存
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-apple-gray-2 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-apple-gray-2 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-apple-gray-3">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-apple-gray-4 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={product.images?.length ? '' : 'w-12 h-12 bg-apple-gray-4 rounded-lg flex-shrink-0 hidden'}>
                        <div className="w-12 h-12 bg-apple-gray-4 rounded-lg flex-shrink-0" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-apple-gray-1">
                          {product.name}
                        </p>
                        <p className="text-xs text-apple-gray-2">
                          ID: {product.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-apple-gray-2">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-hermes-orange">
                    ¥{product.price}
                  </td>
                  <td className="px-6 py-4 text-sm text-apple-gray-2">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        product.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {product.status === "active" ? "上架" : "下架"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 text-apple-gray-2 hover:text-hermes-orange transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-apple-gray-2 hover:text-red-500 transition-colors"
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-apple-gray-1 mb-6">
          {product ? "编辑产品" : "新增产品"}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-apple-gray-2 mb-1.5">
              产品名称
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-apple-gray-3 rounded-xl text-sm focus:outline-none focus:border-hermes-orange"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-apple-gray-2 mb-1.5">
                分类
              </label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2.5 border border-apple-gray-3 rounded-xl text-sm focus:outline-none focus:border-hermes-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-apple-gray-2 mb-1.5">
                价格
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full px-4 py-2.5 border border-apple-gray-3 rounded-xl text-sm focus:outline-none focus:border-hermes-orange"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-apple-gray-2 mb-1.5">
                库存
              </label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                className="w-full px-4 py-2.5 border border-apple-gray-3 rounded-xl text-sm focus:outline-none focus:border-hermes-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-apple-gray-2 mb-1.5">
                状态
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-4 py-2.5 border border-apple-gray-3 rounded-xl text-sm focus:outline-none focus:border-hermes-orange bg-white"
              >
                <option value="active">上架</option>
                <option value="inactive">下架</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-apple-gray-2 mb-1.5">
              产品图片
            </label>
            <div className="space-y-2">
              {form.images && form.images.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img src={img} alt="" className="w-16 h-16 rounded-lg object-cover" />
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
              <input
                type="text"
                placeholder="输入图片URL后按回车添加"
                className="w-full px-4 py-2.5 border border-apple-gray-3 rounded-xl text-sm focus:outline-none focus:border-hermes-orange"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    e.preventDefault();
                    const url = e.currentTarget.value.trim();
                    setForm({ ...form, images: [...(form.images || []), url] });
                    e.currentTarget.value = '';
                  }
                }}
              />
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
            onClick={() => onSave(form)}
            className="flex-1 py-3 bg-hermes-orange text-white rounded-xl text-sm font-medium hover:bg-hermes-orange-light transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
