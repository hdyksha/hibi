# Smooth Transitions 実装ガイドライン

このドキュメントは、smooth-transitions機能の実装時に注意すべきポイントをまとめたものです。

## 🎯 Optimistic UIの基本原則

### 1. 即座のフィードバック
- ユーザーアクションに対して**即座に**UIを更新する
- API呼び出しの完了を待たない
- ローディング状態を表示しない

### 2. 状態管理の完全性
- 状態を削除する場合は、**すべての関連箇所**を確認する
  - ✅ 状態の宣言
  - ✅ インターフェース定義
  - ✅ 戻り値
  - ✅ 使用箇所（コンポーネント、テスト）

### 3. 副作用の追跡
- 関数呼び出しの**全体の流れ**を把握する
  - 呼び出される関数が何をするか
  - その関数が内部で何を呼び出すか
  - 状態更新のタイミング

## 🔍 実装前のチェックリスト

### Phase 1: 現状分析
- [ ] 現在のローディング状態がどこで管理されているか特定
- [ ] 状態更新のトリガーとなる関数をすべてリストアップ
- [ ] 副作用（refreshなど）を持つ関数を特定
- [ ] 表示順序のロジックを確認

### Phase 2: 設計
- [ ] Optimistic状態と実際の状態の管理方法を決定
- [ ] 状態の切り替えタイミングを設計
- [ ] エラー時のロールバック戦略を決定
- [ ] 重複防止のロジックを設計

### Phase 3: 実装
- [ ] ローディング状態の削除（完全に）
- [ ] Optimistic更新の実装
- [ ] 副作用の回避または制御
- [ ] 表示順序の統一

### Phase 4: 検証
- [ ] ローディング画面が表示されないことを確認
- [ ] ちらつきがないことを確認
- [ ] 位置が保持されることを確認
- [ ] エラー時の動作を確認

## 🚨 よくある落とし穴

### 1. 不完全な状態削除
```typescript
// ❌ 悪い例：宣言だけ削除
const [isSubmitting, setIsSubmitting] = useState(false); // 削除
// でもインターフェースには残っている

// ✅ 良い例：すべて削除
// - useState宣言
// - インターフェース定義
// - 戻り値
// - 使用箇所
```

### 2. 隠れた副作用
```typescript
// ❌ 悪い例：副作用を見落とす
await todoState.createTodo(input); // 内部でrefreshTodos()を呼ぶ

// ✅ 良い例：直接APIを呼ぶ
await todoApi.createTodo(input); // 副作用なし
```

### 3. 状態の同期タイミング
```typescript
// ❌ 悪い例：即座に削除してrefresh
setOptimisticTodos(prev => prev.filter(t => t.id !== tempId));
await refreshTodos(); // ちらつく

// ✅ 良い例：置き換えて保持
setOptimisticTodos(prev => 
  prev.map(t => t.id === tempId ? newTodo : t)
);
// refreshは呼ばない
```

### 4. 表示順序の不一致
```typescript
// ❌ 悪い例：サーバーの順序をそのまま使用
setTodos(todoItems);

// ✅ 良い例：クライアント側でソート
const sortedTodos = [...todoItems].sort((a, b) => 
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
);
setTodos(sortedTodos);
```

## 📋 実装パターン

### パターン1: Optimistic Create
```typescript
const addOptimistic = async (input) => {
  // 1. 一時的なアイテムを作成
  const tempItem = { id: 'temp-...', ...input };
  setOptimisticItems(prev => [...prev, tempItem]);
  
  try {
    // 2. API呼び出し（副作用なし）
    const newItem = await api.create(input);
    
    // 3. 一時的なアイテムを実際のアイテムに置き換え
    setOptimisticItems(prev => 
      prev.map(item => item.id === tempItem.id ? newItem : item)
    );
    
    // 4. refreshは呼ばない（重複除去ロジックで対応）
    
    return newItem;
  } catch (error) {
    // 5. エラー時はロールバック
    setOptimisticItems(prev => 
      prev.filter(item => item.id !== tempItem.id)
    );
    throw error;
  }
};
```

### パターン2: 重複除去
```typescript
const displayItems = useMemo(() => {
  // Optimistic itemsのIDセットを作成
  const optimisticIds = new Set(optimisticItems.map(i => i.id));
  
  // 実際のitemsから重複を除外
  const actualItems = items.filter(i => !optimisticIds.has(i.id));
  
  // Optimistic itemsを先頭に配置
  return [...optimisticItems, ...actualItems];
}, [optimisticItems, items]);
```

## 🎓 学んだ教訓

1. **全体像を把握する**: 部分的な修正ではなく、関連するすべてのコードを確認
2. **副作用を追跡する**: 関数呼び出しの連鎖を最後まで追う
3. **段階的に検証する**: 各ステップで動作を確認し、問題を早期発見
4. **一貫性を保つ**: Optimistic UIと実際のUIで表示順序を統一

## 🔧 デバッグのヒント

### ローディングが表示される場合
1. `setLoading(true)`を呼び出している箇所を検索
2. `refreshTodos()`などのrefresh系関数の呼び出しを確認
3. 副作用を持つ関数（`createTodo`など）の内部実装を確認

### ちらつきが発生する場合
1. 状態の削除と追加のタイミングを確認
2. `setTimeout`の使用箇所を確認
3. 状態の切り替えロジックを見直す

### 位置が変わる場合
1. ソート処理の有無を確認
2. Optimistic状態と実際の状態の順序を比較
3. `displayItems`のマージロジックを確認

## 📚 参考資料

- [Optimistic UI Patterns](https://www.patterns.dev/posts/optimistic-ui)
- React State Management Best Practices
- Error Handling in Optimistic Updates

---

**最終更新**: 2025-11-14
**作成者**: Kiro AI
