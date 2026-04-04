(() => {
  'use strict';

  // --- 設定：フィールドコード ---
  const DROPDOWN_CODE = 'pitalab_status';
  const TABLE_CODE = 'pitalab_history_table';
  const COL_ITEM_NAME = 'item_name';
  const COL_TIMESTAMP = 'timestamp'; // テーブル内：日時

  const LATEST_STATUS_CODE = 'pitalab_latest_status';
  const LATEST_TIMESTAMP_CODE = 'pitalab_latest_timestamp'; // 最新：日時

  // kintoneの「日時」フィールド用のISO 8601形式（UTC）を生成
  const getApiTime = () => {
    return new Date().toISOString(); 
  };

  const changeEvents = [
    `app.record.create.change.${DROPDOWN_CODE}`,
    `app.record.edit.change.${DROPDOWN_CODE}`,
    `app.record.index.edit.change.${DROPDOWN_CODE}`
  ];

  // 1. 画面上での値変更時の処理
  kintone.events.on(changeEvents, (event) => {
    const record = event.record;
    const statusValue = record[DROPDOWN_CODE].value;
    if (!statusValue) return event;

    const apiTime = getApiTime();

    // 最新情報フィールド（日時型）の更新：valueだけでOK
    if (record[LATEST_STATUS_CODE]) {
      record[LATEST_STATUS_CODE].value = statusValue;
    }
    if (record[LATEST_TIMESTAMP_CODE]) {
      record[LATEST_TIMESTAMP_CODE].value = apiTime;
    }

    // 一覧画面（index）の時はテーブルを削除してエラー回避
    if (event.type.includes('index')) {
      delete record[TABLE_CODE];
    } else {
      // 詳細・新規画面：テーブルに追記。
      // 【重要】changeイベントでは type を含めるとエラーになるため、value のみに修正
      if (!record[TABLE_CODE].value) record[TABLE_CODE].value = [];
      record[TABLE_CODE].value.push({
        value: {
          [COL_ITEM_NAME]: { value: statusValue },
          [COL_TIMESTAMP]: { value: apiTime }
        }
      });
    }
    return event;
  });

  // 2. 一覧画面保存後のAPI更新
  kintone.events.on('app.record.index.edit.submit.success', async (event) => {
    const recordId = event.recordId;
    const statusValue = event.record[DROPDOWN_CODE].value;
    const apiTime = getApiTime();

    try {
      const getResp = await kintone.api(kintone.api.url('/k/v1/record.json', true), 'GET', {
        app: kintone.app.getId(),
        id: recordId
      });

      const currentTable = getResp.record[TABLE_CODE].value || [];

      // API（PUT）の時はこの構造でOK
      await kintone.api(kintone.api.url('/k/v1/record.json', true), 'PUT', {
        app: kintone.app.getId(),
        id: recordId,
        record: {
          [TABLE_CODE]: {
            value: [
              ...currentTable,
              {
                value: {
                  [COL_ITEM_NAME]: { value: statusValue },
                  [COL_TIMESTAMP]: { value: apiTime }
                }
              }
            ]
          }
        }
      });
    } catch (err) {
      console.error('API更新失敗:', err);
    }
    return event;
  });
})();
