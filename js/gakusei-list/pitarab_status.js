(() => {
  'use strict';

  const DROPDOWN_CODE = 'pitalab_status';
  const TABLE_CODE = 'pitalab_history_table';
  const COL_ITEM_NAME = 'item_name';
  const COL_TIMESTAMP = 'timestamp'; // "日時"フィールド
  const LATEST_STATUS_CODE = 'pitalab_latest_status';
  const LATEST_TIMESTAMP_CODE = 'pitalab_latest_timestamp';

  // UI表示用（日本時間）のフォーマット関数
  const getDisplayTime = () => {
    const d = new Date();
    const pad = (n) => n < 10 ? '0' + n : n;
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // REST API用（ISO 8601 / UTC）のフォーマット関数
  // 日時フィールドにはこれが必須！
  const getApiTime = () => {
    return new Date().toISOString(); 
  };

  const changeEvents = [
    `app.record.create.change.${DROPDOWN_CODE}`,
    `app.record.edit.change.${DROPDOWN_CODE}`,
    `app.record.index.edit.change.${DROPDOWN_CODE}`
  ];

  // 1. 画面上での変更（UI反映）
  kintone.events.on(changeEvents, (event) => {
    const record = event.record;
    const statusValue = record[DROPDOWN_CODE].value;
    if (!statusValue) return event;

    const displayTime = getDisplayTime();
    const apiTime = getApiTime();

    // 最新情報フィールドの更新（画面上はISO形式でもkintoneがよしなに解釈してくれる）
    if (record[LATEST_STATUS_CODE]) record[LATEST_STATUS_CODE].value = statusValue;
    if (record[LATEST_TIMESTAMP_CODE]) record[LATEST_TIMESTAMP_CODE].value = apiTime;

    if (event.type.includes('index')) {
      delete record[TABLE_CODE]; // 一覧画面エラー回避
    } else {
      // 詳細画面：画面上の操作なので、ISO形式で渡せばOK
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

  // 2. 一覧画面保存後のAPI更新（ここが本番）
  kintone.events.on('app.record.index.edit.submit.success', async (event) => {
    const recordId = event.recordId;
    const statusValue = event.record[DROPDOWN_CODE].value;
    const apiTime = getApiTime(); // API用の時間を生成

    try {
      const getResp = await kintone.api(kintone.api.url('/k/v1/record.json', true), 'GET', {
        app: kintone.app.getId(),
        id: recordId
      });

      const currentTable = getResp.record[TABLE_CODE].value || [];

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
                  [COL_TIMESTAMP]: { value: apiTime } // ISO形式で確実に届ける
                }
              }
            ]
          }
        }
      };

      await kintone.api(kintone.api.url('/k/v1/record.json', true), 'PUT', body);
      console.log('APIによるテーブル更新が成功しました');
    } catch (err) {
      console.error('API更新失敗:', err);
    }

    return event;
  });
})();
