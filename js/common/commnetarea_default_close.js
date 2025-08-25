(function() {
  "use strict";

  // レコード詳細・編集表示時に実行
  kintone.events.on(['app.record.detail.show', 'app.record.edit.show'], async function(event) {
    // サイドバーを隠す（公式API）
    kintone.app.record.hideSideBar();

    const appId = kintone.app.getId();
    const recordId = event.recordId;

    let totalComments = 0;
    let offset = 0;
    const limit = 10;
    let olderExists = true;     // 「古いコメントがまだあるか」のフラグ

    try {
      while (olderExists) {
        // ★ 毎ループで offset をパラメータに反映
        const body = {
          app: appId,
          record: recordId,
          order: 'desc',     // 新しい→古い
          offset: offset,
          limit: limit       // API上限10
        };

        const resp = await kintone.api(
          kintone.api.url('/k/v1/record/comments.json', true),
          'GET',
          body
        );

        totalComments += resp.comments.length;

        // ★ 次ページの有無は「older」で判定（desc順なので古い方に進む）
        if (resp.older === true && resp.comments.length > 0) {
          offset += limit;  // ★ 次の塊へ
        } else {
          olderExists = false;
        }
      }

      console.log('[comment counter] total =', totalComments);

      // コメント数が1件以上ならバッジを付与/更新
      if (totalComments > 0) {
        let commentSpan = document.getElementById('commentNumBox');
        if (!commentSpan) {
          // コメントタブ要素（クラス名は今のUIでも動くセレクタに）
          const commentAnchor =
            document.querySelector('a.sidebar-tab-comments-gaia, a[data-test-id="record-comment-sidebar-tab"]');
          if (commentAnchor) {
            commentSpan = document.createElement('span');
            commentSpan.id = 'commentNumBox';
            commentSpan.className = 'recordlist-commentNum-gaia text10';
            commentAnchor.appendChild(commentSpan);
          }
        }
        if (commentSpan) commentSpan.textContent = String(totalComments);
      }
      return event;

    } catch (error) {
      console.error('コメント取得に失敗しました:', error);
      return event;
    }
  });
})();
