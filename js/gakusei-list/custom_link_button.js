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
    linkButton.href = 'https://sites.google.com/recrun.net/lmenberstokintone/%E3%83%9B%E3%83%BC%E3%83%A0';
    linkButton.textContent = 'Lメンバーズから学生情報を登録する'; // ボタンに表示するテキスト
    linkButton.target = '_blank'; // リンクを新しいタブで開く
    linkButton.rel = 'noopener noreferrer'; // セキュリティ対策

    // ボタンのデザインを設定（kintoneの標準ボタン風）
    linkButton.className = 'gaia-ui-actionmenu-item';
    linkButton.style.padding = '0 16px';
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
