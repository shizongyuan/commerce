# 焕美严选 Design System

企业 AI 管理平台设计系统 - 电商一站式 AI 智能化管理

---

## 一、设计原则

### 1.1 核心价值观

| 原则 | 定义 | 实践 |
|------|------|------|
| **简洁** | Less is More | 减少视觉噪音，聚焦核心内容 |
| **一致** | Consistency | 跨页面、跨组件统一体验 |
| **高效** | Efficiency | 快速完成任务的直觉交互 |
| **无障碍** | Accessibility | 包容性设计，WCAG AA 合规 |

### 1.2 设计哲学

- **双色调体系**：爱马仕橙 + 苹果灰，清晰品牌识别
- **功能性优先**：美学服务于功能
- **移动优先**：从小屏幕到大屏幕的响应式设计

---

## 二、色彩系统

### 2.1 主色 - 爱马仕橙

```css
:root {
  --hermes-orange: #E65C00;
  --hermes-orange-light: #FF7A2F;
  --hermes-orange-pale: #FFF4EE;
  --hermes-orange-dark: #CC4D00;
}
```

| Token | 值 | 用途 |
|-------|-----|------|
| `--hermes-orange` | #E65C00 | 主按钮、强调、链接 |
| `--hermes-orange-light` | #FF7A2F | Hover 状态、渐变 |
| `--hermes-orange-pale` | #FFF4EE | 图标背景、徽章、选中背景 |
| `--hermes-orange-dark` | #CC4D00 | Active 状态 |

### 2.2 辅助色 - 苹果灰

```css
:root {
  --apple-gray-1: #1D1D1F;
  --apple-gray-2: #86868B;
  --apple-gray-3: #E5E5E7;
  --apple-gray-4: #FAFAFA;
}
```

| Token | 值 | 用途 |
|-------|-----|------|
| `--apple-gray-1` | #1D1D1F | 正文、标题 |
| `--apple-gray-2` | #86868B | 次要文字、图标 |
| `--apple-gray-3` | #E5E5E7 | 边框、分割线 |
| `--apple-gray-4` | #FAFAFA | 背景、hover |

### 2.3 语义色彩

```css
:root {
  --color-success: #10B981;
  --color-success-light: #D1FAE5;
  --color-warning: #F59E0B;
  --color-warning-light: #FEF3C7;
  --color-error: #EF4444;
  --color-error-light: #FEE2E2;
  --color-info: #3B82F6;
  --color-info-light: #DBEAFE;
}
```

| 类型 | 主色 | 浅色背景 | 用途 |
|------|------|---------|------|
| 成功 | #10B981 | #D1FAE5 | 成功状态、完成提示 |
| 警告 | #F59E0B | #FEF3C7 | 警示、注意 |
| 错误 | #EF4444 | #FEE2E2 | 错误、失败 |
| 信息 | #3B82F6 | #DBEAFE | 提示、一般信息 |

---

## 三、字体系统

### 3.1 字体栈

```css
:root {
  --font-family-primary: "SF Pro Text", "Noto Sans SC", system-ui, -apple-system, sans-serif;
  --font-family-mono: "SF Mono", "JetBrains Mono", monospace;
}
```

### 3.2 字号层级

```css
:root {
  --font-size-xs: 0.75rem;     /* 12px - 辅助文字 */
  --font-size-sm: 0.875rem;   /* 14px - 正文、按钮 */
  --font-size-base: 1rem;     /* 16px - 较大正文 */
  --font-size-lg: 1.125rem;  /* 18px - 小标题 */
  --font-size-xl: 1.25rem;   /* 20px - 页面标题 */
  --font-size-2xl: 1.5rem;  /* 24px - Section 标题 */
  --font-size-3xl: 1.875rem;/* 30px - 页面主标题 */
  --font-size-4xl: 2.25rem; /* 36px - Hero 标题 */
}
```

### 3.3 字重系统

```css
:root {
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
}
```

| 使用场景 | 字重 | 字号 |
|---------|------|------|
| 正文 | 400 | 14px |
| 按钮 | 500 | 14px |
| 小标题 | 500 | 16px |
| 页面标题 | 600 | 24px |
| Hero 标题 | 600 | 36px |

### 3.4 行高

```css
:root {
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
}
```

| 场景 | 行高 |
|------|------|
| 标题 | 1.25 |
| 正文 | 1.5 |
| 大段文字 | 1.75 |

---

## 四、间距系统

### 4.1 基于 4px 的间距

```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
}
```

### 4.2 使用场景

| Token | 用途 |
|-------|------|
| `--space-1` | 图标内边距、间距 |
| `--space-2` | 紧凑元素间距 |
| `--space-3` | 表单字段间距 |
| `--space-4` | 卡片内边距、元素间距 |
| `--space-6` | Section 内边距 |
| `--space-8` | 页面 Section 间距 |
| `--space-12` | 大区块间距 |

---

## 五、圆角系统

```css
:root {
  --radius-sm: 0.375rem;  /* 6px  - 小按钮、标签 */
  --radius-md: 0.5rem;   /* 8px  - 输入框 */
  --radius-lg: 0.75rem;  /* 12px - 卡片 */
  --radius-xl: 1rem;     /* 16px - Modal */
  --radius-full: 9999px;  /* 圆角  - 药丸按钮 */
}
```

---

## 六、阴影系统

```css
:root {
  --shadow-sm: 0 1px 2px rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-apple: 0 2px 8px rgb(230 92 0 / 0.12);
  --shadow-apple-lg: 0 4px 16px rgb(230 92 0 / 0.18);
}
```

| Token | 用途 |
|-------|------|
| `--shadow-sm` | 轻微阴影 |
| `--shadow-md` | 卡片默认阴影 |
| `--shadow-lg` | 浮层、Modal |
| `--shadow-apple` | 品牌卡片阴影 |
| `--shadow-apple-lg` | 品牌卡片悬停 |

---

## 七、过渡与动画

### 7.1 过渡时间

```css
:root {
  --transition-fast: 0.15s ease;
  --transition-normal: 0.2s ease;
  --transition-slow: 0.3s ease;
}
```

### 7.2 核心动画（仅保留 5 种）

```css
/* 进场动画 */
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-slide-in {
  animation: fadeSlideIn 0.5s var(--ease-out-expo) forwards;
}

/* 悬停抬升 */
.hover-lift {
  transition: transform 0.2s var(--ease-out-quart), box-shadow 0.2s var(--ease-out-quart);
}
.hover-lift:hover {
  transform: translateY(-2px);
}

/* 骨架加载 */
.skeleton-pulse {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

/* 数字滚动 */
@keyframes countUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 减少动画支持 */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 八、组件规范

### 8.1 按钮

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-family: var(--font-family-primary);
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  user-select: none;
}

.btn:focus-visible {
  outline: 2px solid var(--hermes-orange);
  outline-offset: 2px;
}

/* 尺寸 */
.btn-sm { height: 32px; padding: 0 var(--space-3); font-size: var(--font-size-sm); }
.btn-md { height: 40px; padding: 0 var(--space-4); font-size: var(--font-size-sm); }
.btn-lg { height: 48px; padding: 0 var(--space-6); font-size: var(--font-size-base); }

/* 主按钮 */
.btn-primary {
  background: var(--hermes-orange);
  color: white;
  border-radius: var(--radius-full);
}
.btn-primary:hover {
  background: var(--hermes-orange-light);
}
.btn-primary:active {
  transform: scale(0.97);
}

/* 次按钮 */
.btn-secondary {
  background: transparent;
  color: var(--apple-gray-2);
  border: 1px solid var(--apple-gray-3);
  border-radius: var(--radius-full);
}
.btn-secondary:hover {
  background: var(--apple-gray-4);
  color: var(--apple-gray-1);
}
```

### 8.2 输入框

```css
.input {
  height: 40px;
  padding: 0 var(--space-3);
  border: 0.5px solid var(--apple-gray-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
}

.input:focus {
  outline: none;
  border-color: var(--hermes-orange);
  box-shadow: 0 0 0 3px rgb(230 92 0 / 0.1);
}

.input:disabled {
  background: var(--apple-gray-4);
  opacity: 0.6;
  cursor: not-allowed;
}
```

### 8.3 卡片

```css
.card {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  border: 0.5px solid var(--apple-gray-3);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}

.card:hover {
  box-shadow: var(--shadow-apple-lg);
  transform: translateY(-2px);
}

.card-interactive {
  cursor: pointer;
}
.card-interactive:active {
  transform: scale(0.99);
}
```

### 8.4 徽章

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);
  font-size: var(--font-size-xs);
  font-weight: 500;
  border-radius: var(--radius-full);
}

.badge-success {
  background: var(--color-success-light);
  color: var(--color-success);
}

.badge-warning {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.badge-error {
  background: var(--color-error-light);
  color: var(--color-error);
}

.badge-info {
  background: var(--color-info-light);
  color: var(--color-info);
}
```

---

## 九、响应式断点

```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}

/* 移动优先断点策略 */
/* sm: 640px+  - 大手机/小平板 */
/* md: 768px+  - 平板 */
/* lg: 1024px+ - 笔记本 */
/* xl: 1280px+ - 桌面 */
```

| 断点 | 最小宽度 | 容器最大宽度 |
|-----|---------|------------|
| sm | 640px | 640px |
| md | 768px | 768px |
| lg | 1024px | 1024px |
| xl | 1280px | 1280px |

---

## 十、无障碍设计

### 10.1 颜色对比度

- **正文**：至少 4.5:1 (WCAG AA)
- **大文本**（18px+ 或 14px+粗体）：至少 3:1
- **组件边界**：至少 3:1

### 10.2 触摸目标

- **最小尺寸**：44px × 44px
- **推荐尺寸**：48px × 48px

### 10.3 焦点管理

```css
:focus-visible {
  outline: 2px solid var(--hermes-orange);
  outline-offset: 2px;
}

/* 移除鼠标用户的 focus */
:focus:not(:focus-visible) {
  outline: none;
}
```

### 10.4 动画偏好

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 十一、布局规范

### 11.1 页面容器

```css
.container {
  width: 100%;
  padding-left: var(--space-4);
  padding-right: var(--space-4);
}

@media (min-width: 768px) {
  .container {
    padding-left: var(--space-6);
    padding-right: var(--space-6);
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1280px;
    margin-left: auto;
    margin-right: auto;
    padding-left: var(--space-8);
    padding-right: var(--space-8);
  }
}
```

### 11.2 栅格系统

```css
.grid {
  display: grid;
  gap: var(--space-6);
}

.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }

@media (max-width: 767px) {
  .grid-cols-2, .grid-cols-3, .grid-cols-4 {
    grid-template-columns: 1fr;
  }
}
```

---

## 十二、命名规范

### 12.1 CSS 变量命名

采用 **kebab-case** 格式：

```css
/* 颜色 */
--color-{name}-{shade}
/* 例：--color-primary-500, --color-gray-light */

/* 间距 */
--space-{n}
/* 例：--space-4, --space-8 */

/* 圆角 */
--radius-{size}
/* 例：--radius-sm, --radius-lg */

/* 过渡 */
--transition-{duration}
/* 例：--transition-fast, --transition-normal */
```

### 12.2 组件类名

采用 **BEM** 变体格式：

```css
/* 块 */
.block { }
.block--modifier { }
.block__element { }
.block__element--modifier { }

/* 例：.card, .card--hover, .card__header, .card__title--active */
```

---

## 十三、检测清单

### 新页面检查项

- [ ] 色彩使用主色/辅助色/语义色
- [ ] 字号符合层级规范
- [ ] 间距使用 token
- [ ] 圆角符合系统
- [ ] 按钮有 hover/active 状态
- [ ] 输入框有 focus 状态
- [ ] 卡片有悬停效果
- [ ] 移动端响应式
- [ ] 动画支持 reduced-motion
- [ ] 焦点可访问

---

## 版本信息

| 版本 | 日期 | 更新内容 |
|------|------|---------|
| 1.0.0 | 2026-05-16 | 初始版本 |

---

**维护**: UI Designer
**审核**: Design System Checklist