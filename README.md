# 🌌 RaidChain WebUI

**RaidChain WebUI**は、Cosmos SDKベースのモジュラーブロックチェーンシステム「**RaidChain**」の研究開発、実験、および運用を効率化するための統合管理コンソールです。

これまで`Ignite CLI`, `kubectl`, `shell script`を駆使して行われていた複雑なチェーン操作を、Feature Sliced Design (FSD) に基づくモダンなWebインターフェースに集約。ブロックチェーンのデプロイから、複雑なデータ転送実験のシナリオ作成、リアルタイムモニタリングまでをGUI完結させることを目的としています。

> **Note**: 現在、本プロジェクトは **MSW (Mock Service Worker)** を用いた完全なブラウザ内シミュレーションモードで動作します。バックエンドを用意することなく、すべての機能を体験・開発することが可能です。

## 📖 概要

RaidChain WebUIは、以下のコンポーネント群をオーケストレーションします。

1.  **Controlchain**: 統合管理ロジック
2.  **Metachain**: メタデータ管理
3.  **Datachain**: データ保存（負荷分散・スケーリング可能）

インフラ管理の複雑さを抽象化し、研究者が「実験シナリオの策定」と「結果の分析」に集中できる環境を提供します。

## ✨ 主な機能 (Features)

### 1. 🖥️ ネットワークモニタリング (Monitoring)

- **Block Feed**: Control/Meta/Data 全チェーンのブロック生成をリアルタイムにタイムライン表示。トランザクションの詳細確認も可能。
- **Topology Graph**: ノード間の接続とIBCパケットの流れをSVGアニメーションで可視化。
- **Mempool**: 各ノードの未処理トランザクション滞留状況を監視。

### 2. 🧪 実験シナリオビルダー (Experiment)

- **多重シナリオ生成**: データサイズやチャンクサイズを「範囲（Range）」で指定し、数百パターンの実験条件を一括生成。
- **Chain Selector**: 対象チェーンをGUIで選択、またはステップ実行の設定が可能。
- **File Tree Viewer**: アップロードされたZip/フォルダ構造を解析・可視化し、実験データとして利用。
- **コスト試算**: 実験実行前に必要なガスコストを自動計算し、ウォレット残高と照合。

### 3. 🚀 デプロイメント制御 (Deployment)

- **GUIビルド**: コンポーネントを選択し、Dockerイメージビルドをワンクリックで開始。ログはターミナル風UIでリアルタイム表示。
- **オートスケーリング**: スライダー操作でDatachainノード数を動的に増減（シミュレーション）。
- **環境リセット**: ワンクリックで全データを破棄し、クリーンな環境を再構築。

### 4. 💰 エコノミー & アカウント管理 (Economy)

- **Webウォレット**: アカウント作成、残高確認、秘密鍵の表示（セキュリティ保護付き）。
- **Faucet**: 開発用トークンをワンタップで補充。
- **Watchdog**: リレーヤー等のシステムアカウント残高を監視し、自動補充を実行。

### 5. 📚 ライブラリ & プリセット (Library & Preset)

- **結果分析**: 実験結果のスループット、レイテンシ、経済コストを表形式で確認・フィルタリング。詳細データをCSV/JSONでエクスポート。
- **プリセット管理**: 頻繁に使用する実験設定をテンプレートとして保存・共有。

## 🛠️ 技術スタック (Tech Stack)

- **Core**: React 19, TypeScript, Vite
- **State Management**: Zustand 5 (Global Store)
- **Architecture**: Feature Sliced Design (FSD)
- **Simulation**: MSW 2.0 (Mock Service Worker) - Browser Worker
- **UI/Styling**: Tailwind CSS, Lucide React, Recharts
- **Validation**: Zod

## ⚡ 開始方法 (Getting Started)

### インストール & 起動

リポジトリをクローンし、依存関係をインストールします。

```bash
git clone <repository-url>
cd raidchain-webui
yarn install
```

開発サーバーを起動します。

```bash
yarn dev
```

ブラウザで `http://localhost:3000` にアクセスしてください。MSWが起動し、自動的にシミュレーション環境がセットアップされます。

## 📂 ディレクトリ構成 (FSD)

```
src/
├── app/            # アプリケーションエントリー, Global Setup
├── entities/       # ドメインモデル (Account, Node, Scenario...)
├── features/       # ユースケースロジック (Experiment, Monitoring, Preset...)
├── pages/          # ページレイアウト (MonitoringPage, ExperimentPage...)
├── shared/         # 共有UI, Hooks, Mock, APIクライアント
└── widgets/        # 複合UIコンポーネント (Sidebar, Header, Layout)
```

## 📜 License

Copyright (c) 2025 RaidChain Project
