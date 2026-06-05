export function renderPage(): string {
  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>CSV Cleaner Worker</title>
    <style>
      :root { color-scheme: light; font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      body { margin: 0; background: #f6f8fb; color: #172033; }
      main { max-width: 960px; margin: 0 auto; padding: 48px 20px; }
      .hero { background: linear-gradient(135deg, #2557d6, #0f766e); color: white; border-radius: 28px; padding: 40px; box-shadow: 0 24px 80px rgba(37, 87, 214, 0.25); }
      .badge { display: inline-flex; gap: 8px; align-items: center; padding: 6px 12px; border-radius: 999px; background: rgba(255,255,255,0.16); font-size: 14px; }
      h1 { margin: 20px 0 12px; font-size: clamp(32px, 6vw, 56px); line-height: 1.05; }
      p { line-height: 1.7; }
      .panel { margin-top: 24px; background: white; border: 1px solid #e5eaf3; border-radius: 22px; padding: 28px; box-shadow: 0 12px 40px rgba(23, 32, 51, 0.08); }
      .upload { border: 2px dashed #b8c4d9; border-radius: 18px; padding: 28px; text-align: center; background: #fbfcff; }
      input[type="file"] { margin-top: 16px; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-top: 20px; }
      .card { background: #f8fafc; border-radius: 16px; padding: 18px; border: 1px solid #edf1f7; }
      .note { color: #526070; font-size: 14px; }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <span class="badge">Cloudflare Workers + TypeScript</span>
        <h1>CSV整形作業を、軽量なWebツールの土台へ。</h1>
        <p>csv-cleaner-worker は、CSVの空白トリム・日付形式統一・金額表記の正規化などを想定したポートフォリオ向け初期実装です。ファイルは永続保存しない設計方針です。</p>
      </section>

      <section class="panel" aria-labelledby="upload-title">
        <h2 id="upload-title">CSVアップロード欄（UI土台）</h2>
        <div class="upload">
          <strong>CSVファイルを選択</strong>
          <p class="note">現時点では画面土台です。今後、ブラウザ上でプレビュー・加工・ダウンロードできる構成を想定しています。</p>
          <input type="file" accept=".csv,text/csv" />
        </div>

        <div class="grid">
          <div class="card"><strong>分離された処理</strong><p class="note">CSVのパース、加工、検証、出力を src/csv に分割しています。</p></div>
          <div class="card"><strong>警告ベースの設計</strong><p class="note">不正値で即停止せず、可能な範囲で処理し警告を返す方針です。</p></div>
          <div class="card"><strong>サンプルCSV</strong><p class="note">売上・勤怠データを samples 配下に配置し、確認やテストに使いやすくしています。</p></div>
        </div>
      </section>
    </main>
  </body>
</html>`;
}
