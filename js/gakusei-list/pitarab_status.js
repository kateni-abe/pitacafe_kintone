(() => {
  'use strict';

  const DROPDOWN_CODE = 'pitalab_status';
  const TABLE_CODE = 'pitalab_history_table';
  const COL_ITEM_NAME = 'item_name';
  const COL_TIMESTAMP = 'timestamp';
  const LATEST_STATUS_CODE = 'pitalab_latest_status';
  const LATEST_TIMESTAMP_CODE = 'pitalab_latest_timestamp';

  // 1. 値が変更された時の処理（UIへの反映）
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

    // 最新情報フィールドは、一覧でも詳細でも常に更新（UI反映）
    record[LATEST_STATUS_CODE].value = statusValue;
    record[LATEST_TIMESTAMP_CODE].value = timestampStr;

    // 詳細画面/新規作成画面の時だけ、テーブルを直接書き換える
    if (event.type.includes('index') === false) {
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

  // 2. 一覧画面での保存成功後、裏側でテーブルをAPI更新する
  kintone.events.on('app.record.index.edit.submit.success', (event) => {
    const record = event.record;
    const recordId = event.recordId;
    const statusValue = record[DROPDOWN_CODE].value;
    const timestampStr = record[LATEST_TIMESTAMP_CODE].value;

    // APIを使って、一覧画面からは触れないテーブルを直接更新
    const body = {
      app: kintone.app.getId(),
      id: recordId,
      record: {
        [TABLE_CODE]: {
          value: [
            ...record[TABLE_CODE].value, // 既存の行を保持
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

    return kintone.api(kintone.api.url('/k/v1/record.json', true), 'PUT', body).then(() => {
      return event;
    }).catch((err) => {
      console.error('テーブルのAPI更新に失敗しました', err);
      return event;
    });
  });
})();
