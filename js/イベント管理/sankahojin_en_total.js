/**
 * @overview
 * テーブル内の法人名を抽出し、複数行テキストフィールドに自動で転記するカスタマイズです。
 *
 * @description
 * レコード内にある「参加法人リスト」テーブルに入力された各行の「法人名」をすべて取得し、
 * 改行区切りの一つの文字列にまとめます。
 * その文字列を「企業名一覧」フィールドに自動でセットします。
 * これにより、テーブル内に入力された企業名を一覧で簡単に確認できるようになります。
 *
 * @triggers
 * - レコード追加画面の表示時 (app.record.create.show)
 * - レコード編集画面の表示時 (app.record.edit.show)
 * - レコード追加画面で、テーブル内の「法人名_参加法人リスト」フィールドが変更された時 (app.record.create.change.法人名_参加法人リスト)
 * - レコード編集画面で、テーブル内の「法人名_参加法人リスト」フィールドが変更された時 (app.record.edit.change.法人名_参加法人リスト)
 *
 * @notes
 * このカスタマイズは、以下のフィールドコードが存在することを前提としています。
 * - 参加法人リスト: テーブル
 * - 法人名_参加法人リスト: テーブルの行内にある、法人名を入力するフィールド（文字列1行など）
 * - 企業名一覧: 転記先となる複数行テキストフィールド
 */
(function () {
  "use strict";

  // レコード追加・編集画面の表示時、およびテーブル内の指定フィールド変更時にイベントを発火
  kintone.events.on(
    [
      "app.record.create.change.法人名_参加法人リスト",
      "app.record.edit.change.法人名_参加法人リスト",
      "app.record.create.show",
      "app.record.edit.show",
    ],
    function (event) {
      var record = event.record;
      var tableRows = record.参加法人リスト.value; // テーブルフィールドの値を取得
      var companyNames = []; // 法人名を格納するための空の配列を準備

      // テーブルの各行をループ処理
      tableRows.forEach(function (row) {
        // 各行の「法人名_参加法人リスト」フィールドに値があれば、その値を取得
        if (row.value.法人名_参加法人リスト.value) {
          companyNames.push(row.value.法人名_参加法人リスト.value);
        }
      });

      // 取得した法人名の配列を改行コード(\n)で連結し、一つの文字列にする
      // 連結した文字列を「企業名一覧」フィールドにセットする
      record.企業名一覧.value = companyNames.join("\n");

      // eventオブジェクトを返して、画面上のレコード情報を更新
      return event;
    }
  );
})();
