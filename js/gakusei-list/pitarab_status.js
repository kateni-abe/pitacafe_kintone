(() => {
  'use strict';

  // --- 設定：フィールドコード ---
  const DROPDOWN_CODE = 'pitalab_status';
  const TABLE_CODE = 'pitalab_history_table';
  const COL_ITEM_NAME = 'item_name';
  const COL_TIMESTAMP = 'timestamp';

  // 【修正】一覧表示・管理用のフィールドコード
  const LATEST_STATUS_CODE = 'pitalab_latest_status';
  const LATEST_TIMESTAMP_CODE = 'pitalab_latest_timestamp';

  // 値が変更された時のイベント
  const events = [
    `app.record.create.change.${DROPDOWN_CODE}`,
    `app.record.edit.change.${DROPDOWN_CODE}`
  ];

  kintone.events.on(events, (event) => {
    const record = event.record;
    const statusValue = record[DROPDOWN_CODE].value;

    // ドロップダウンが空の場合は何もしない
    if (!statusValue) return event;

    // 現在時刻のフォーマット（YYYY-MM-DD HH:mm）
    const now = new Date();
    const timestampStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // 1. テーブル（履歴）への追加処理
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
    
    // テーブルが存在しない場合の初期化対応
    if (!record[TABLE_CODE].value) {
      record[TABLE_CODE].value = [];
    }
    record[TABLE_CODE].value.push(newRow);

    // 2. 最新情報用フィールドへの同期（一覧画面で表示するため）
    record[LATEST_STATUS_CODE].value = statusValue;
    record[LATEST_TIMESTAMP_CODE].value = timestampStr;

    return event;
  });
})();
