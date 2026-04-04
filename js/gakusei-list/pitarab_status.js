(() => {
  'use strict';

  const DROPDOWN_CODE = 'pitalab_status';
  const TABLE_CODE = 'pitalab_history_table';
  const COL_ITEM_NAME = 'item_name';
  const COL_TIMESTAMP = 'timestamp';
  const LATEST_STATUS_CODE = 'pitalab_latest_status';
  const LATEST_TIMESTAMP_CODE = 'pitalab_latest_timestamp';

  // kintoneの「日時」フィールドと「文字列」両方に対応するフォーマット関数
  const getKintoneDateTime = () => {
    const d = new Date();
    // 日本時間でフォーマットを整える
    const pad = (n) => n < 10 ? '0' + n : n;
    const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    
    // 文字列フィールドなら "2026-04-04 14:30:00"
    // 日時フィールドなら REST APIでは ISO形式 "2026-04-04T14:30:00Z" (UTC) が無難やけど、
    // 日本時間のまま "2026-04-04T14:30:00+09:00" と書くのが一番確実
    return `${dateStr}T${timeStr}+09:00`;
  };

  const changeEvents = [
    `app.record.create.change.${DROPDOWN_CODE}`,
    `app.record.edit.change.${DROPDOWN_CODE}`,
    `app.record.index.edit.change.${DROPDOWN_CODE}`
  ];

  kintone.events.on(changeEvents, (event) => {
    const record = event.record;
    const statusValue = record[DROPDOWN_CODE].value;
    if (!statusValue) return event;

    const timestampStr = getKintoneDateTime();

    if (record[LATEST_STATUS_CODE]) record[LATEST_STATUS_CODE].value = statusValue;
    if (record[LATEST_TIMESTAMP_CODE]) record[LATEST_TIMESTAMP_CODE].value = timestampStr;

    if (event.type.includes('index')) {
      delete record[TABLE_CODE]; // 一覧画面でのエラー回避
    } else {
      if (!record[TABLE_CODE].value) record[TABLE_CODE].value = [];
      record[TABLE_CODE].value.push({
        value: {
          [COL_ITEM_NAME]: { value: statusValue },
          [COL_TIMESTAMP]: { value: timestampStr }
        }
      });
    }
    return event;
  });

  kintone.events.on('app.record.index.edit.submit.success', async (event) => {
    const recordId = event.recordId;
    const statusValue = event.record[DROPDOWN_CODE].value;
    const timestampStr = getKintoneDateTime();

    try {
      // 現在のレコードを再取得（テーブルの既存データを保持するため）
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
                  [COL_TIMESTAMP]: { value: timestampStr }
                }
              }
            ]
          }
        }
      };

      console.log('API送信データ:', JSON.stringify(body, null, 2));
      await kintone.api(kintone.api.url('/k/v1/record.json', true), 'PUT', body);
      console.log('テーブル更新成功！');
    } catch (err) {
      console.error('API更新に失敗しました。詳細:', err);
      // 万が一エラーが出た場合、詳細をアラートで出す（デバッグ用）
      if (err.message) alert('エラー発生: ' + err.message);
    }

    return event;
  });
})();
