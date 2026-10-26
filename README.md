# Nicole the Astrorium Arpeggio v1.1.4

旧称：Nicole the Astrorium for Chrome。PC用のオフラインPresenter/ProjectorとiPad用の一画面モードを備えています。

## iPad一画面プラネタリウム（追加モード）

GitHub Pages のトップ（index.html）からアクセスすると、**iPadは ipad.html、PC/Macは従来の presenter.html** を自動で開きます。PC用Presenter/Projectorの画面・操作は変更していません。

iPad版では、星空を一本指でドラッグ、二本指でピンチズーム、天体をタップして星座・天体の案内を表示。星座案内から星座線・星座絵・星座名を個別にON/OFFできます。**縦向きは上2/3に星空・下1/3に常設コンソール**、横向きは従来どおりの全面星空UIです。天体検索、時刻再生、レイヤー切り替え、テーマ鑑賞、星カタログ取り込みにも対応します。

自動判定を変更したい場合は `index.html?mode=desktop` または `index.html?mode=ipad` を指定します。選択はブラウザ内に記憶され、`index.html?mode=auto` で自動判定に戻せます。iPad側の「データ」とPC側の「設定」からも切り替え可能です。詳しくは [IPAD-MODE.md](./IPAD-MODE.md) を参照してください。

**実機iPadOS Safari/PWAテストは未実施**です。

---


## 起動方法（インストール・サーバー不要）
- **Windows**: `START-Windows.bat` をダブルクリック（または `index.html` をChromeで開く）
- **Mac**: `START-Mac.command` をダブルクリック（初回は control+クリック →「開く」）。または `index.html` をChromeで開く
- どちらも **Google Chrome** が対象。ZIPは展開してから使うこと。

## v1.1.4 の変更点
- **アイコンを新しくした**：Nicole the Astrorium のアプリ版（v2 系・青）や v1 系（緑）と見分けやすいよう、紫の空に、両端に恒星球のあるダンベル形の投影機を描いたアイコンにした（`icon-180.png`・`icon-192.png`・`icon-512.png`・`nicole2_icon.png`）。
- 表示上の版を v1.1.4 に、Service Worker のキャッシュ名を更新（インストール済みの PWA も新しいアイコンを取り直す）。

## v1.1.3 の変更点
- **PC版「アプリを終了」の改善**: ブラウザは、スクリプトで開いたウィンドウ以外のタブをページ側から閉じることを許さないため、ブックマークや既存のタブから開いた解説員画面は「アプリを終了」を押しても閉じなかった。
  - 観客画面はこれまでどおり閉じる。解説員画面が閉じられなかった場合は「終了しました」と表示し、⌘W（Windows は Ctrl+W）で閉じるよう案内する。「解説員画面に戻る」で元の画面に戻れる。
  - インストールしたPWAのウィンドウなど、閉じられる場合はこれまでどおり自動で閉じる。
- 表示上の版を v1.1.3 に、Service Worker のキャッシュ名を更新。
- Service Worker が新しい版を入れるとき、ブラウザのキャッシュ（GitHub Pages は10分）ではなくサーバーから取り直すようにした（版を上げた直後に古いファイルが新しいキャッシュに入るのを防ぐ）。
- 確認はローカル配信のChromium（閉じられない状態を模擬）のみ。**Chrome実機は未確認**。

## v1.1.2 の変更点
- **iPadモードの不具合修正**: 「案内表示を一括消去」の後、表示タブの星座線・星座絵・星座名のON/OFFが効かなくなっていた問題を修正。
  - 一括消去は、案内で個別にON/OFFした設定を取り消し、表示タブの設定に従う状態に戻すようにした。
  - 表示タブの星座線・星座絵・星座名を切り替えると、その種類の個別設定を取り消して表示タブの設定を優先する（旧版で一括消去した状態が保存されていても、切り替えれば直る）。テーマ「星座」と「星空めぐり」も同様。
  - 表示タブでOFFにすると、案内で個別に表示していた星座のその種類も消える。
- `version.json` の `name` を旧称「Nicole the Astrorium for Chrome」から「Nicole the Astrorium Arpeggio」に変更。簡易マニュアルの対象表記も同様。
- 表示上の版を v1.1.2 に、Service Worker のキャッシュ名を更新。
- PC用Presenter/Projectorの画面・操作・通信（SceneState v2 / `astrorium-live-v0150`）は変更なし。
- 確認はローカル配信のChromium（iPadサイズ 820×1180）のみ。**iPad実機は未確認**。

## v1.1.1 の変更点
- 同梱の共通天文DBを **Nicole Astronomy Database v0.4.0** に更新（`database/db-bundle.js` と `database/data/` を差し替え）。
  - 278天体（星座88・恒星64・惑星7・深宇宙119）の解説を拡充（概要・物語・天文学的な見どころ・最新の観測・神話・観測のポイント・歴史）。
  - へび座・へびつかい座の星座線を星を共有する形に修正（全722線分）、へび座の星座絵の配置を更新。
- 表示上の版を v1.1.1 に、Service Worker のキャッシュ名を更新（インストール済みPWAも新しいDBに入れ替わる）。
- 画面・操作・Presenter–Projector通信（SceneState v2 / `astrorium-live-v0150`）は変更なし。

## v1.1.0 の変更点
- **オーロラ表現を全面刷新**: 高度約100kmの「光のカーテン」を物理モデルで遠近投影。数百本の光線が磁気天頂へ収束し、下端が鋭く明るい、本物の見え方に。
  - 観測緯度に連動: 高緯度（緑のカーテン・天頂まで）／中緯度（緑＋赤い上端）／日本など低緯度（深紅の柱）。南半球は南の空に出現。
  - 時間変化: カーテンのひだ・明るさのむら・脈動が常に流れる。複数のカーテンが重なる。
  - 昼間・薄明では見えません（太陽高度に連動）。「昼光」をOFFにすると確認できます。強さスライダー(25〜200%)も有効。
  - 全天(allsky)表示・プレビューにも対応。高解像度では描画量を自動調整。

## v1.0.0 の変更点（v0.15.5からのオフライン／Chrome対応化）
- **完全オフライン動作**: 外部通信を全廃（エンジン側でも http/https への取得を遮断）。
- **ローカルサーバー不要**: ES Module / fetch を廃止し、`index.html` を直接開くだけで動作（file://対応）。DBは `database/db-bundle.js`、星座絵は `assets/art-data.js`（WebP埋め込み）に同梱。
- **Safari依存を除去**: Mac専用のSafari起動・AppleScript終了処理・Python簡易サーバーを削除。
- **観測地点**: オンライン地図/住所検索を、同梱の地名リスト（日本47都道府県庁所在地ほか世界主要都市・天文台）＋緯度経度の直接入力＋簡易世界グリッド地図に置換。
- **流星群**: 主要11群を内蔵（年ごとの活動期間で表示）。
- **彗星**: 軌道データが外部サービス依存だったため、オフライン版では非表示。
- **共通解説Editor**: オンライン専用のため、オフライン版では案内ページを表示。

## 星カタログ（約8等星まで）について
同梱DBの恒星は主要星のみです。細かい星空にするには、オンライン環境で一度だけ d3-celestial の `stars.8.json` を入手し、設定メニュー「星カタログを取り込む」から選択してください。ブラウザ内に保存され、以後は完全オフラインで使えます（Projectorにも自動で反映）。

## 既知の制約
- Chrome以外・Chromeの別プロファイル間では、保存データ（メディア/星カタログ/お気に入り地点）は共有されません。
- 「現在地」取得はOSの測位に依存し、オフラインでは失敗することがあります（地名検索か緯度経度入力を使用）。

---

# Nicole the Astrorium v0.15.5

## v0.15.5 — 一般表示パネル整理 / 黄道12星座一括切替

- 「星空ガイド」を「星座」へ名称変更。
- 「天の川」を「深宇宙・彗星」へ移動。
- 「星座」に「黄道12星座」を追加。
- 「黄道12星座」は、牡羊座・牡牛座・双子座・蟹座・獅子座・乙女座・天秤座・蠍座・射手座・山羊座・水瓶座・魚座の **星座名・星座線・星座絵** を一斉にON/OFFする。
- 個別星座の状態は従来どおり「個別表示」で上書き可能。

## v0.15.4 — Presenterメニュー / 日時操作の再配置

- 上部メニューの「星座を編集」「共通解説を編集」「レイアウトを初期化」「DB更新を確認」を **「設定」** にまとめ、折りたたみメニュー化。
- 「場所を移動」を上部メニューから下部の日時操作パネルへ移動。
- 下部の「日時設定」の横に **「現在時刻」「日の出」「日の入り」「月の出」「月の入り」** を追加。
- 日の出・日の入り・月の出・月の入りは、現在の観測地点と選択中の日付から計算し、その時刻へ直接移動する。
- Nicole Astronomy Database v0.3.3、共通解説の正本Editor一本化、Presenter–Projector通信仕様は変更なし。


## v0.15.2 — Safari起動ホットフィックス

- ルート `index.html` を追加し、`http://127.0.0.1:8000/` から `presenter.html` へ自動遷移。
- `START.command` を追加。ダブルクリックするとパッケージ自身のフォルダでローカルHTTPサーバーを起動し、Safariを開く。
- v0.15.1の共通解説所有権ルール、Nicole Astronomy Database v0.3.3、描画・Projector機能は変更なし。

### 推奨起動方法

1. ZIPを展開。
2. `START.command` をダブルクリック。
3. 初回にmacOSが確認する場合は、Finderでcontrol+クリック →「開く」。

手動起動する場合は、このフォルダで `python3 -m http.server 8000` を実行し、`http://127.0.0.1:8000/` を開く。

## v0.15.2 — 共通解説の編集経路を正本Editorへ一本化

- 共通天文DBを **Nicole Astronomy Database v0.3.3** に更新し、LOCAL-first運用を維持。
- 星座・恒星・惑星・Deep Skyの共通解説は **Nicole Astronomy Database Editor** のみを編集経路とする。
- Presenter上部の「共通解説を編集」、および選択天体カード内の「共通解説を編集」から、GitHub Pages上のNicole Astronomy Database Editorを開く。
- 星座 / 恒星 / 惑星 / Deep Skyを選択中の場合は、Editorへ `kind` と `id` を渡して対象天体を直接開く。
- Astrorium内の旧ローカル解説差分はランタイムへ適用しない。正本DBの解説を常に表示する。
- 旧ローカル解説差分が残っている場合、正式Editorを開く際にバックアップJSONとして書き出せる移行導線を残す。
- 同梱DBから旧 `description-editor.html` / `description-editor.js` を除外し、Astrorium内部に第二の共通解説Editorを持たない。
- 星座線・星座絵・配置の専門編集は従来通りAstroriumで行う。ただし、その編集結果はNicole Astronomy Databaseへ正式昇格するまで共通DBの正本ではない。
- realtime channel / localStorage fallback keyなど、v0.15.0のPresenter–Projector通信境界は変更しない。

### 共通解説の正式な更新経路

```text
Nicole the Astrorium
  ↓ 「共通解説を編集」
Nicole Astronomy Database Editor
  ↓ 編集・確認
正式DB更新パッケージ
  ↓ GitHubへレビュー反映
Nicole Astronomy Database
  ↓ 各アプリが正式DB版を採用
Nicole the Astrorium
```


## v0.15.0 — 操作カスタマイズ / 全天文字方向 / Nicole Astronomy Database 解説編集

- 「ショートカット一覧」を設定画面化し、各操作へ任意の物理キー/修飾キーを割り当て可能。設定はSafariのlocalStorageへ保存。
- MacBook向けの初期割当として I/K = 緯度 北/南、J/L = 経度 西/東を追加。視点移動と同様に押している間連続移動し、地点キー速度を設定可能。
- 全天表示では天頂を中心とした放射方向を「文字の下」として、星名・星座名・天体名・方位名などを円周側が下になるよう回転。
- Nicole Astronomy Database共通の `description-editor.html` を追加し、星座・恒星・深宇宙天体・惑星の解説をブラウザ内で編集可能。Presenter上部の「解説編集」から開く。
- Bundled Nicole Astronomy Database: v0.3.2。v0.3.1のAqr星座線修正を維持。


## v0.14.4 — Shared GPU Sky Renderer

Projector rendering now advances from a star-only WebGL path to a single shared GPU sky renderer. The implementation deliberately keeps one persistent WebGL context so that Safari does not need a separate context for every sky layer.

GPU-rendered Projector components:

- stars (B−V / display color and FOV LOD retained)
- Milky Way
- atmospheric daylight / moonlight glow
- constellation art
- meteor streaks
- natural Deep Sky appearance layer

The normal Canvas renderer remains the fallback if WebGL cannot be initialized or the context is lost.

## Natural Deep Sky

A new `肉眼・双眼鏡天体` toggle is available under `深宇宙・彗星`. It is ON by default and is independent from the existing catalog-marker `主要天体` toggle.

The layer uses bright objects in the bundled Nicole Astronomy Database and reproduces them as faint extended objects according to angular size and object class. This includes objects such as M31, M42, M45, M44, M7, M33 and other bright Messier / major objects. Large and Small Magellanic Clouds, Omega Centauri and 47 Tucanae are included as supplemental projection objects until they are formally added to the common database.

This is an observing-oriented visual approximation rather than calibrated surface photometry. Real visibility depends strongly on darkness, transparency, dark adaptation and optical aid.

## Database

Bundled Nicole Astronomy Database: v0.3.2.

## Testing note

Mac + Safari + external-projector dual-screen testing was not performed in the build environment.


## v0.14.4
- Projector GPU constellation-art vertical-orientation regression fixed.
- Projector adaptive resolution now preserves native CSS-pixel resolution and only reduces HiDPI supersampling.
- Faster recovery from temporary adaptive-quality reductions.
