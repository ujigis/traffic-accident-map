# 全国交通事故マップ（試作版）

警察庁「交通統計情報のオープンデータ」（本票）2019〜2025年・約218万件を、MapLibre GL JS + PMTiles で表示する静的WebGISです。サーバ不要。

## 構成
- `docs/` 公開用サイト本体（index.html, app.js, style.css, lib/, data/）
- `pipeline/` データ作成スクリプト（prep → codebook → mesh → core → tiles の順）
- `.github/workflows/pages.yml` GitHub Pages への自動公開

## データ（docs/data/）
| ファイル | 内容 | 目安 |
|---|---|---|
| mesh.pmtiles | 3次メッシュ集計（ズーム3〜10、全国ヒートマップ用） | 2MB |
| core.pmtiles | 全期間の点（ズーム11〜14、絞り込み・表示用） | 67MB |
| acc_2019〜2025.pmtiles | 年別の全項目（クリック時の詳細用） | 各26〜32MB |
| codebook.json | コード→名称 | 小 |

すべて1ファイル100MB未満なので、GitHub無料プランでそのままpushできます（50MB超は警告が出ますが可）。
`data_only` の中身を `docs/data/` に入れてください。リポジトリ全体は約260MB。

## 公開手順
1. GitHubで新規リポジトリ（Public）を作成
2. このフォルダの中身をpush（`docs/data/` のpmtilesを含める）
3. Settings → Pages → Source を「GitHub Actions」に
4. push後、数分で `https://<ユーザー名>.github.io/<リポジトリ名>/` に公開

## ローカル確認
Range要求に対応した静的サーバが必要です（例: `npx http-server docs -p 8099 -c-1`）。`python -m http.server` はRange非対応のため不可。

## 再作成
`pipeline/` 内スクリプトのパスを環境に合わせ、tippecanoe（pip install tippecanoe）を使用。

## 注意
年は警察庁の統計年。人身事故のみ。出典：警察庁オープンデータを加工、背景地図：国土地理院・OpenStreetMap。
