# Todo App

シンプルなタスク管理アプリケーション

## プロジェクト構造

```
todo-app/
├── client/          # React フロントエンド
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── vitest.config.ts
├── server/          # Express.js バックエンド
│   ├── src/
│   ├── data/        # JSON データストレージ
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

## 技術スタック

- **フロントエンド**: React 18, TypeScript, Vite
- **バックエンド**: Node.js, Express.js, TypeScript
- **テスト**: Vitest
- **データストレージ**: JSON ファイル