(function () {
  'use strict';

  // レコード詳細／編集表示時に「サイドバーをデフォルト閉じる」
  var EVENTS = ['app.record.detail.show', 'app.record.edit.show',
                'mobile.app.record.detail.show', 'mobile.app.record.edit.show'];

  function closeSidebarSafely() {
    try {
      // 1) 新API: showSideBar('CLOSED') があればそれを使う
      if (kintone.app && kintone.app.record && typeof kintone.app.record.showSideBar === 'function') {
        kintone.app.record.showSideBar('CLOSED');
        console.log('[sidebar] closed via showSideBar(CLOSED)');
        return;
      }
      // 2) 旧API: hideSideBar() があればそれを使う
      if (kintone.app && kintone.app.record && typeof kintone.app.record.hideSideBar === 'function') {
        kintone.app.record.hideSideBar();
        console.log('[sidebar] closed via hideSideBar()');
        return;
      }
      // 3) フォールバック: DOMを叩いて「開いているタブ」をクリック＝閉じる
      //   - コメント or 変更履歴タブが選択状態なら click() で閉じます
      var openedTab = document.querySelector(
        'a.sidebar-tab-comments-gaia.goog-tab-selected, a.sidebar-tab-history-gaia.goog-tab-selected'
      );
      if (openedTab) {
        openedTab.click();
        console.log('[sidebar] closed via DOM click fallback');
      } else {
        console.log('[sidebar] already closed or selector not found');
      }
    } catch (e) {
      console.warn('[sidebar] close failed:', e);
    }
  }

  kintone.events.on(EVENTS, function (event) {
    // レコード画面DOMが描画された直後に閉じる
    //（描画タイミング差を吸収するため少し遅延）
    setTimeout(closeSidebarSafely, 0);
    return event;
  });
})();
