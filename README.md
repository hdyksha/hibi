# Todo App

シンプルなタスク管理アプリケーション

## プロジェクト構造

```
todo-app/
├── client/                    # React フロントエンド
│   ├── src/
│   │   ├── components/       # UI コンポーネント
│   │   │   ├── common/       # 共通UIコンポーネント（Button、Inputなど）
│   │   │   ├── TodoItem/     # TodoItemコンポーネントとサブコンポーネント
│   │   │   ├── TodoForm/     # TodoFormコンポーネントとサブコンポーネント
│   │   │   ├── Filter/       # Filterコンポーネントとサブコンポーネント
│   │   │   └── Archive/      # Archiveコンポーネントとサブコンポーネント
│   │   ├── contexts/         # React Context（状態管理）
│   │   ├── hooks/            # カスタムフック
│   │   ├── services/         # API通信層
│   │   │   ├── api/          # 機能別APIクライアント（TodoApi、FileApiなど）
│   │   │   └── http/         # 共通HTTPクライアント
│   │   ├── types/            # TypeScript型定義
│   │   ├── utils/            # ユーティリティ関数
│   │   └── test/             # テストユーティリティ
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── vitest.config.ts
├── server/                    # Express.js バックエンド
│   ├── src/
│   │   ├── middleware/       # Express ミドルウェア
│   │   ├── models/           # データモデルとバリデーション
│   │   ├── routes/           # API ルートハンドラー
│   │   ├── services/         # ビジネスロジック層
│   │   ├── utils/            # ユーティリティ関数（バリデーターなど）
│   │   └── test-utils/       # テストユーティリティ
│   ├── data/                 # JSON データストレージ（デフォルト）
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.ts
└── README.md
```

## セットアップ

### 全体のセットアップ（推奨）

```bash
# 全ての依存関係をインストール
npm run install:all

# 開発サーバーを同時起動（サーバー + クライアント）
npm run dev
```

### 環境変数の設定（オプション）

サーバーの設定をカスタマイズする場合は、プロジェクトルートに`.env`ファイルを作成します：

```bash
# プロジェクトルートで実行
cp .env.example .env
```

`.env`ファイルで以下の設定が可能です：

- `PORT`: サーバーのポート番号（デフォルト: 3001）
- `TODO_DATA_DIR`: データファイルを保存するディレクトリ（デフォルト: server/data）

**例：カスタムデータディレクトリの使用**

```bash
# .env (プロジェクトルート)
TODO_DATA_DIR=custom-data
```

または、複数のプロジェクトで共有ディレクトリを使用：

```bash
# .env (プロジェクトルート)
TODO_DATA_DIR=../shared-todo-data
```

### 個別セットアップ

#### サーバー

```bash
cd server
npm install
npm run dev
```

#### クライアント

```bash
cd client
npm install
npm run dev
```

## テスト実行

### 全体のテスト実行（推奨）

```bash
# 全てのテストを実行
npm test

# 全てのテストをwatch モードで実行
npm run test:watch
```

### 個別テスト実行

```bash
# サーバーのみ
npm run test:server

# クライアントのみ
npm run test:client
```

## その他のコマンド

```bash
# 本番用ビルド
npm run build

# サーバーのみ起動（本番）
npm start

# ビルド成果物とnode_modulesを削除
npm run clean
```

## アーキテクチャ

### フロントエンド（Client）

- **コンポーネント設計**: 小さく再利用可能なコンポーネントに分割
  - 共通UIコンポーネント（Button、Inputなど）を提供
  - 大きなコンポーネントをサブコンポーネントに分割して責任を明確化
- **状態管理**: React Context APIを使用
- **API通信**: 機能別に分割されたAPIクライアント（TodoApi、FileApi）
  - 共通HTTPクライアントでエラーハンドリングを統一
- **カスタムフック**: ロジックを再利用可能なフックに抽出
- **スタイリング**: Tailwind CSSを使用し、共通スタイルを定数化

### バックエンド（Server）

- **レイヤードアーキテクチャ**: Routes → Services → Models
  - **Routes**: 薄いルートハンドラー、サービス層への委譲に専念
  - **Services**: ビジネスロジックを集約（TodoService）
  - **Models**: データモデルとバリデーション
- **バリデーション**: 統一されたバリデーターユーティリティを使用
- **エラーハンドリング**: 統一されたエラーハンドリングミドルウェア
- **データ永続化**: JSONファイルベース（FileStorageService）

### コード品質

- **型安全性**: TypeScriptの型システムを最大限活用、`any`型の使用を最小化
- **テスト**: Vitestを使用した包括的なテストスイート
- **コードの一貫性**: 統一された命名規則とコーディングスタイル
- **ドキュメント**: JSDocコメントと複雑なロジックへの説明コメント

## 技術スタック

- **フロントエンド**: React 18, TypeScript, Vite, Tailwind CSS
- **バックエンド**: Node.js, Express.js, TypeScript
- **テスト**: Vitest, React Testing Library, Supertest
- **データストレージ**: JSON ファイル