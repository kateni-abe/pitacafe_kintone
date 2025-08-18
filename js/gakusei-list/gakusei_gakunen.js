/**
 * Kintone 自動計算スクリプト
 * -------------------------------------------------
 * このファイルの目的：
 * - 生年月日と修業年数をもとに、年齢・入学年・学年・卒業予定年を自動計算する
 *
 * 主な処理概要：
 * - 生年月日から年齢を算出
 * - 早生まれ（1月1日～4月1日）を考慮して学年計算を調整
 * - 入学年（18歳で迎える年度）を算出
 * - 修業年数をもとに卒業予定年を算出
 * - 学年を判定（入学前／在学中／卒業）
 *
 * イベントトリガー：
 * - レコードの新規作成／編集／詳細表示
 * - 生年月日やルックアップ変更時
 * - 保存（submit）時
 *
 * 備考：
 * - フィールドコードは環境に合わせて設定可能
 * - 早生まれ判定のロジックを修正済み（4月1日生まれも正しく判定）
 */

(function() {
  'use strict';

  // --- 計算のトリガーとなるイベントを設定 ---
  const events = [
    'app.record.create.show',
    'app.record.edit.show',
    'app.record.detail.show',
    'app.record.create.change.生年月日',
    'app.record.create.change.ルックアップ',
    'app.record.edit.change.生年月日',
    'app.record.edit.change.ルックアップ',
    'app.record.create.submit',
    'app.record.edit.submit'
  ];

  kintone.events.on(events, (event) => {
    const record = event.record;

    // --- フィールドコード定義 (ご自身の環境に合わせてください) ---
    const birthdateField = '生年月日';         // 入力: 生年月日
    const courseYearField = '修業年数';        // 入力: 修業年数
    const ageField = '年齢';                 // 出力: 年齢
    const admissionYearField = '入学年';       // 出力: 入学年
    const gradeField = '学年';               // 出力: 学年
    const graduationYearField = '卒業予定年'; // 出力: 卒業予定年
    // ----------------------------------------------------

    const birthdate = record[birthdateField].value;
    const courseYears = Number(record[courseYearField].value) || 0;

    if (!birthdate) {
      record[ageField].value = '';
      record[admissionYearField].value = '';
      record[gradeField].value = '';
      record[graduationYearField].value = '';
      return event;
    }

    const today = new Date();
    const birth = new Date(birthdate);

    // --- ① 年齢計算 ---
    const todayNum = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const birthNum = birth.getFullYear() * 10000 + (birth.getMonth() + 1) * 100 + birth.getDate();
    const age = Math.floor((todayNum - birthNum) / 10000);

    // --- ② 学年・入学年・卒業予定年計算 (早生まれ考慮) ---
    const currentFiscalYear = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;

    // ★★★ 修正箇所: 学年基準の誕生年の計算式 ★★★
    // 旧コード (4月1日生まれの判定が不正確でした)
    // const baseBirthYear = (birth.getMonth() > 2 || (birth.getMonth() === 2 && birth.getDate() > 1)) ? birth.getFullYear() : birth.getFullYear() - 1;
    
    // 新コード (1月1日～4月1日生まれを前年度のグループとして正しく計算)
    const baseBirthYear = (birth.getMonth() < 3 || (birth.getMonth() === 3 && birth.getDate() === 1)) ?
      birth.getFullYear() - 1 :
      birth.getFullYear();

    // 入学年 (18歳で迎える年度)
    const admissionYear = baseBirthYear + 19;

    // 卒業予定年
    const graduationYear = admissionYear + courseYears;

    // 学年
    let grade = currentFiscalYear - admissionYear + 1;
    let gradeDisplay; // 表示用の学年

    if (grade <= 0) {
      gradeDisplay = '入学前';
    } else if (courseYears > 0 && grade > courseYears) {
      gradeDisplay = '卒業';
    } else {
      gradeDisplay = grade;
    }
    
    // --- ③ 計算結果をフィールドにセット ---
    record[ageField].value = age;
    record[admissionYearField].value = admissionYear;
    record[gradeField].value = gradeDisplay;
    record[graduationYearField].value = graduationYear;

    return event;
  });
})();
