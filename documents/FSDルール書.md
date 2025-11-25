# 👑 RaidChain WebUI FSD ルール書

## 1. 🌈 レイヤー構造と依存関係の原則

本プロジェクトのレイヤーは以下の順で構成されており、**上位レイヤーは下位レイヤーにのみ依存可能**な一方向の依存関係を厳守します。

- **依存関係の方向**: `App` → `Pages` → `Widgets` → `Features` → `Entities` → `Shared`

---

## 2. 🗂️ 各レイヤーの責務と配置ルール

各レイヤーの目的、主な内容、およびコードの配置ルールを定義します。

### 💻 App (アプリケーション)

- **責務**: アプリケーションの単一のエントリーポイント。グローバルストアの初期化、WebSocketリスナーの統合、レイアウトとページの結合を担当します。
- **内容**:
  - `src/app/index.tsx`
- **ルール**:
  - `widgets/layout/MainLayout`に依存し、`pages`を切り替えます。
  - グローバルなデータロード（`loadData`）や、アプリ全体に関わるWebSocketイベント（BlockFeedなど）のハンドリングを行います。

### 📄 Pages (ページ)

- **責務**: 各画面（レイヤー）のルーティングターゲット。`Widgets`や`Features`を組み合わせて画面レイアウトを構築します。
- **内容**:
  - `src/pages/monitoring/index.tsx`
  - `src/pages/experiment/index.tsx`
  - `src/pages/deployment/index.tsx`
  - `src/pages/economy/index.tsx`
  - `src/pages/library/index.tsx`
  - `src/pages/preset/index.tsx`
- **ルール**:
  - ビジネスロジックを持たず、UIの配置と`Features`層への委譲に徹します。

### 🧩 Widgets (ウィジェット)

- **責務**: 複数のページで使用される**複合UIコンポーネント**や、グローバルなレイアウト部品。
- **内容**:
  - `src/widgets/layout/*` (`Header`, `Sidebar`, `MainLayout`)
  - `src/widgets/log-modal/*` (`LogModal`)
- **ルール**:
  - 特定のFeatureに依存しても良いですが、基本的には`Shared`コンポーネントの組み合わせで構成されます。

### ✨ Features (フィーチャー)

- **責務**: 特定の**ビジネスユースケース**を実現するためのロジック（Store/Hooks）とUIコンポーネント。
- **内容**:
  - **`experiment`**: シナリオ生成・実行ロジック (`models/store.ts`), 設定フォームUI。
  - **`monitoring`**: リアルタイム監視ロジック (`models/store.ts`), `TopologyGraph`, `BlockFeed`。
  - **`deployment`**: ビルド・スケーリング制御 (`hooks/useDeploymentControl`)。
  - **`library`**: 結果テーブルのフィルタリング・ソート (`hooks/useTableFilterSort`), ツールバー。
  - **`preset`**: プリセット管理ロジック (`entities`を利用), サイドパネルUI。
- **ルール**:
  - **ロジック**: ユースケース固有の状態は `models/store.ts` (Zustand Slice) やカスタムHooksに定義。
  - **UI**: その機能に特化したコンポーネント（例: `ExperimentConfigForm`）を配置。
  - **依存**: `Entities`のモデルや`Shared`のAPI/UIを利用。

### 🧬 Entities (エンティティ)

- **責務**: ドメインデータモデルの定義と、基本的なCRUD操作。
- **内容**:
  - `src/entities/account/*`
  - `src/entities/node/*` (NodeStatus, BlockEvent)
  - `src/entities/scenario/*`
  - `src/entities/result/*`
  - `src/entities/preset/*`
  - `src/entities/deployment/*`
- **ルール**:
  - **モデル**: `types.ts` と `schemas.ts` (Zod) で厳密に定義。
  - **Store**: 単純なデータの保持・更新（CRUD）を行うStore Sliceを定義。複雑なビジネスロジックは含めない。

### ⚙️ Shared (共有)

- **責務**: アプリケーション全体で利用される汎用機能。どのレイヤーにも依存しない。
- **内容**:
  - **`ui`**: デザインシステム (`Button`, `Card`, `Modal`, `Table`, `Badge` 等)。
  - **`lib`**: 汎用Hooks (`useWebSocket`, `useResizerPanel`)。
  - **`api`**: バックエンドAPIクライアント。
  - **`store`**: グローバルストアの結合定義 (`index.ts`, `types.ts`)。
  - **`mocks`**: MSWハンドラとデータ生成ロジック。
- **ルール**:
  - 他のレイヤー（Entities, Features等）への依存は禁止（`store/index.ts`での集約を除く）。
