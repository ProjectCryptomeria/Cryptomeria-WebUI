## 2. 🗂️ 各レイヤーの FSD 遵守状況

現在のコードベース（`src/`）を分析し、FSDルールに対する遵守状況を確認しました。全体として、**一方向の依存関係**と**責務の分離**が非常に高いレベルで維持されています。

### 💻 App (アプリケーション)

- **遵守状況**: ✅ 遵守
- **詳細**: `src/app/index.tsx` は、`MainLayout` (`Widgets`) を使用し、ルーティング（状態による画面切り替え）とグローバルなデータロード (`loadData`)、および全画面共通のWebSocketリスナー（BlockFeedのバックグラウンド受信など）の管理に集中しています。

### 📄 Pages (ページ)

- **遵守状況**: ✅ 遵守
- **詳細**: `monitoring/index.tsx` や `experiment/index.tsx` などは、自ら複雑な状態管理を行わず、`Features`層のコンポーネント（`TopologyGraph`, `ExperimentConfigForm`）やHooksを配置するコンテナとして機能しています。

### 🧩 Widgets (ウィジェット)

- **遵守状況**: ✅ 遵守
- **詳細**: `widgets/layout` は画面の骨格を提供し、`widgets/log-modal` は複数の画面から呼び出される共通のモーダルUIを提供しています。これらは特定のページに依存していません。

### ✨ Features (フィーチャー)

- **遵守状況**: ✅ 遵守
- **詳細**: 各機能が適切にモジュール化されています。
  - **Monitoring**: 以前は表示のみでしたが、現在は `src/features/monitoring/models/store.ts` (`createMonitoringSlice`) を持ち、ブロック履歴の管理ロジックを内包しています。これはFSDにおいて正しい進化です。
  - **Experiment**: シナリオ生成の複雑なロジックは `features/experiment` 内に閉じ込められています。
  - **Preset**: 独立したFeatureとしてUIとロジックを持っています。

### 🧬 Entities (エンティティ)

- **遵守状況**: ✅ 遵守
- **詳細**: `account`, `node`, `scenario` など、ドメインモデルごとにディレクトリが分かれています。`models/store.ts` には純粋なCRUD操作やデータ保持のみが記述されており、ビジネスロジック（実験の実行フローなど）は混入していません。

### ⚙️ Shared (共有)

- **遵守状況**: ✅ 遵守（許容された例外を含む）
- **詳細**:
  - UIコンポーネント (`Button`, `Card`) や Hooks (`useWebSocket`) は完全に独立しており、高い再利用性を持ちます。
  - **例外**: `src/shared/store/index.ts` は、Zustandの仕様上、`features` や `entities` のスライスをインポートして結合しています。これはFSDにおける「App層またはShared層でのStore集約」として許容されるパターンです。

### 総合評価

リポジトリはFSDの原則に厳格に従って構成されており、スケーラビリティと保守性が高い状態です。特に、MSWを用いたモックサーバーロジックが `shared/mocks` に分離されているため、将来的なバックエンド接続の実装時にも、UI側の変更を最小限に抑えられる構造になっています。
