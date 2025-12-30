---
title: React Hooks
description: React Hooks 完全指南、自定义 Hooks 与最佳实践
order: 2
tags:
  - react
  - hooks
  - frontend
  - state
---

# React Hooks

## Hooks 概述

Hooks 是 React 16.8 引入的特性，让函数组件拥有状态和生命周期等能力，实现逻辑复用而无需改变组件层次结构。

```
常用 Hooks
├── useState - 状态管理
├── useEffect - 副作用处理
├── useContext - 上下文消费
├── useReducer - 复杂状态
├── useRef - 引用与 DOM
├── useMemo - 计算缓存
├── useCallback - 函数缓存
└── 自定义 Hooks - 逻辑复用
```

## 基础 Hooks

### useState

```tsx
// 基本用法
const [count, setCount] = useState(0);
setCount(1);
setCount(prev => prev + 1);

// 对象状态
const [user, setUser] = useState({ name: "", age: 0 });
setUser(prev => ({ ...prev, name: "Alice" }));

// 惰性初始化
const [data, setData] = useState(() => {
  return expensiveComputation();
});

// 类型化状态
interface User {
  id: string;
  name: string;
  email: string;
}

const [user, setUser] = useState<User | null>(null);
```

### useEffect

```tsx
// 基本副作用
useEffect(() => {
  document.title = `Count: ${count}`;
});

// 依赖数组
useEffect(() => {
  fetchData(id);
}, [id]);  // 仅当 id 改变时执行

// 清理函数
useEffect(() => {
  const subscription = api.subscribe(id);
  return () => {
    subscription.unsubscribe();
  };
}, [id]);

// 仅挂载时执行
useEffect(() => {
  console.log("Component mounted");
  return () => console.log("Component unmounted");
}, []);

// 异步效果
useEffect(() => {
  const fetchData = async () => {
    const result = await api.getData();
    setData(result);
  };
  fetchData();
}, []);

// AbortController 取消请求
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
// 创建 Context
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

// 消费 Context
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
// 定义 reducer
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

// 使用 reducer
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
// DOM 引用
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

// 可变值存储
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

// 保存上一个值
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
```

## 性能 Hooks

### useMemo

```tsx
// 缓存计算结果
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

// 缓存复杂对象
const chartData = useMemo(() => ({
  labels: data.map(d => d.date),
  values: data.map(d => d.value),
}), [data]);
```

### useCallback

```tsx
// 缓存回调函数
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

// 依赖外部变量
const handleSubmit = useCallback((data: FormData) => {
  api.submit(userId, data);
}, [userId]);
```

## 自定义 Hooks

### 数据获取

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

// 使用
const { data, loading, error, refetch } = useFetch<User[]>("/api/users");
```

### 本地存储

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

// 使用
const [theme, setTheme] = useLocalStorage("theme", "light");
```

### 防抖与节流

```tsx
// 防抖 Hook
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

// 节流 Hook
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

// 使用
const debouncedSearch = useDebounce(searchTerm, 300);
```

### 窗口尺寸

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

### 表单处理

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
    setQuery(value);  // 紧急更新

    startTransition(() => {
      setSearchResults(filterResults(value));  // 非紧急更新
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

## 总结

React Hooks 要点：

1. **useState** - 基础状态管理
2. **useEffect** - 副作用与生命周期
3. **useContext** - 跨组件状态共享
4. **useMemo/useCallback** - 性能优化
5. **自定义 Hooks** - 逻辑复用与抽象
