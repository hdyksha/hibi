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

### サーバー

```bash
cd server
npm install
npm run dev
```

### クライアント

```bash
cd client
npm install
npm run dev
```

## テスト実行

### サーバー

```bash
cd server
npm test
```

### クライアント

```bash
cd client
npm test
```

## 技術スタック

- **フロントエンド**: React 18, TypeScript, Vite
- **バックエンド**: Node.js, Express.js, TypeScript
- **テスト**: Vitest
- **データストレージ**: JSON ファイル