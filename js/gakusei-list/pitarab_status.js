(() => {
  'use strict';

  // フィールドコードの設定
  const DROPDOWN_CODE = 'pitalab_status';
  const TABLE_CODE = 'pitalab_history_table';
  const COL_ITEM_NAME = 'item_name'; // 提案通りのフィールド名
  const COL_TIMESTAMP = 'timestamp'; // 提案通りのフィールド名

  // 値が変更された時に動くイベント
  const events = [
    `app.record.create.change.${DROPDOWN_CODE}`,
    `app.record.edit.change.${DROPDOWN_CODE}`
  ];

  kintone.events.on(events, (event) => {
    const record = event.record;
    const statusValue = record[DROPDOWN_CODE].value;

    // ドロップダウンが空（選択解除）になった時は何もしない
    if (!statusValue) {
      return event;
    }

    // 現在時刻（日本時間）を取得してフォーマット
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const timestampStr = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    // テーブルに追加する新しい行のデータを作成
    const newRow = {
      value: {
        [COL_ITEM_NAME]: {
          type: 'SINGLE_LINE_TEXT',
          value: statusValue
        },
        [COL_TIMESTAMP]: {
          type: 'SINGLE_LINE_TEXT',
          value: timestampStr
        }
      }
    };

    // 既存のテーブルの末尾に新しい行を追加
    record[TABLE_CODE].value.push(newRow);

    return event;
  });
})();