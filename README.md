# csv-cleaner-worker

Cloudflare Workers + TypeScript で構築する、CSV加工ツールの初期リポジトリです。

このリポジトリは、CSVの整形・検証・出力を小さなWebツールとして扱うための土台を整理したものです。現時点では、実務用途を意識したフォルダ構成、設計ドキュメント、サンプルCSV、最低限のWorker実装を優先しています。

## プロジェクト概要

`csv-cleaner-worker` は、業務でよく発生するCSVの表記ゆれや形式違いを、ブラウザ上で扱いやすくすることを想定したポートフォリオ向けプロジェクトです。

初期実装では次の点を重視しています。

- Cloudflare Workers 上で起動できる最小構成
- UI、HTTPハンドラ、CSV加工ロジックを分離した構成
- 売上・勤怠CSVを使った動作確認や将来のテストを想定したサンプル配置
- CSVを永続保存しない設計方針
- 未実装機能を作り込みすぎず、今後拡張しやすい土台を整えること

## 何を解決するツールか

現場では、CSVデータをそのまま集計・会計・勤怠管理・EC運用などに使えないケースがあります。

例として、次のような作業を想定しています。

- セル前後の空白を取り除く
- 日付表記を `YYYY-MM-DD` にそろえる
- `¥12,000` のような金額表記を扱いやすい数値文字列へ変換する
- 不正な日付、金額、時刻などを警告として検出する
- 加工後のCSVをダウンロードできるようにする

現時点では、これらのうち一部の簡易ロジックと構成の土台を実装しています。UI上での本格的な加工・プレビュー・ダウンロードは今後の拡張予定です。

## 主な機能

### 実装済みの土台

- `GET /` でツール概要とCSVアップロード欄のHTMLを表示
- `POST /api/clean` でCSV文字列を受け取り、簡易加工結果と警告をJSONで返すAPI土台
- CSV文字列のパース処理
- 空白トリム、日付形式統一、金額表記正規化の簡易加工
- 重複ヘッダー、不正な日付・金額らしき値の警告検出
- 加工後データをCSV文字列へ戻す処理

### 今後の実装予定・設計方針

- ブラウザ上でのCSVプレビュー
- 加工ルールの選択UI
- 加工結果の差分表示
- 加工済みCSVのダウンロード
- サンプルCSVを使った自動テスト
- Shift_JISなど文字コード対応の検討
- ファイルサイズ制限や入力バリデーションの強化

## 技術構成

| 項目 | 内容 |
|---|---|
| Runtime | Cloudflare Workers |
| Language | TypeScript |
| Storage | なし（CSVは永続保存しない方針） |
| UI | Workerから返すHTML |
| Test | 現時点ではテストケース置き場のみ。導入時は最小構成を想定 |

## フォルダ構成

```text
csv-cleaner-worker/
├── README.md
├── docs/
│   └── basic_design.md
├── samples/
│   ├── sample_sales_dirty.csv
│   ├── sample_sales_expected.csv
│   ├── sample_attendance_dirty.csv
│   └── sample_attendance_expected.csv
├── src/
│   ├── index.ts
│   ├── csv/
│   │   ├── parseCsv.ts
│   │   ├── transformCsv.ts
│   │   ├── validateCsv.ts
│   │   └── buildCsv.ts
│   └── html/
│       └── renderPage.ts
├── tests/
│   ├── transformCsv.cases.ts
│   └── validateCsv.cases.ts
├── package.json
├── tsconfig.json
├── wrangler.toml
└── .gitignore
```

## サンプルCSVの説明

`samples/` 配下には、動作確認や将来の自動テストで使うCSVを配置しています。

| ファイル | 用途 |
|---|---|
| `sample_sales_dirty.csv` | 売上データの加工前サンプル |
| `sample_sales_expected.csv` | 売上データの期待結果サンプル |
| `sample_attendance_dirty.csv` | 勤怠データの加工前サンプル |
| `sample_attendance_expected.csv` | 勤怠データの期待結果サンプル |

これらは、CSV加工ルールの検討、テストケース作成、README上での説明に使う想定です。

## ローカル実行方法

> 注意: この初期整理では、依存関係のインストールや lockfile の作成は行っていません。

Cloudflare Workers の開発環境が整っている場合は、次のコマンドで起動する想定です。

```bash
npm run dev
```

起動後、ブラウザでローカルのWorker URLにアクセスすると、`GET /` のHTMLページを確認できます。

## デプロイ方法

Cloudflare アカウントおよび Wrangler の認証設定が完了している場合、次のコマンドでデプロイする想定です。

```bash
npm run deploy
```

`wrangler.toml` では Worker 名を `csv-cleaner-worker` に設定しています。D1、KV、R2などの外部ストレージ設定は追加していません。

## テストについて

`tests/` 配下には、今後のテスト実装に向けた予定テストケース置き場を用意しています。現時点では `.cases.ts` として配置し、実行可能なテストファイルとは区別しています。

現時点ではテストフレームワークを追加していないため、`npm run test` はテストランナー未導入であることを表示するだけの最小スクリプトです。導入する場合は、Cloudflare Workers + TypeScript と相性のよい最小構成として Vitest や Cloudflare Workers 向け公式テストツールの採用を検討します。

## 今後の拡張予定

- CSVアップロード後のプレビュー表示
- 加工ルールをUIから選択する機能
- 日付、金額、時刻、空白、全角半角などの正規化ルール拡張
- 警告一覧の画面表示
- 加工済みCSVのダウンロード
- サンプルCSVを使った自動テスト
- 入力ファイルサイズやMIME typeのチェック
- READMEやdocsに利用例・設計判断を追記

## ポートフォリオとして意識した点

- **実務課題に近いテーマ**: 売上・勤怠など、業務で扱いやすいCSV加工を題材にしています。
- **責務分離**: WorkerのHTTPハンドラ、HTML描画、CSV加工処理を分け、拡張しやすい構成にしています。
- **サンプルと期待結果**: dirty / expected のCSVを用意し、将来のテストやデモに使える形にしています。
- **永続保存しない方針**: CSVを外部ストレージへ保存しない設計にし、軽量な一時処理ツールとして整理しています。
- **未実装範囲の明示**: READMEでは、現時点の実装と今後の予定を分けて記載しています。
