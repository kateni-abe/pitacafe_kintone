(() => {
  'use strict';

  const DROPDOWN_CODE = 'pitalab_status';
  const TABLE_CODE = 'pitalab_history_table';
  const COL_ITEM_NAME = 'item_name';
  const COL_TIMESTAMP = 'timestamp';
  const LATEST_STATUS_CODE = 'pitalab_latest_status';
  const LATEST_TIMESTAMP_CODE = 'pitalab_latest_timestamp';

  // 現在時刻をフォーマットする共通関数
  const getNowStr = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

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

    const timestampStr = getNowStr();

    // 最新情報フィールドの更新
    if (record[LATEST_STATUS_CODE]) record[LATEST_STATUS_CODE].value = statusValue;
    if (record[LATEST_TIMESTAMP_CODE]) record[LATEST_TIMESTAMP_CODE].value = timestampStr;

    // 一覧画面（index）の時はテーブルをいじるとエラーになるので削除
    if (event.type.includes('index')) {
      delete record[TABLE_CODE];
    } else {
      // 詳細画面/作成画面の時だけテーブルに直接追加
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

  // 2. 一覧画面での保存成功後、APIでテーブルを更新
  kintone.events.on('app.record.index.edit.submit.success', async (event) => {
    const recordId = event.recordId;
    const statusValue = event.record[DROPDOWN_CODE].value;
    
    // 【重要】画面から拾うのではなく、ここで改めて時間を生成する
    const timestampStr = getNowStr();

    try {
      // 現在のレコード情報を取得（既存のテーブルを壊さないため）
      const getResp = await kintone.api(kintone.api.url('/k/v1/record.json', true), 'GET', {
        app: kintone.app.getId(),
        id: recordId
      });

      const currentTable = getResp.record[TABLE_CODE].value || [];

      // APIでテーブルに追記
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
                  [COL_TIMESTAMP]: { value: timestampStr } // 確実に値を入れる！
                }
              }
            ]
          }
        }
      });
      
      // API更新後は一覧画面をリロードして反映を確認（必要に応じて）
      // location.reload(); 
    } catch (err) {
      console.error('API更新エラー:', err);
    }

    return event;
  });
})();
