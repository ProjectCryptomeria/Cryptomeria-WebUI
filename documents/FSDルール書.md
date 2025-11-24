# 👑 RaidChain WebUI FSD ルール書

## 1. 🌈 レイヤー構造と依存関係の原則

本プロジェクトのレイヤーは以下の順で構成されており、**上位レイヤーは下位レイヤーにのみ依存可能**な一方向の依存関係を厳守します。

- **依存関係の方向**: `App` → `Pages` → `Widgets` → `Features` → `Entities` → `Shared`

---

## 2. 🗂️ 各レイヤーの責務と配置ルール

各レイヤーの目的、主な内容、およびコードの配置ルールを定義します。

### 💻 App (アプリケーション)

- **責務**: アプリケーションの単一のエントリーポイントであり、グローバルな初期化とルーティング、およびグローバルなWebSocketリスナーの確立を担当します。
- **内容**:
  - `src/app/index.tsx`
- **ルール**:
  - `widgets/layout/MainLayout`に依存し、`pages`を切り替えます。
  - Zustandの`useGlobalStore`の初期ロード（`loadData`）やWebSocketリスナーの登録など、グローバルな処理を担います。

### 📄 Pages (ページ)

- **責務**: 各画面（レイヤー）のルーティングターゲットとなり、`Widgets`や`Features`を組み合わせて画面を組み立てます。
- **内容**:
  - `src/pages/[layerName]/index.tsx`
- **ルール**:
  - **ビジネスロジックや状態管理ロジックを直接記述してはなりません**。
  - ロジックは対応する`Features`に委譲し、`PageHeader`などの共通UI部品の配置に専念します。

### 🧩 Widgets (ウィジェット)

- **責務**: 複数のページにまたがって再利用される**複合的なUIコンポーネント**や、アプリケーション全体に影響を与えるレイアウト、グローバルな表示機能を定義します。
- **内容**:
  - `src/widgets/layout/*` (`Header`, `Sidebar`, `MainLayout`)
  - `src/widgets/log-modal/*` (`LogModal`)
- **ルール**:
  - `Features`や`Entities`のストア、`Shared`のUIコンポーネントを組み合わせて使用します。

### ✨ Features (フィーチャー)

- **責務**: 「実験実行」「デプロイ制御」「ライブラリのソート/フィルター」といった**特定のユーザーユースケース（ビジネスプロセス）**の実現に必要なロジックと専用UIを提供します。
- **内容**:
  - `src/features/experiment/*` (シナリオ生成/実行)
  - `src/features/deployment/*` (デプロイ制御)
  - `src/features/library/*` (テーブルロジック)
  - `src/features/monitoring/*` (グラフ表示)
- **ルール**:
  - **ロジック**: **`model/store.ts`** にZustand Sliceとして状態管理ロジックを定義します。（例: `createExecutionSlice`）
  - **フック**: **`hooks/*`** にユースケース固有のロジックをカプセル化したHooksを定義します。（例: `useExperimentConfig`）
  - **依存**: `Entities`層のデータモデル（`ExperimentScenario`など）や`Shared`層のAPIに依存します。

### 🧬 Entities (エンティティ)

- **責務**: アプリケーションの**コアなドメインデータモデル**を定義し、そのモデルに対する最小限のCRUD操作を提供します。
- **内容**:
  - `src/entities/scenario/*`
  - `src/entities/account/*`
  - `src/entities/preset/*`
- **ルール**:
  - **データ構造**: `model/types.ts`に型定義を厳密に行います。
  - **検証**: `model/schemas.ts`にZodスキーマを定義します。
  - **ロジック**: `model/store.ts`には、データモデルに対する単純な作成、読み取り、更新、削除（CRUD）のロジックのみを記述します。（例: `createUser`, `deleteUser`）

### ⚙️ Shared (共有)

- **責務**: **どのレイヤーにも依存せず**、アプリケーション全体で利用可能な汎用的な機能、UI、ユーティリティを提供します。
- **内容**:
  - **`ui`**: デザインシステムを構成するAtomicなUIコンポーネント（`Button`、`Card`、`Modal`）。
  - **`lib`**: 汎用的なHooks（`useWebSocket`、`useResizerPanel`）やテストユーティリティ。
  - **`api`**: バックエンドAPIへの接続を抽象化したクライアント (`src/shared/api/index.ts`)。
  - **`store`**: グローバルストアの型定義と、スライスを統合する基盤 (`src/shared/store/index.ts`)。
- **ルール**:
  - **他のレイヤーへの依存は一切許可しません**。
