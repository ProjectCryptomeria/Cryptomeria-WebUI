ご提示いただいた仕様書とリポジトリの分析結果に基づき、開発者や研究者がこのプロジェクトの価値を即座に理解し、利用を開始できるように構成した`README.md`案を作成しました。

プロジェクトの「究極の目的」である「脱CLI・GUIによる直感的な操作」を強調しつつ、各機能の技術的な裏付けも記載しています。

---

# 🌌 RaidChain WebUI

**RaidChain WebUI**は、Cosmos SDKベースのモジュラーブロックチェーンシステム「**RaidChain**」の研究開発、実験、および運用を効率化するための統合管理コンソールです。

これまで`Ignite CLI`, `kubectl`, `shell script`, `justfile`を駆使して行われていた複雑なチェーン操作を、モダンなWebインターフェースに集約。ブロックチェーンのデプロイから、複雑なデータ転送実験のシナリオ作成、リアルタイムモニタリングまでをGUI完結させることを目的としています。

## 📖 概要

RaidChainは、Internet Computerのような「フルオンチェーンWeb」をCosmosエコシステム上で再現する野心的なプロジェクトです。WebUIは、このシステムの以下の4つのコンポーネントをオーケストレーションします。

1.  **Controlchain**: 統合管理ロジック
2.  **Metachain**: メタデータ管理
3.  **Datachain**: データ保存（負荷分散のため複数稼働・スケーリング可能）
4.  **Relayer**: IBC通信

本UIは、Kubernetes上のコンテナ操作やDockerイメージのビルドプロセスを抽象化し、研究者が「インフラ管理」ではなく「ブロックチェーンの挙動実験」に集中できる環境を提供します。

## ✨ 主な機能 (Features)

### 1\. 🖥️ ネットワークモニタリング (Network Monitoring)

RaidChainエコシステム全体の稼働状況を可視化します。

- **トポロジーグラフ**: ノード間の接続とIBCパケットの流れをアニメーション表示。
- **ノードステータス**: 各チェーン（Control/Meta/Data）のブロック高、レイテンシ、Active/Inactive状態を監視。
- **Mempool & Base Fee**: トランザクションの滞留状況や手数料推移をリアルタイムグラフで確認。

### 2\. 🚀 デプロイメント制御 (Deployment & Scaling)

煩雑な`kubectl`や`helm`操作を不要にします。

- **GUIビルド**: ターゲットコンポーネントを選択し、Dockerイメージのビルドをワンクリックで開始。ビルドログはリアルタイムでストリーミングされます。
- **オートスケーリング**: スライダー操作のみでDatachainノード数（例: 1〜10）を増減させ、`Helm Upgrade`を裏側で実行します。
- **環境リセット**: ワンクリックでPVC（永続ボリューム）を含む全データを破棄し、クリーンな環境を再構築。

### 3\. 🧪 実験シナリオビルダー (Experiment Scenarios)

[Image of flowchart for scientific experiment process]

研究開発のための複雑なデータ転送実験を自動化します。

- **多重シナリオ生成**: データサイズやチャンクサイズを「範囲（Range）」で指定し、複数の実験条件を組み合わせたシナリオを一括生成。
- **戦略セレクター**: Allocator（保存先割り当てロジック）やTransmitter（転送方式）のアルゴリズムをGUIで切り替え。
- **コスト試算**: 実験実行前に必要なガスコストを自動計算し、ウォレット残高との照合を行います。

### 4\. 💰 エコノミー & アカウント管理 (Economy)

- **Webウォレット**: シェルスクリプトでの鍵管理を廃止。ブラウザ上でアカウントを作成・保存し、チェーンに登録。
- **Faucet**: 開発用トークンをワンタップで補充。
- **Watchdog**: リレーヤー（Relayer）の残高を監視し、枯渇しそうな場合に自動でFaucetを実行してIBCの停止を防ぎます。

### 5\. 📚 ライブラリ & 分析 (Library)

- **実験ログ**: 過去の実験結果を自動でDB（IndexedDB/LocalStorage）に保存。
- **データエクスポート**: 実験結果、スループット、レイテンシなどのメトリクスをCSV/JSON形式で出力し、論文作成や分析に活用可能。

## 🛠️ 技術スタック (Tech Stack)

本プロジェクトは、パフォーマンスと開発体験を重視したモダンなスタックで構成されています。

- **Core**: React 18, TypeScript, Vite
- **State Management**: Zustand (Global Store), React Context
- **Styling**: Tailwind CSS
- **API Simulation**: MSW (Mock Service Worker) - バックエンド未接続時でも完全な動作検証が可能
- **Visualization**: Recharts (グラフ), Custom SVG Components (トポロジー)

## ⚡ 開始方法 (Getting Started)

### 前提条件

- Node.js (v18以上推奨)
- Yarn

### インストール & 起動

リポジトリをクローンし、依存関係をインストールします。

```bash
git clone <repository-url>
cd raidchain-webui
yarn install
```

開発サーバーを起動します。現在はMSW（Mock Service Worker）が有効化されており、バックエンドのRaidChainノードが起動していない状態でも、ブラウザ上で全てのUI機能を体験・開発することができます。

```bash
yarn dev
```

ブラウザで `http://localhost:3000` にアクセスしてください。

## 📂 ディレクトリ構成

```
src/
├── app/            # アプリケーションのエントリーポイントとルーティング
├── entities/       # ドメインモデル (Account, Node, Result, Scenario...)
├── features/       # ユースケース機能 (DeploymentControl, ExperimentConfig...)
├── pages/          # 各ページコンポーネント (Monitoring, Deployment, Experiment...)
├── shared/         # 共有ロジック, UIコンポーネント, 定数, Mock定義
└── widgets/        # 複合UIコンポーネント (Sidebar, Header, Layout)
```

## 🤝 コントリビューション

現在のフェーズは「従来のCLI環境からの完全移行」を目指したリファクタリング段階です。
特に以下の領域での貢献を歓迎します。

1.  **API Integration**: 現在Mockで動作している部分の、実際のGo製バックエンド/Kubernetes APIへの接続実装。
2.  **Scenario Expansion**: 新しい実験戦略（Allocator/Transmitter）のUIサポート追加。

## 📜 License

[License Name] - Copyright (c) 2025 RaidChain Project
