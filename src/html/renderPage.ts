export function renderPage(): string {
  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>CSV整形ワークベンチ</title>
    <style>
      :root { color-scheme: light; font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      * { box-sizing: border-box; }
      body { margin: 0; background: #f6f8fb; color: #172033; }
      main { max-width: 1080px; margin: 0 auto; padding: 48px 20px; }
      .hero { background: linear-gradient(135deg, #2557d6, #0f766e); color: white; border-radius: 28px; padding: 40px; box-shadow: 0 24px 80px rgba(37, 87, 214, 0.25); }
      .badge { display: inline-flex; gap: 8px; align-items: center; padding: 6px 12px; border-radius: 999px; background: rgba(255,255,255,0.16); font-size: 14px; }
      h1 { margin: 20px 0 12px; font-size: clamp(32px, 6vw, 56px); line-height: 1.05; }
      h2, h3 { color: #172033; }
      p { line-height: 1.7; }
      button { appearance: none; border: 0; border-radius: 12px; padding: 12px 18px; font-weight: 700; cursor: pointer; transition: transform 0.15s ease, opacity 0.15s ease, background 0.15s ease; }
      button:hover:not(:disabled) { transform: translateY(-1px); }
      button:disabled { cursor: not-allowed; opacity: 0.55; }
      .panel { margin-top: 24px; background: white; border: 1px solid #e5eaf3; border-radius: 22px; padding: 28px; box-shadow: 0 12px 40px rgba(23, 32, 51, 0.08); }
      .upload { border: 2px dashed #b8c4d9; border-radius: 18px; padding: 28px; background: #fbfcff; }
      .upload-controls { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin-top: 18px; }
      input[type="file"], select { width: min(100%, 440px); padding: 10px; border: 1px solid #d7deea; border-radius: 12px; background: white; }
      .settings { margin-top: 22px; padding-top: 20px; border-top: 1px solid #e5eaf3; }
      .settings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-top: 12px; }
      .field { display: flex; flex-direction: column; gap: 8px; }
      .field label { font-weight: 700; color: #243047; }
      .primary-button { background: #2557d6; color: white; }
      .secondary-button { background: #e8eefb; color: #163b91; }
      .result-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 18px; margin-top: 22px; }
      .result-card { min-width: 0; background: #f8fafc; border-radius: 16px; padding: 18px; border: 1px solid #edf1f7; }
      .result-card h3 { display: flex; justify-content: space-between; gap: 12px; margin: 0 0 12px; font-size: 18px; }
      pre { min-height: 180px; max-height: 420px; overflow: auto; white-space: pre-wrap; word-break: break-word; margin: 0; padding: 16px; border-radius: 14px; background: #0f172a; color: #e2e8f0; font-size: 13px; line-height: 1.6; }
      .note { color: #526070; font-size: 14px; }
      .status { margin-top: 16px; padding: 12px 14px; border-radius: 14px; font-weight: 700; }
      .status:empty { display: none; }
      .status.info { background: #e8f1ff; color: #1848a7; }
      .status.error { background: #fee2e2; color: #991b1b; }
      .warnings { margin: 14px 0 0; padding-left: 22px; color: #7c2d12; }
      .warning-empty { margin-top: 14px; color: #166534; font-weight: 700; }
      .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-top: 20px; }
      .feature-card { background: #f8fafc; border-radius: 16px; padding: 18px; border: 1px solid #edf1f7; }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <span class="badge">CSV Cleaner / Cloudflare Workers</span>
        <h1>CSV整形ワークベンチ</h1>
        <p>CSVの空白・日付・金額表記を、ブラウザ上で手早く整形できます。<br />選択したCSVはサーバーに保存せず、その場で加工結果と警告を確認できます。</p>
      </section>

      <section class="panel" aria-labelledby="upload-title">
        <h2 id="upload-title">CSVを加工する</h2>
        <div class="upload">
          <strong>CSVファイルを選択</strong>
          <p class="note">1MBまでのCSVを選択し、「CSVを加工する」を押してください。加工前・加工後CSVと警告一覧を画面で確認できます。</p>
          <div class="upload-controls">
            <input id="csv-file" type="file" accept=".csv,text/csv" />
            <button id="clean-button" class="primary-button" type="button" disabled>CSVを加工する</button>
            <button id="download-button" class="secondary-button" type="button" disabled>加工後CSVをダウンロード</button>
          </div>
          <section class="settings" aria-labelledby="settings-title">
            <h3 id="settings-title">加工設定</h3>
            <div class="settings-grid">
              <div class="field">
                <label for="date-format">日付形式</label>
                <select id="date-format">
                  <option value="yyyy/MM/dd" selected>yyyy/MM/dd</option>
                  <option value="yyyy-MM-dd">yyyy-MM-dd</option>
                  <option value="yyyyMMdd">yyyyMMdd</option>
                </select>
              </div>
              <div class="field">
                <label for="amount-format">金額形式</label>
                <select id="amount-format">
                  <option value="plain" selected>カンマなし（例: 12000）</option>
                  <option value="comma">カンマあり（例: 12,000）</option>
                </select>
              </div>
            </div>
          </section>
          <div id="status" class="status" role="status" aria-live="polite"></div>
        </div>

        <div class="result-grid">
          <article class="result-card">
            <h3>加工前CSV</h3>
            <pre id="input-preview">CSVファイルを選択するとここに表示されます。</pre>
          </article>
          <article class="result-card">
            <h3>加工後CSV</h3>
            <pre id="output-preview">加工結果はここに表示されます。</pre>
          </article>
        </div>

        <section class="result-card" aria-labelledby="warnings-title" style="margin-top: 18px;">
          <h3 id="warnings-title">警告一覧</h3>
          <div id="warnings-output" class="warning-empty">警告はありません</div>
        </section>

        <div class="feature-grid">
          <div class="feature-card"><strong>分離された処理</strong><p class="note">CSVのパース、加工、検証、出力を src/csv に分割しています。</p></div>
          <div class="feature-card"><strong>警告ベースの設計</strong><p class="note">不正値で即停止せず、可能な範囲で処理し警告を返す方針です。</p></div>
          <div class="feature-card"><strong>ダウンロード対応</strong><p class="note">加工結果はブラウザ上で cleaned.csv として保存できます。</p></div>
        </div>
      </section>
    </main>

    <script>
      const fileInput = document.getElementById('csv-file');
      const cleanButton = document.getElementById('clean-button');
      const downloadButton = document.getElementById('download-button');
      const dateFormatSelect = document.getElementById('date-format');
      const amountFormatSelect = document.getElementById('amount-format');
      const inputPreview = document.getElementById('input-preview');
      const outputPreview = document.getElementById('output-preview');
      const warningsOutput = document.getElementById('warnings-output');
      const statusOutput = document.getElementById('status');
      let selectedCsv = '';
      let cleanedCsv = '';
      let downloadUrl = '';

      fileInput.addEventListener('change', async () => {
        resetResult();
        const file = fileInput.files && fileInput.files[0];
        if (!file) {
          selectedCsv = '';
          cleanButton.disabled = true;
          inputPreview.textContent = 'CSVファイルを選択するとここに表示されます。';
          setStatus('', 'info');
          return;
        }

        setStatus('CSVファイルを読み込んでいます...', 'info');
        try {
          selectedCsv = await file.text();
          inputPreview.textContent = selectedCsv || '選択されたCSVは空です。';
          cleanButton.disabled = selectedCsv.length === 0;
          setStatus('CSVファイルを読み込みました。', 'info');
        } catch (error) {
          selectedCsv = '';
          cleanButton.disabled = true;
          inputPreview.textContent = 'CSVファイルを読み込めませんでした。';
          setStatus('CSVファイルの読み込みに失敗しました。別のファイルを選択してください。', 'error');
        }
      });

      cleanButton.addEventListener('click', async () => {
        if (!selectedCsv) {
          setStatus('CSVファイルを選択してください。', 'error');
          return;
        }

        cleanButton.disabled = true;
        downloadButton.disabled = true;
        outputPreview.textContent = '加工中です...';
        renderWarnings([]);
        setStatus('CSVを加工しています...', 'info');

        try {
          const response = await fetch('/api/clean', {
            method: 'POST',
            headers: { 'content-type': 'application/json; charset=utf-8' },
            body: JSON.stringify({
              csv: selectedCsv,
              options: {
                dateFormat: dateFormatSelect.value,
                amountFormat: amountFormatSelect.value,
              },
            }),
          });
          const result = await response.json();

          if (!response.ok || result.error) {
            throw new Error(result.error || 'CSVの加工に失敗しました。');
          }

          cleanedCsv = result.csv || '';
          outputPreview.textContent = cleanedCsv || '加工後CSVは空です。';
          renderWarnings(Array.isArray(result.warnings) ? result.warnings : []);
          prepareDownload(cleanedCsv);
          setStatus('CSVの加工が完了しました。', 'info');
        } catch (error) {
          cleanedCsv = '';
          outputPreview.textContent = '加工結果はここに表示されます。';
          revokeDownloadUrl();
          const message = error instanceof Error ? error.message : 'CSVの加工中に予期しないエラーが発生しました。';
          setStatus(message, 'error');
        } finally {
          cleanButton.disabled = selectedCsv.length === 0;
        }
      });

      downloadButton.addEventListener('click', () => {
        if (!downloadUrl) {
          return;
        }

        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'cleaned.csv';
        document.body.appendChild(link);
        link.click();
        link.remove();
      });

      function resetResult() {
        cleanedCsv = '';
        outputPreview.textContent = '加工結果はここに表示されます。';
        renderWarnings([]);
        revokeDownloadUrl();
      }

      function renderWarnings(warnings) {
        warningsOutput.innerHTML = '';
        if (warnings.length === 0) {
          warningsOutput.className = 'warning-empty';
          warningsOutput.textContent = '警告はありません';
          return;
        }

        warningsOutput.className = '';
        const list = document.createElement('ul');
        list.className = 'warnings';
        warnings.forEach((warning) => {
          const item = document.createElement('li');
          item.textContent = warning;
          list.appendChild(item);
        });
        warningsOutput.appendChild(list);
      }

      function prepareDownload(csv) {
        revokeDownloadUrl();
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        downloadUrl = URL.createObjectURL(blob);
        downloadButton.disabled = false;
      }

      function revokeDownloadUrl() {
        if (downloadUrl) {
          URL.revokeObjectURL(downloadUrl);
          downloadUrl = '';
        }
        downloadButton.disabled = true;
      }

      function setStatus(message, type) {
        statusOutput.textContent = message;
        statusOutput.className = message ? 'status ' + type : 'status';
      }
    </script>
  </body>
</html>`;
}
