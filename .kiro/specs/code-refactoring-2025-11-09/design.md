# リファクタリング設計書

## 概要

このドキュメントは、Todoアプリケーションのコードベースをリファクタリングするための設計を定義します。既存の機能を維持しながら、コードの可読性、保守性、拡張性を向上させることを目的としています。

## アーキテクチャ

### 現在のアーキテクチャ

```
todo-app/
├── client/                    # React フロントエンド
│   ├── src/
│   │   ├── components/       # UI コンポーネント
│   │   ├── contexts/         # React Context (状態管理)
│   │   ├── hooks/            # カスタムフック
│   │   ├── services/         # API クライアント
│   │   ├── types/            # TypeScript 型定義
│   │   └── utils/            # ユーティリティ関数
│   └── ...
└── server/                    # Express.js バックエンド
    ├── src/
    │   ├── middleware/       # Express ミドルウェア
    │   ├── models/           # データモデルとバリデーション
    │   ├── routes/           # API ルート
    │   ├── services/         # ビジネスロジック
    │   └── utils/            # ユーティリティ関数
    └── ...
```

### リファクタリング後のアーキテクチャ

基本的なディレクトリ構造は維持しますが、以下の改善を行います：

1. **責任の明確化**: 各モジュールの責任を明確にし、単一責任の原則に従う
2. **依存関係の整理**: 循環依存を排除し、依存関係を一方向にする
3. **共通ロジックの抽出**: 重複するコードを共通モジュールに抽出する

## コンポーネントとインターフェース

### 1. サーバーサイド

#### 1.1 ルートハンドラー (routes/)

**現状の問題点:**
- `todos.ts` が500行以上あり、複数の責任を持っている
- フィルタリングロジックがルートハンドラー内に直接記述されている
- バリデーションロジックが分散している

**リファクタリング方針:**
- フィルタリングロジックを専用のサービスクラスに移動
- クエリパラメータのパースを専用の関数に抽出
- ルートハンドラーは薄く保ち、サービス層への委譲に専念

#### 1.2 サービス層 (services/)

**現状の問題点:**
- `FileStorageService` が単一のファイルに全ての責任を持っている
- エラーハンドリングが冗長

**リファクタリング方針:**
- ストレージ操作とビジネスロジックを分離
- 新しい `TodoService` クラスを作成し、Todo関連のビジネスロジックを集約
- エラーハンドリングを統一

#### 1.3 モデル層 (models/)

**現状の問題点:**
- `TodoItem.ts` が400行以上あり、バリデーション関数が多数存在
- バリデーションロジックが冗長

**リファクタリング方針:**
- バリデーション関数を統合し、共通のバリデーターを使用
- 型定義とバリデーションロジックを分離

#### 1.4 ミドルウェア (middleware/)

**現状:**
- エラーハンドリングミドルウェアは適切に実装されている

**リファクタリング方針:**
- 現状維持（必要に応じて軽微な改善のみ）

### 2. クライアントサイド

#### 2.1 コンポーネント (components/)

**現状の問題点:**
- `TodoItem.tsx` が200行以上あり、複数の責任を持っている
- `TodoForm.tsx` が200行以上あり、フォーム管理とバリデーションが混在
- `Filter.tsx` が200行以上あり、フィルター管理ロジックが複雑
- スタイリングのクラス名が長く、可読性が低い

**リファクタリング方針:**
- 大きなコンポーネントを小さなサブコンポーネントに分割
- プレゼンテーション層とロジック層を分離
- スタイリングを定数化または共通のユーティリティ関数に抽出
- 共通のUIパターン（ボタン、入力フィールドなど）をコンポーネント化

#### 2.2 カスタムフック (hooks/)

**現状の問題点:**
- `useTodos.ts` が100行以上あり、複数の責任を持っている
- エラーハンドリングロジックが重複している

**リファクタリング方針:**
- フックの責任を明確にし、必要に応じて分割
- 共通のエラーハンドリングロジックを統一

#### 2.3 サービス層 (services/)

**現状の問題点:**
- `apiClient.ts` が400行以上あり、すべてのAPI呼び出しが1つのクラスに集約されている
- エラーハンドリングロジックが冗長

**リファクタリング方針:**
- API クライアントを機能ごとに分割（Todo API、File API など）
- 共通のHTTPクライアントを抽出
- エラーハンドリングを統一

#### 2.4 コンテキスト (contexts/)

**現状:**
- コンテキストの実装は適切

**リファクタリング方針:**
- 現状維持（必要に応じて軽微な改善のみ）

## データモデル

### 既存のデータモデル

```typescript
interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  tags: string[];
  memo: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}
```

**リファクタリング方針:**
- データモデル自体は変更しない
- バリデーションロジックを簡素化

## エラーハンドリング

### 現状

サーバーサイドとクライアントサイドの両方で適切なエラーハンドリングが実装されています。

### リファクタリング方針

1. **エラーメッセージの統一**: エラーメッセージを定数化し、一貫性を保つ
2. **エラーロギングの改善**: 開発環境と本番環境で適切なログレベルを使用
3. **エラーリカバリーの強化**: リトライ可能なエラーとそうでないエラーを明確に区別

## テスト戦略

### 既存のテスト

プロジェクトには既存のテストが存在します。

### リファクタリング時のテスト方針

1. **既存テストの維持**: リファクタリング後も既存のテストが合格することを確認
2. **テストの更新**: 関数のシグネチャが変更された場合、テストを更新
3. **新規テストの追加**: 新しいユーティリティ関数やサービスクラスにテストを追加（必要に応じて）

## リファクタリングの優先順位

### フェーズ1: サーバーサイドの基盤整備

1. **バリデーションの統一** (高優先度)
   - `models/TodoItem.ts` のバリデーション関数を統合
   - 共通のバリデーターユーティリティを作成

2. **サービス層の整理** (高優先度)
   - `TodoService` クラスを作成し、ビジネスロジックを移動
   - フィルタリングロジックをサービス層に移動

3. **ルートハンドラーの簡素化** (中優先度)
   - `routes/todos.ts` を簡素化
   - クエリパラメータのパース関数を抽出

### フェーズ2: クライアントサイドの基盤整備

1. **API クライアントの分割** (高優先度)
   - `apiClient.ts` を機能ごとに分割
   - 共通のHTTPクライアントを抽出

2. **共通UIコンポーネントの作成** (中優先度)
   - ボタン、入力フィールドなどの共通コンポーネントを作成
   - スタイリングユーティリティを作成

### フェーズ3: コンポーネントのリファクタリング

1. **大きなコンポーネントの分割** (高優先度)
   - `TodoItem.tsx` を小さなコンポーネントに分割
   - `TodoForm.tsx` を小さなコンポーネントに分割
   - `Filter.tsx` を小さなコンポーネントに分割

2. **カスタムフックの整理** (中優先度)
   - `useTodos.ts` の責任を明確化
   - 必要に応じてフックを分割

### フェーズ4: コードの品質向上

1. **命名の改善** (低優先度)
   - 不明確な変数名や関数名を改善

2. **コメントとドキュメントの追加** (低優先度)
   - 複雑なロジックにコメントを追加
   - JSDocコメントを更新

3. **型安全性の向上** (低優先度)
   - `any` 型の使用を削減
   - 型アサーションを型ガードに置き換え

## 設計の詳細

### 1. バリデーションの統一

#### 現状

`models/TodoItem.ts` には個別のバリデーション関数が多数存在します：
- `validateTitle()`
- `validateCompleted()`
- `validateId()`
- `validatePriority()`
- `validateTags()`
- `validateMemo()`
- など

#### 改善案

共通のバリデーターユーティリティを作成し、バリデーションロジックを統合します。

```typescript
// utils/validator.ts
interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

class Validator<T> {
  private rules: ValidationRule<T>[] = [];

  addRule(rule: ValidationRule<T>): this {
    this.rules.push(rule);
    return this;
  }

  validate(value: T): ValidationResult {
    const errors: ValidationError[] = [];
    for (const rule of this.rules) {
      if (!rule.validate(value)) {
        errors.push({ field: 'value', message: rule.message });
      }
    }
    return { isValid: errors.length === 0, errors };
  }
}

// models/TodoItem.ts
const titleValidator = new Validator<string>()
  .addRule({
    validate: (v) => typeof v === 'string',
    message: 'Title must be a string'
  })
  .addRule({
    validate: (v) => v.trim().length > 0,
    message: 'Title cannot be empty'
  })
  .addRule({
    validate: (v) => v.length <= 200,
    message: 'Title cannot exceed 200 characters'
  });
```

### 2. サービス層の整理

#### 現状

ビジネスロジックがルートハンドラーに直接記述されています。

#### 改善案

`TodoService` クラスを作成し、ビジネスロジックを集約します。

```typescript
// services/TodoService.ts
export class TodoService {
  constructor(private storage: FileStorageService) {}

  async getTodos(filter?: TodoFilter): Promise<TodoItem[]> {
    const todos = await this.storage.readTodos();
    return filter ? this.applyFilter(todos, filter) : todos;
  }

  async createTodo(input: CreateTodoItemInput): Promise<TodoItem> {
    // バリデーション
    // TodoItem の作成
    // ストレージへの保存
  }

  async updateTodo(id: string, input: UpdateTodoItemInput): Promise<TodoItem> {
    // バリデーション
    // TodoItem の更新
    // ストレージへの保存
  }

  async deleteTodo(id: string): Promise<boolean> {
    // ストレージから削除
  }

  private applyFilter(todos: TodoItem[], filter: TodoFilter): TodoItem[] {
    // フィルタリングロジック
  }
}
```

### 3. API クライアントの分割

#### 現状

`apiClient.ts` が400行以上あり、すべてのAPI呼び出しが1つのクラスに集約されています。

#### 改善案

機能ごとにAPIクライアントを分割します。

```typescript
// services/http/HttpClient.ts
export class HttpClient {
  constructor(private baseUrl: string) {}

  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // 共通のHTTPリクエスト処理
  }
}

// services/api/TodoApi.ts
export class TodoApi {
  constructor(private http: HttpClient) {}

  async getTodos(filter?: TodoFilter): Promise<TodoItem[]> {
    return this.http.request('/todos', { /* ... */ });
  }

  async createTodo(input: CreateTodoItemInput): Promise<TodoItem> {
    return this.http.request('/todos', { method: 'POST', /* ... */ });
  }

  // その他のTodo関連API
}

// services/api/FileApi.ts
export class FileApi {
  constructor(private http: HttpClient) {}

  async getFiles(): Promise<FileInfo> {
    return this.http.request('/files');
  }

  async switchFile(fileName: string): Promise<SwitchFileResponse> {
    return this.http.request('/files/switch', { method: 'POST', /* ... */ });
  }

  // その他のFile関連API
}
```

### 4. コンポーネントの分割

#### 現状

`TodoItem.tsx` が200行以上あり、複数の責任を持っています。

#### 改善案

小さなサブコンポーネントに分割します。

```typescript
// components/TodoItem/TodoItem.tsx
export const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggleComplete, onDelete, onUpdate }) => {
  return (
    <div className="todo-item">
      <TodoItemHeader todo={todo} onToggleComplete={onToggleComplete} />
      <TodoItemContent todo={todo} />
      <TodoItemActions todo={todo} onEdit={handleEdit} onDelete={onDelete} />
    </div>
  );
};

// components/TodoItem/TodoItemHeader.tsx
export const TodoItemHeader: React.FC<TodoItemHeaderProps> = ({ todo, onToggleComplete }) => {
  // ヘッダー部分のレンダリング
};

// components/TodoItem/TodoItemContent.tsx
export const TodoItemContent: React.FC<TodoItemContentProps> = ({ todo }) => {
  // コンテンツ部分のレンダリング
};

// components/TodoItem/TodoItemActions.tsx
export const TodoItemActions: React.FC<TodoItemActionsProps> = ({ todo, onEdit, onDelete }) => {
  // アクション部分のレンダリング
};
```

### 5. スタイリングの改善

#### 現状

Tailwind CSSのクラス名が長く、可読性が低い。

#### 改善案

共通のスタイリングユーティリティを作成します。

```typescript
// utils/styles.ts
export const buttonStyles = {
  primary: 'px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700',
  secondary: 'px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200',
  danger: 'px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700',
};

export const inputStyles = {
  base: 'px-4 py-3 border rounded-lg focus:outline-none focus:ring-2',
  error: 'border-red-300 focus:border-red-500 focus:ring-red-500/25',
  normal: 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/25',
};

// 使用例
<button className={buttonStyles.primary}>Create Todo</button>
```

または、共通のButtonコンポーネントを作成します。

```typescript
// components/common/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  children, 
  onClick, 
  disabled 
}) => {
  const styles = {
    primary: 'px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700',
    secondary: 'px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200',
    danger: 'px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700',
  };

  return (
    <button 
      className={`${styles[variant]} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
```

## ベストプラクティスの適用

### 1. React のベストプラクティス

- **コンポーネントの分割**: 大きなコンポーネントを小さく、再利用可能なコンポーネントに分割
- **カスタムフックの活用**: ロジックをカスタムフックに抽出し、コンポーネントをシンプルに保つ
- **メモ化の適切な使用**: `React.memo`、`useMemo`、`useCallback` を適切に使用してパフォーマンスを最適化
- **プロップスの型定義**: すべてのプロップスに適切な型定義を提供

### 2. Express.js のベストプラクティス

- **ミドルウェアの活用**: 共通処理をミドルウェアに抽出
- **エラーハンドリング**: 統一されたエラーハンドリングミドルウェアを使用
- **非同期処理**: async/await を一貫して使用
- **バリデーション**: リクエストデータのバリデーションを徹底

### 3. TypeScript のベストプラクティス

- **型の明示**: `any` 型の使用を避け、具体的な型を使用
- **型ガードの使用**: 型アサーションの代わりに型ガードを使用
- **インターフェースの活用**: 共通の型定義をインターフェースとして定義
- **ジェネリクスの活用**: 再利用可能な型定義にジェネリクスを使用

## パフォーマンスの最適化

### 1. クライアントサイド

- **不要な再レンダリングの削減**: `React.memo` を使用して不要な再レンダリングを防ぐ
- **コールバックの最適化**: `useCallback` を使用してコールバック関数の再作成を防ぐ
- **計算結果のキャッシュ**: `useMemo` を使用して重い計算結果をキャッシュ
- **遅延ローディング**: 必要に応じてコンポーネントを遅延ローディング

### 2. サーバーサイド

- **データベースクエリの最適化**: 不要なデータの読み込みを避ける
- **キャッシュの活用**: 頻繁にアクセスされるデータをキャッシュ
- **非同期処理の最適化**: Promise.all を使用して並列処理を実現

## セキュリティの考慮事項

### 1. 入力バリデーション

- すべてのユーザー入力を検証
- SQLインジェクション、XSSなどの攻撃を防ぐ

### 2. エラーメッセージ

- 本番環境では詳細なエラー情報を公開しない
- ログには詳細情報を記録

### 3. CORS設定

- 適切なCORS設定を維持
- 信頼できるオリジンのみを許可

## まとめ

このリファクタリング設計は、既存の機能を維持しながら、コードの品質を向上させることを目的としています。段階的なアプローチを採用することで、リスクを最小限に抑えながら、着実に改善を進めることができます。
