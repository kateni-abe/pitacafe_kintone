(() => {
  'use strict';

  const DROPDOWN_CODE = 'pitalab_status';
  const TABLE_CODE = 'pitalab_history_table';
  const COL_ITEM_NAME = 'item_name';
  const COL_TIMESTAMP = 'timestamp';
  const LATEST_STATUS_CODE = 'pitalab_latest_status';
  const LATEST_TIMESTAMP_CODE = 'pitalab_latest_timestamp';

  // 1. 値が変更された時の処理
  const changeEvents = [
    `app.record.create.change.${DROPDOWN_CODE}`,
    `app.record.edit.change.${DROPDOWN_CODE}`,
    `app.record.index.edit.change.${DROPDOWN_CODE}`
  ];

  kintone.events.on(changeEvents, (event) => {
    const record = event.record;
    const statusValue = record[DROPDOWN_CODE].value;
    if (!statusValue) return event;

    const now = new Date();
    const timestampStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // 最新情報フィールドの更新
    if (record[LATEST_STATUS_CODE]) record[LATEST_STATUS_CODE].value = statusValue;
    if (record[LATEST_TIMESTAMP_CODE]) record[LATEST_TIMESTAMP_CODE].value = timestampStr;

    // --- ここが重要 ---
    if (event.type.includes('index')) {
      // 一覧画面（index）の時は、エラー回避のためにテーブル項目をオブジェクトから「消す」
      delete record[TABLE_CODE];
    } else {
      // 詳細画面の時だけテーブルに直接追加
      if (!record[TABLE_CODE].value) record[TABLE_CODE].value = [];
      record[TABLE_CODE].value.push({
        value: {
          [COL_ITEM_NAME]: { type: 'SINGLE_LINE_TEXT', value: statusValue },
          [COL_TIMESTAMP]: { type: 'SINGLE_LINE_TEXT', value: timestampStr }
        }
      });
    }

    return event;
  });

  // 2. 一覧画面での保存成功後、APIでテーブルを裏側から更新
  kintone.events.on('app.record.index.edit.submit.success', async (event) => {
    const recordId = event.recordId;
    const statusValue = event.record[DROPDOWN_CODE].value;
    const timestampStr = event.record[LATEST_TIMESTAMP_CODE].value;

    try {
      // 現在のレコード情報を取得（既存のテーブル内容を壊さないため）
      const getResp = await kintone.api(kintone.api.url('/k/v1/record.json', true), 'GET', {
        app: kintone.app.getId(),
        id: recordId
      });

      const currentTable = getResp.record[TABLE_CODE].value;

      // テーブルに新しい行を足して更新
      const body = {
        app: kintone.app.getId(),
        id: recordId,
        record: {
          [TABLE_CODE]: {
            value: [
              ...currentTable,
              {
                value: {
                  [COL_ITEM_NAME]: { value: statusValue },
                  [COL_TIMESTAMP]: { value: timestampStr }
                }
              }
            ]
          }
        }
      };

      await kintone.api(kintone.api.url('/k/v1/record.json', true), 'PUT', body);
    } catch (err) {
      console.error('API更新エラー:', err);
    }

    return event;
  });
})();
