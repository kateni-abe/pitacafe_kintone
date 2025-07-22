(function() {
    "use strict";
    
    // レコード詳細画面と編集画面の表示後イベントで処理を実行
    kintone.events.on(['app.record.detail.show', 'app.record.edit.show'], async function(event) {
      // サイドバーを非表示にする
      kintone.app.record.hideSideBar();
  
      // コメント数を繰り返し取得
      const appId = kintone.app.getId();
      const recordId = event.recordId;
      let totalComments = 0;
      let offset = 0;
      const limit = 10;
      let hasMore = true;
      const commentParams = { app: appId, record: recordId, offset: offset, limit: limit };

      try {
        while (hasMore) {
            // offsetとlimitを指定してコメント取得APIを呼び出す
            const commentResp = await kintone.api(kintone.api.url('/k/v1/record/comments', true),'GET',commentParams);
            totalComments += commentResp.comments.length;
            // レスポンスのnewerがfalseの場合、これ以上取得する必要はない
            if (commentResp.newer === false) {
                hasMore = false;
            } else {
                offset += limit;
            }
        }
        console.log("累計コメント件数：" + totalComments);

        // コメント数が1件以上なら、指定のHTML要素を作成／更新
        if (totalComments > 0) {
            let commentSpan = document.getElementById("commentNumBox");
            if (!commentSpan) {
                const commentAnchor = document.querySelector("a.sidebar-tab-comments-gaia");
                if (commentAnchor) {
                    commentSpan = document.createElement("span");
                    commentSpan.id = "commentNumBox";
                    commentSpan.className = "recordlist-commentNum-gaia text10";
                    commentAnchor.appendChild(commentSpan);
                }
            }
            if (commentSpan) {
                commentSpan.textContent = totalComments;
            }
        }
      } catch (error) {
        console.error("コメント取得に失敗しました：", error);
      }
      return event;
    });
  })();
