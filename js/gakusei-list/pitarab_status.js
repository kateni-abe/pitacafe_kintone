(() => {
  'use strict';

  // --- 設定：フィールドコード ---
  const DROPDOWN_CODE = 'pitalab_status';
  const TABLE_CODE = 'pitalab_history_table';
  const COL_ITEM_NAME = 'item_name';
  const COL_TIMESTAMP = 'timestamp';

  const LATEST_STATUS_CODE = 'pitalab_latest_status';
  const LATEST_TIMESTAMP_CODE = 'pitalab_latest_timestamp';

  // 値が変更された時のイベント（新規作成・編集の両方）
  const events = [
    `app.record.create.change.${DROPDOWN_CODE}`,
    `app.record.edit.change.${DROPDOWN_CODE}`
  ];

  kintone.events.on(events, (event) => {
    const record = event.record;
    const statusValue = record[DROPDOWN_CODE].value;

    // ドロップダウンが空の場合は何もしない
    if (!statusValue) {
      return event;
    }

    // 現在時刻のフォーマット（YYYY-MM-DD HH:mm）
    const now = new Date();
    const timestampStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    console.log('--- pitalab カスタマイズ実行開始 ---');
    console.log('選択された値:', statusValue);

    // 1. テーブル（履歴）への追加処理
    if (record[TABLE_CODE]) {
      // テーブルの配列が存在しない場合は初期化
      if (!record[TABLE_CODE].value) {
        record[TABLE_CODE].value = [];
      }
      
      record[TABLE_CODE].value.push({
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
      });
      console.log('履歴テーブルへの追加に成功しました');
    } else {
      console.error('エラー: 履歴テーブルが見つかりません。フィールドコードを確認してください:', TABLE_CODE);
    }

    // 2. 最新情報用フィールドへの書き込み
    // フィールドが存在するかチェックしてから代入
    if (record[LATEST_STATUS_CODE] !== undefined && record[LATEST_TIMESTAMP_CODE] !== undefined) {
      record[LATEST_STATUS_CODE].value = statusValue;
      record[LATEST_TIMESTAMP_CODE].value = timestampStr;
      console.log('最新情報フィールド（status/timestamp）の更新に成功しました');
    } else {
      console.error('エラー: 最新情報用フィールドが見つかりません。', {
        statusField: LATEST_STATUS_CODE,
        timestampField: LATEST_TIMESTAMP_CODE,
        record: record
      });
    }

    console.log('--- pitalab カスタマイズ実行終了 ---');

    return event;
  });
})();
