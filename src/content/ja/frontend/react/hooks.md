---
title: React Hooks
description: React Hooks 完全ガイド、カスタム Hooks とベストプラクティス
order: 2
tags:
  - react
  - hooks
  - frontend
  - state
---

# React Hooks

## Hooks 概要

Hooks は React 16.8 で導入された機能で、関数コンポーネントに状態やライフサイクルなどの機能を提供し、コンポーネント階層を変更せずにロジックを再利用できます。

```
よく使う Hooks
├── useState - 状態管理
├── useEffect - 副作用処理
├── useContext - コンテキスト消費
├── useReducer - 複雑な状態
├── useRef - 参照と DOM
├── useMemo - 計算キャッシュ
├── useCallback - 関数キャッシュ
└── カスタム Hooks - ロジック再利用
```

## 基本 Hooks

### useState

```tsx
// 基本的な使い方
const [count, setCount] = useState(0);
setCount(1);
setCount(prev => prev + 1);

// オブジェクト状態
const [user, setUser] = useState({ name: "", age: 0 });
setUser(prev => ({ ...prev, name: "Alice" }));

// 遅延初期化
const [data, setData] = useState(() => {
  return expensiveComputation();
});

// 型付き状態
interface User {
  id: string;
  name: string;
  email: string;
}

const [user, setUser] = useState<User | null>(null);
```

### useEffect

```tsx
// 基本的な副作用
useEffect(() => {
  document.title = `Count: ${count}`;
});

// 依存配列
useEffect(() => {
  fetchData(id);
}, [id]);  // id が変更されたときのみ実行

// クリーンアップ関数
useEffect(() => {
  const subscription = api.subscribe(id);
  return () => {
    subscription.unsubscribe();
  };
}, [id]);

// マウント時のみ実行
useEffect(() => {
  console.log("Component mounted");
  return () => console.log("Component unmounted");
}, []);

// 非同期エフェクト
useEffect(() => {
  const fetchData = async () => {
    const result = await api.getData();
    setData(result);
  };
  fetchData();
}, []);

// AbortController でリクエストキャンセル
useEffect(() => {
  const controller = new AbortController();

  fetch("/api/data", { signal: controller.signal })
    .then(res => res.json())
    .then(setData)
    .catch(err => {
      if (err.name !== "AbortError") {
        setError(err);
      }
    });

  return () => controller.abort();
}, []);
```

### useContext

```tsx
// Context 作成
const UserContext = createContext<User | null>(null);

// Provider
function App() {
  const [user, setUser] = useState<User | null>(null);

  return (
    <UserContext.Provider value={user}>
      <Dashboard />
    </UserContext.Provider>
  );
}

// Context 消費
function Dashboard() {
  const user = useContext(UserContext);

  if (!user) {
    return <LoginPrompt />;
  }

  return <div>Welcome, {user.name}</div>;
}
```

### useReducer

```tsx
// reducer 定義
interface State {
  count: number;
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: "INCREMENT" }
  | { type: "DECREMENT" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "INCREMENT":
      return { ...state, count: state.count + 1 };
    case "DECREMENT":
      return { ...state, count: state.count - 1 };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

// reducer 使用
function Counter() {
  const [state, dispatch] = useReducer(reducer, {
    count: 0,
    loading: false,
    error: null,
  });

  return (
    <div>
      <span>{state.count}</span>
      <button onClick={() => dispatch({ type: "INCREMENT" })}>+</button>
      <button onClick={() => dispatch({ type: "DECREMENT" })}>-</button>
    </div>
  );
}
```

### useRef

```tsx
// DOM 参照
function TextInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <>
      <input ref={inputRef} />
      <button onClick={focusInput}>Focus</button>
    </>
  );
}

// ミュータブル値の保存
function Timer() {
  const intervalRef = useRef<number | null>(null);
  const [count, setCount] = useState(0);

  const start = () => {
    intervalRef.current = window.setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
  };

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  return (
    <div>
      <span>{count}</span>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}

// 前の値を保存
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
```

## パフォーマンス Hooks

### useMemo

```tsx
// 計算結果をキャッシュ
function FilteredList({ items, query }: Props) {
  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [items, query]);

  return (
    <ul>
      {filteredItems.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}

// 複雑なオブジェクトをキャッシュ
const chartData = useMemo(() => ({
  labels: data.map(d => d.date),
  values: data.map(d => d.value),
}), [data]);
```

### useCallback

```tsx
// コールバック関数をキャッシュ
function Parent() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    console.log("Clicked");
  }, []);

  const handleIncrement = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  return (
    <Child onClick={handleClick} onIncrement={handleIncrement} />
  );
}

// 外部変数への依存
const handleSubmit = useCallback((data: FormData) => {
  api.submit(userId, data);
}, [userId]);
```

## カスタム Hooks

### データ取得

```tsx
interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

function useFetch<T>(url: string): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Fetch failed");
      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// 使用例
const { data, loading, error, refetch } = useFetch<User[]>("/api/users");
```

### ローカルストレージ

```tsx
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function
        ? value(storedValue)
        : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}

// 使用例
const [theme, setTheme] = useLocalStorage("theme", "light");
```

### デバウンスとスロットル

```tsx
// デバウンス Hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// スロットル Hook
function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastUpdated = useRef(Date.now());

  useEffect(() => {
    const now = Date.now();
    if (now >= lastUpdated.current + interval) {
      lastUpdated.current = now;
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastUpdated.current = Date.now();
        setThrottledValue(value);
      }, interval - (now - lastUpdated.current));

      return () => clearTimeout(timer);
    }
  }, [value, interval]);

  return throttledValue;
}

// 使用例
const debouncedSearch = useDebounce(searchTerm, 300);
```

### ウィンドウサイズ

```tsx
interface WindowSize {
  width: number;
  height: number;
}

function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}
```

### フォーム処理

```tsx
function useForm<T extends Record<string, any>>(initialValues: T) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleBlur = useCallback((
    e: React.FocusEvent<HTMLInputElement>
  ) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setErrors,
    reset,
  };
}
```

## React 18+ Hooks

### useTransition

```tsx
function SearchResults() {
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);  // 緊急更新

    startTransition(() => {
      setSearchResults(filterResults(value));  // 非緊急更新
    });
  };

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner />}
      <ResultList />
    </div>
  );
}
```

### useDeferredValue

```tsx
function SearchResults({ query }: { query: string }) {
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;

  return (
    <div style={{ opacity: isStale ? 0.5 : 1 }}>
      <Results query={deferredQuery} />
    </div>
  );
}
```

### useId

```tsx
function FormField({ label }: { label: string }) {
  const id = useId();

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} />
    </div>
  );
}
```

## まとめ

React Hooks のポイント：

1. **useState** - 基本的な状態管理
2. **useEffect** - 副作用とライフサイクル
3. **useContext** - コンポーネント間の状態共有
4. **useMemo/useCallback** - パフォーマンス最適化
5. **カスタム Hooks** - ロジックの再利用と抽象化
