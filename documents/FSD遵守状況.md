## 2. 🗂️ 各レイヤーの FSD 遵守状況

現在のファイル構造とインポート方法を、作成された FSD ルール書と照らし合わせ、各レイヤーが原則にどの程度従っているかを分析しました。

全体として、このリポジトリは FSD の**一方向の依存関係の原則**（上位 → 下位）を非常に高いレベルで遵守しています。ごく一部の例外は、Zustand のグローバルな状態管理やアプリケーションの初期化といった、**FSDでも一般的に許容される実用的な例外**に留まっています。

### 💻 App (アプリケーション) の遵守状況

- **責務の遵守**: 完全に遵守しています。`src/app/index.tsx`は、`MainLayout`を使用して`pages`を切り替え、`useWebSocket`でグローバルなイベント（Base Feeや実行進捗）を購読し、`useGlobalStore`の`loadData`を呼び出すなど、**グローバルなオーケストレーション**に特化しています。
- **依存関係の遵守**: 概ね遵守していますが、以下の通り、**グローバルな連携のため**に下位レイヤーに直接依存しています。
  - **OK**: `widgets` (`MainLayout`, `LogModal`)、`pages` (`MonitoringPage`など) への依存は階層的に正しいです。
  - **許容される例外**: `shared/lib/hooks/useWebSocket`や`shared/store`、`entities/*`の型定義を直接インポートしていますが、これはアプリケーションの最上位層としてグローバルな状態やイベントリスナーをセットアップする上で**必要かつ一般的なFSDの適応**です。

### 📄 Pages (ページ) の遵守状況

- **責務の遵守**: 完全に遵守しています。すべてのページ (`ExperimentPage`、`DeploymentPage`、`LibraryPage`など) は、`PageHeader`、`Card`、`Modal`といった`Shared/UI`や、`useExperimentConfig`、`useTableFilterSort`といった`Features`層のHooksを使用する**組み立て役**に徹しており、独自の複雑なビジネスロジックは含んでいません。
- **依存関係の遵守**: 完全に遵守しています。`Pages`層は、`Features`、`Entities`、`Widgets`、`Shared`の各下位レイヤーのみに依存しており、上位レイヤー（`App`）や同階層に不適切に依存する例は見られません。

### 🧩 Widgets (ウィジェット) の遵守状況

- **責務の遵守**: 完全に遵守しています。`widgets/layout/*`はレイアウト骨格を、`widgets/log-modal/*`はグローバルなモーダル機能を担っており、責務が明確です。
- **依存関係の遵守**: 完全に遵守しています。`Header.tsx`は`shared/store`からグローバルな状態（`execution`, `users`）を取得し、`Sidebar.tsx`も同様に`useGlobalStore`からデータを取得していますが、これは下位レイヤーへの依存であり原則に従っています。

### ✨ Features (フィーチャー) の遵守状況

- **責務の遵守**: 完全に遵守しています。ロジックは Hooks (`useExperimentConfig`, `useDeploymentControl`) や Store Slice (`createExecutionSlice`) に明確にカプセル化されています。
- **依存関係の遵守**: 完全に遵守しています。すべてのフィーチャーロジックは、`Entities`（例: `entities/scenario`）および`Shared`（例: `shared/api`, `shared/store`）にのみ依存しており、上位レイヤーへの逆依存はありません。

### 🧬 Entities (エンティティ) の遵守状況

- **責務の遵守**: 完全に遵守しています。`Entities`層の Store Slice (`createEconomySlice`, `createLibrarySlice`など) は、アカウントの作成/削除や結果の登録といった**単純な CRUD 操作**に限定されており、複雑なビジネスロジック（例: シナリオの生成アルゴリズム）は含まれていません。
- **依存関係の遵守**: 完全に遵守しています。Entity の各 Slice は、API クライアント (`shared/api`) やグローバルストアの型定義 (`shared/store/types`) といった**`Shared`層にのみ**依存しています。

### ⚙️ Shared (共有) の遵守状況

- **責務の遵守**: 完全に遵守しています。`ui`、`lib`、`api`、`config`、`types`といった汎用的な要素に分割されており、それぞれのモジュールが独立しています。
- **依存関係の遵守**: 完全に遵守しています。`Shared`層は他のどのアプリケーション層にも依存しておらず、外部ライブラリ（`react`, `lucide-react`など）または自身のサブモジュールにのみ依存しています。
  - **許容される例外**: `src/shared/store/index.ts`では、アプリケーションの起動時に全スライスをまとめるために`entities/*`と`features/*`の Slice 関数をインポートしていますが、これは Zustand を用いた FSD における**グローバルストア構成上の必然的な例外**であり、ロジック自体が逆依存しているわけではありません。
