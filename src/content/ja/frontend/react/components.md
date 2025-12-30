---
title: React コンポーネント開発
description: React コンポーネント設計パターン、コンポーネント間通信とベストプラクティス
order: 1
tags:
  - react
  - components
  - frontend
  - patterns
---

# React コンポーネント開発

## コンポーネント基礎

React コンポーネントはユーザーインターフェースを構築する基本単位で、関数コンポーネントまたはクラスコンポーネントです。モダン React では Hooks を使用した関数コンポーネントが推奨されます。

```
コンポーネントタイプ
├── 関数コンポーネント - シンプル、Hooks サポート
├── クラスコンポーネント - 従来の方法、ライフサイクル
├── 高階コンポーネント - ロジックの再利用
├── Render Props - 柔軟なレンダリング
└── 複合コンポーネント - コンポーネント合成パターン
```

## 関数コンポーネント

### 基本定義

```tsx
// 基本関数コンポーネント
function Welcome({ name }: { name: string }) {
  return <h1>Hello, {name}</h1>;
}

// アロー関数コンポーネント
const Greeting: React.FC<{ name: string }> = ({ name }) => {
  return <h1>Hello, {name}</h1>;
};

// 子コンポーネント付き
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

### Props 型

```tsx
// 完全な Props 型定義
interface ButtonProps {
  // 必須プロパティ
  label: string;
  onClick: () => void;

  // オプショナルプロパティ
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  icon?: React.ReactNode;

  // スタイルプロパティ
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

### ジェネリックコンポーネント

```tsx
// ジェネリックリストコンポーネント
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

// 使用例
<List
  items={users}
  keyExtractor={(user) => user.id}
  renderItem={(user) => <span>{user.name}</span>}
/>
```

## コンポーネントパターン

### 複合コンポーネント

```tsx
// 複合コンポーネントパターン
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

// 組み合わせエクスポート
Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;

// 使用例
<Tabs defaultTab="tab1">
  <Tabs.List>
    <Tabs.Tab id="tab1">Tab 1</Tabs.Tab>
    <Tabs.Tab id="tab2">Tab 2</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel id="tab1">Content 1</Tabs.Panel>
  <Tabs.Panel id="tab2">Content 2</Tabs.Panel>
</Tabs>
```

### 制御・非制御コンポーネント

```tsx
// 制御コンポーネント
function ControlledInput() {
  const [value, setValue] = useState("");

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

// 非制御コンポーネント
function UncontrolledInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    console.log(inputRef.current?.value);
  };

  return <input ref={inputRef} defaultValue="" />;
}

// 制御・非制御両対応
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

### Render Props

```tsx
// Render Props パターン
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

// 使用例
<MouseTracker
  render={({ x, y }) => (
    <div>Mouse position: {x}, {y}</div>
  )}
/>
```

## 高階コンポーネント

```tsx
// 高階コンポーネント (HOC)
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

// 認証付き HOC
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

// 使用例
const ProtectedDashboard = withAuth(Dashboard);
```

## コンポーネント間通信

### Props 伝達

```tsx
// 親から子へ
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

### Context 共有

```tsx
// Context 作成
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

// カスタム Hook
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

// 使用例
function ThemedButton() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme}>
      Current: {theme}
    </button>
  );
}
```

## パフォーマンス最適化

### React.memo

```tsx
// 不要な再レンダリングを防ぐ
const ExpensiveComponent = React.memo(function ExpensiveComponent({
  data,
  onUpdate,
}: {
  data: Data;
  onUpdate: () => void;
}) {
  // 複雑なレンダリングロジック
  return <div>{/* ... */}</div>;
});

// カスタム比較関数
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

### useMemo と useCallback

```tsx
function SearchResults({ query, items }: { query: string; items: Item[] }) {
  // 計算結果をキャッシュ
  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [items, query]);

  // コールバック関数をキャッシュ
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

## まとめ

React コンポーネント開発のポイント：

1. **関数コンポーネント** - モダン React の推奨方法
2. **型安全** - TypeScript で保守性向上
3. **コンポーネントパターン** - 複合、HOC、Render Props
4. **状態管理** - 制御/非制御、Context
5. **パフォーマンス最適化** - memo、useMemo、useCallback
