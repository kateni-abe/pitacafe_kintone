(function () {
  'use strict';

  // 設定（必要ならここだけ変更）
  var TARGET_STATUS = 'LINE送付済';
  var DATE_FIELD = 'LINE送付日';   // 日付フィールド（Date）

  // 端末共通でフック
  var EVENTS = [
    'app.record.detail.process.proceed',
    'mobile.app.record.detail.process.proceed'
  ];

  kintone.events.on(EVENTS, function (event) {
    try {
      // 「これから進む遷移先ステータス」が LINE送付済 の時だけ動作
      if (event.nextStatus && event.nextStatus.value === TARGET_STATUS) {
        var rec = event.record;

        // 今日を YYYY-MM-DD で作成（ローカル時刻）
        var d = new Date();
        var pad = function (n) { return ('0' + n).slice(-2); };
        var dateStr = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());

        // 必ず上書き（過去の値があっても置き換える）
        rec[DATE_FIELD].value = dateStr;
      }
      // 他ステータスへ遷移時は何もしない（上書きも削除もしない）
      return event;
    } catch (e) {
      event.error = 'LINE送付日の自動更新でエラーが発生しました：' + e.message;
      return event; // 処理を中断し、メッセージ表示
    }
  });
})();
