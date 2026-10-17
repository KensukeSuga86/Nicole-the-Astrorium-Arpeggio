# Nicole the Astrorium Arpeggio — 第三者資料・データの出典（公開前監査草案）

提供者：KensukeSuga86

> **重要**：本書は確認済みの参照元と監査対象の一覧です。現段階で、すべてのデータについて再配布条件の調査・対応が完了したことを意味しません。参考資料として見ただけのものと、ファイルを取り込んだものを混同しないため、利用実態を確認します。

## A. 星座絵の参考資料

- アストロアーツ「星座八十八夜／88星座一覧」：https://www.astroarts.co.jp/alacarte/constl88/all-j.shtml
  - 用途：88星座の伝統的なモチーフ、姿勢、星座紹介を制作時に参考。
  - Nicoleのイラスト：ChatGPTを使い、提供者が制作・選定・調整した画像。
  - 状況：掲載図と完成画像の88点全件の視覚比較は完了していません。アストロアーツ掲載画像の複製・転載について許諾を取得したことを示すものではありません。

## B. 天文情報・データの出典（共通DBの記録に基づく）

| 提供元 | 主な用途 | 条件・監査状況 |
|---|---|---|
| NASA Science / NSSDC | 太陽系天体の物理情報、メシエ天体の解説参照 | 原資料ごとの規約・出典確認を継続 |
| IAU | 88星座の名称・枠組み | 事実情報と保護された表現を区別 |
| 国立天文台 | 日本語星座名等の参考 | 引用・転載の具体的範囲を確認 |
| SIMBAD / CDS | 恒星の照合対象 | 実際に取り込んだ項目と提供条件を確認 |
| Astronexus HYG Database | 恒星データの照合 | ライセンス・採用データ範囲の確認待ち |
| OpenNGC | 深宇宙天体のカタログ情報 | CC BY-SA 4.0。表示義務・改変内容・共有時の条件を要確認 |
| Hipparcos Planetarium Data Creator | 星座線用恒星座標CSV | 配布説明とGPLv2表記の整合性を要確認 |
| d3-celestial | 追加恒星カタログ等 | 元コード・データ別の適用条件の確認待ち |
| 天の川GeoJSON（sergio-dr / d3-celestial） | 天の川の表示 | 由来・個別ライセンス・組込有無の確認待ち |
| Open-Meteo Geocoding API | オンライン地名検索 | API利用条件・帰属表記・利用量制限を確認 |

### 参照先

- Nicole Astronomy Database（出典管理）：https://github.com/KensukeSuga86/Nicole-Astronomy-Database
- OpenNGC：https://github.com/mattiaverga/OpenNGC
- 星座線座標の配布元：https://github.com/creativival/hipparcos_planetarium_data_creator
- d3-celestial：https://github.com/ofrohn/d3-celestial
- Open-Meteo：https://open-meteo.com/

## C. 配布時の基本原則

1. Nicole独自のソフトウェア／コンテンツの利用条件は`LICENSE.md`に定めます。
2. 第三者が権利を有するデータやプログラムについて、提供者独自の「再配布禁止」条項でそのライセンス上の権利を取り消しません。
3. 必要な著作権・ライセンス表示、改変表示、ソース提供その他の義務は、実際の組み込み状況を確認して追加します。
4. 本書に挙げた参考文献の全てが、アプリにそのまま収録されていることを意味しません。

## D. 公開前の未完了事項

- [ ] `database/db-bundle.js` と各元資料のデータ項目の対応関係を照合
- [ ] `assets/hip_constellation_line_star.csv` の適用ライセンス確定
- [ ] OpenNGC由来のレコード・改変範囲とCC BY-SA 4.0の義務確認
- [ ] HYG・d3-celestial・天の川データの実際の取り込み範囲を調査
- [ ] 必要な各第三者著作権者のクレジットとライセンス全文／URLの掲載
- [ ] 星座絵の参考図との個別比較の記録

## お問い合わせ

ライセンス・出典についてのご連絡：[Arpeggio GitHub Issues](https://github.com/KensukeSuga86/Nicole-the-Astrorium-Arpeggio/issues)
