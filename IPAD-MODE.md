# iPad 一画面プラネタリウムモード

Nicole the Astrorium for Chrome v1.1.0 の星空エンジンをそのまま利用する、iPad向け一画面UIです。

## 起動と自動振り分け

GitHub Pages のリポジトリルート（index.html）へアクセスすると、以下のように自動的に遷移します。

- iPad（iPadOS、デスクトップサイト表示を含む）: ipad.html
- PC / Mac（従来のデスクトップ環境）: presenter.html

元の Presenter / Projector には変更を加えていません。

直接起動:
- iPad: ipad.html
- PC: presenter.html
- iPadから強制的にPC版: index.html?mode=pc
- PCからiPad版を試す: index.html?mode=ipad

端末判定は iPad のUA、またはiPadOSのデスクトップモードに該当する MacIntel && maxTouchPoints > 1 を使用します。iPhoneはiPad版への自動振り分け対象外です。

## iPadの操作

- 一本指ドラッグ: 視点の方位・高度を変更
- 二本指ピンチ: 視野角（拡大・縮小）を変更
- 星・月・惑星・星座をタップ: 名前と簡易解説を表示
- 画面下の時間・再生・現在・今夜・全天・表示ボタンから操作
- 右上の検索とメニュー: 天体検索、テーマ、レイヤー、日時・場所、星カタログ取り込み

テーマは「今夜の星空」「星座絵」「天の川」「月」「オーロラ」「星空めぐり」を用意しています。「星空めぐり」は約18秒ごとに対象星座を切り替えます。空を手動操作すると終了します。

## データとオフライン利用

- Nicole Astronomy Database v0.3.3を既存の database/db-bundle.js から読込
- 既存の engine.js、renderer-adapter.js、scene-state.js、星座絵バンドルを再利用
- iPadの日時・場所・レイヤー選択は localStorage の astrorium-ipad-mode-v1 に保存
- 約8等星を表示するには、stars.8.json を「データ」から取り込む。端末のIndexedDBへ保存
- Service Workerは ipad.html、ipad-app.js、bootstrap-ipad.js もアプリシェルとしてキャッシュ
- 最初のインストール／キャッシュ構築にはネット接続が必要。2回目以降のオフライン動作は端末側で確認すること

注意: iPadのホーム画面に追加したWebアプリとSafariブラウザでは、保存領域が共有されない場合があります。星カタログの取り込みは実際に使う起動方式で行ってください。

## 対応していないこと

- iPad版はPresenter/Projectorの2画面投影操作を置き換えるものではありません。
- オフラインChrome版と同じく、彗星のリアルタイム外部API取得は行いません。
- 地上景の円周魚眼実写取込は、現行Chrome v1.1.0には統合していません（Safari/WebCore本家とは開発系統が異なります）。
- 星座絵の専門編集・台本編集・高度な投影設定はPC版Presenterから使用してください。

## 検証

ソース互換を維持する方針で追加したiPadモードです。
**実機iPadOS Safari/PWAでの操作検証、オフライン復元試験、長時間GPU安定性試験は未実施**です。

推奨する実機試験:
1. iPadでリポジトリルートを開く → ipad.html に自動遷移
2. PCで同じURLを開く → presenter.html に自動遷移
3. ドラッグ/ピンチ/天体タップ
4. 天体検索/テーマ/時間移動/緯度経度
5. ホーム画面へ追加 → 再起動/オフライン起動
6. 星カタログの再起動後保持
7. 長時間起動・回転・メモリ負荷
