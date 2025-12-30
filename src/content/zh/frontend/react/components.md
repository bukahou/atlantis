---
title: React 组件开发
description: React 组件设计模式、组件通信与最佳实践
order: 1
tags:
  - react
  - components
  - frontend
  - patterns
---

# React 组件开发

## 组件基础

React 组件是构建用户界面的基本单元，可以是函数组件或类组件。现代 React 推荐使用函数组件配合 Hooks。

```
组件类型
├── 函数组件 - 简洁、Hooks 支持
├── 类组件 - 传统方式、生命周期
├── 高阶组件 - 逻辑复用
├── 渲染属性 - 灵活渲染
└── 复合组件 - 组件组合模式
```

## 函数组件

### 基础定义

```tsx
// 基本函数组件
function Welcome({ name }: { name: string }) {
  return <h1>Hello, {name}</h1>;
}

// 箭头函数组件
const Greeting: React.FC<{ name: string }> = ({ name }) => {
  return <h1>Hello, {name}</h1>;
};

// 带子组件
interface CardProps {
  title: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children }) => {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="card-body">{children}</div>
    </div>
  );
};
```

### Props 类型

```tsx
// 完整的 Props 类型定义
interface ButtonProps {
  // 必填属性
  label: string;
  onClick: () => void;

  // 可选属性
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  icon?: React.ReactNode;

  // 样式属性
  className?: string;
  style?: React.CSSProperties;
}

const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  icon,
  className,
  style,
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${className ?? ""}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {label}
    </button>
  );
};
```

### 泛型组件

```tsx
// 泛型列表组件
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={keyExtractor(item)}>{renderItem(item, index)}</li>
      ))}
    </ul>
  );
}

// 使用
<List
  items={users}
  keyExtractor={(user) => user.id}
  renderItem={(user) => <span>{user.name}</span>}
/>
```

## 组件模式

### 复合组件

```tsx
// 复合组件模式
interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = React.createContext<TabsContextType | null>(null);

function Tabs({ children, defaultTab }: { children: React.ReactNode; defaultTab: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

function TabList({ children }: { children: React.ReactNode }) {
  return <div className="tab-list">{children}</div>;
}

function Tab({ id, children }: { id: string; children: React.ReactNode }) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("Tab must be used within Tabs");

  return (
    <button
      className={context.activeTab === id ? "active" : ""}
      onClick={() => context.setActiveTab(id)}
    >
      {children}
    </button>
  );
}

function TabPanel({ id, children }: { id: string; children: React.ReactNode }) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabPanel must be used within Tabs");

  return context.activeTab === id ? <div>{children}</div> : null;
}

// 组合导出
Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;

// 使用
<Tabs defaultTab="tab1">
  <Tabs.List>
    <Tabs.Tab id="tab1">Tab 1</Tabs.Tab>
    <Tabs.Tab id="tab2">Tab 2</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel id="tab1">Content 1</Tabs.Panel>
  <Tabs.Panel id="tab2">Content 2</Tabs.Panel>
</Tabs>
```

### 受控与非受控

```tsx
// 受控组件
function ControlledInput() {
  const [value, setValue] = useState("");

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

// 非受控组件
function UncontrolledInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    console.log(inputRef.current?.value);
  };

  return <input ref={inputRef} defaultValue="" />;
}

// 同时支持受控和非受控
interface InputProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

function FlexibleInput({ value, defaultValue, onChange }: InputProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  return <input value={currentValue} onChange={handleChange} />;
}
```

### 渲染属性

```tsx
// 渲染属性模式
interface MouseTrackerProps {
  render: (position: { x: number; y: number }) => React.ReactNode;
}

function MouseTracker({ render }: MouseTrackerProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return <>{render(position)}</>;
}

// 使用
<MouseTracker
  render={({ x, y }) => (
    <div>Mouse position: {x}, {y}</div>
  )}
/>
```

## 高阶组件

```tsx
// 高阶组件 (HOC)
function withLoading<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithLoadingComponent(
    props: P & { isLoading: boolean }
  ) {
    const { isLoading, ...rest } = props;

    if (isLoading) {
      return <div>Loading...</div>;
    }

    return <WrappedComponent {...(rest as P)} />;
  };
}

// 带认证的 HOC
function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithAuthComponent(props: P) {
    const { user, isLoading } = useAuth();

    if (isLoading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;

    return <WrappedComponent {...props} />;
  };
}

// 使用
const ProtectedDashboard = withAuth(Dashboard);
```

## 组件通信

### Props 传递

```tsx
// 父传子
function Parent() {
  const [count, setCount] = useState(0);

  return (
    <Child
      count={count}
      onIncrement={() => setCount(c => c + 1)}
    />
  );
}

function Child({ count, onIncrement }: {
  count: number;
  onIncrement: () => void;
}) {
  return (
    <div>
      <span>{count}</span>
      <button onClick={onIncrement}>+</button>
    </div>
  );
}
```

### Context 共享

```tsx
// 创建 Context
interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toggleTheme = useCallback(() => {
    setTheme(t => t === "light" ? "dark" : "light");
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 自定义 Hook
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

// 使用
function ThemedButton() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme}>
      Current: {theme}
    </button>
  );
}
```

## 性能优化

### React.memo

```tsx
// 避免不必要的重渲染
const ExpensiveComponent = React.memo(function ExpensiveComponent({
  data,
  onUpdate,
}: {
  data: Data;
  onUpdate: () => void;
}) {
  // 复杂渲染逻辑
  return <div>{/* ... */}</div>;
});

// 自定义比较函数
const OptimizedList = React.memo(
  function OptimizedList({ items }: { items: Item[] }) {
    return (
      <ul>
        {items.map(item => <li key={item.id}>{item.name}</li>)}
      </ul>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.items.length === nextProps.items.length;
  }
);
```

### useMemo 和 useCallback

```tsx
function SearchResults({ query, items }: { query: string; items: Item[] }) {
  // 缓存计算结果
  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [items, query]);

  // 缓存回调函数
  const handleItemClick = useCallback((id: string) => {
    console.log("Clicked:", id);
  }, []);

  return (
    <ul>
      {filteredItems.map(item => (
        <li key={item.id} onClick={() => handleItemClick(item.id)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
}
```

## 总结

React 组件开发要点：

1. **函数组件** - 现代 React 的首选方式
2. **类型安全** - TypeScript 增强可维护性
3. **组件模式** - 复合组件、HOC、渲染属性
4. **状态管理** - 受控/非受控、Context
5. **性能优化** - memo、useMemo、useCallback
