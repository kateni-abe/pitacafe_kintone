/**
 * Kintone カスタムボタン設置スクリプト
 * -------------------------------------------------
 * このファイルの目的：
 * - レコード一覧画面にカスタムボタンを追加し、
 *   外部サイト（Lメンバーズ学生情報登録ページ）へ遷移できるようにする
 *
 * 主な処理概要：
 * - レコード一覧画面が表示されたときにイベントを検知
 * - 既にボタンが存在する場合は重複設置を防止
 * - ヘッダーメニュー右側のスペースにカスタムボタンを追加
 * - ボタン押下時に指定のURLを新しいタブで開く
 *
 * 備考：
 * - ボタンの見た目はKintone標準風にCSSを調整
 * - rel="noopener noreferrer" を付与してセキュリティ対策済み
 */

(function() {
  'use strict';

  // レコード一覧画面が表示された時のイベント
  kintone.events.on('app.record.index.show', function(event) {
    // ボタンが既に設置されている場合は、重複して作成しないように処理を終了
    if (document.getElementById('my_custom_link_button') !== null) {
      return;
    }

    // ボタンを設置する場所（ヘッダーのメニュー右側のスペース）を取得
    var headerSpace = kintone.app.getHeaderMenuSpaceElement();

    // ボタン要素を作成
    var linkButton = document.createElement('a');
    linkButton.id = 'my_custom_link_button';
    linkButton.href = 'https://sites.google.com/recrun.net/lmenberstokintone?usp=sharing';
    linkButton.textContent = 'Lメンバーズから学生情報を登録する'; // ボタンに表示するテキスト
    linkButton.target = '_blank'; // リンクを新しいタブで開く
    linkButton.rel = 'noopener noreferrer'; // セキュリティ対策

    // ボタンのデザインを設定（kintoneの標準ボタン風）
    linkButton.className = 'gaia-ui-actionmenu-item';
    linkButton.style.padding = '14px 16px';
    linkButton.style.textDecoration = 'none';
    linkButton.style.backgroundColor = '#3498db'; // ボタンの色（お好みで変更可能）
    linkButton.style.color = 'white';
    linkButton.style.border = '1px solid #3498db';
    linkButton.style.borderRadius = '4px';


    // 作成したボタンをヘッダーに追加
    headerSpace.appendChild(linkButton);

    return event;
  });
})();
