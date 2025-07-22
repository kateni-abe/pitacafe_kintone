(function () {
  'use strict';

  /**
   * ボタン要素を生成する関数
   * @param {string} id - ボタンのID
   * @param {string} text - ボタンに表示するテキスト
   * @returns {HTMLElement} 生成されたボタン要素
   */
  function createButton(id, text) {
    const button = document.createElement('button');
    button.id = id;
    button.innerHTML = text;
    // お手本コードのスタイルを適用
    Object.assign(button.style, {
      height: '35px',
      width: 'auto',
      minWidth: '100px',
      borderRadius: '4px 4px 4px 4px',
      backgroundColor: 'white',
      border: '1px solid #CCCCCC',
      fontSize: '12px',
      paddingLeft: '10px',
      paddingRight: '10px',
      marginLeft: '1px',
      marginRight: '1px',
      cursor: 'pointer',
      flexShrink: 0
    });
    return button;
  }

  /**
   * フィールドの表示を切り替える関数
   * @param {string} setInfo - 表示するタブの種類 ('All', 'a', 'b')
   * @param {object} buttons - 全てのボタン要素を含むオブジェクト
   */
  function tagView(setInfo, buttons) {
    // --- 各タブで表示するフィールドのフィールドコードを配列で管理 ---
    const fieldsForA = ['開催概要'];
    const fieldsForB = ['参加者リスト'];

    // 管理対象の全フィールドコードの重複をなくしたリストを作成
    const allFields = [...new Set([...fieldsForA, ...fieldsForB])];

    // --- 1. まず、関連する全てのフィールドを非表示にする ---
    allFields.forEach(fieldCode => {
      try {
        kintone.app.record.setFieldShown(fieldCode, false);
      } catch (err) {
        console.error(`フィールドコード "${fieldCode}" の非表示に失敗しました。フォームに存在するか確認してください。`, err);
      }
    });

    // --- 2. 全てのボタンの背景色をリセット ---
    Object.values(buttons).forEach(button => {
      button.style.background = 'white';
    });

    // --- 3. 選択されたタブに応じて、表示するフィールドを決定し、ボタンをハイライト ---
    let fieldsToShow = [];
    let activeButton;

    switch (setInfo) {
      case 'All':
        fieldsToShow = allFields;
        activeButton = buttons.ButtonAll;
        break;
      case 'a':
        fieldsToShow = fieldsForA;
        activeButton = buttons.ButtonA;
        break;
      case 'b':
        fieldsToShow = fieldsForB;
        activeButton = buttons.ButtonB;
        break;
    }
    
    // 選択されたボタンの背景色を変更
    if (activeButton) {
      activeButton.style.background = '#eaeaea';
    }

    // --- 4. 選択されたフィールドを表示する ---
    fieldsToShow.forEach(fieldCode => {
      try {
        kintone.app.record.setFieldShown(fieldCode, true);
      } catch (err) {
        console.error(`フィールドコード "${fieldCode}" の表示に失敗しました。フォームに存在するか確認してください。`, err);
      }
    });
  }

  // レコードの作成・編集・詳細画面が表示された時のイベント
  kintone.events.on(['app.record.create.show', 'app.record.edit.show', 'app.record.detail.show'], function (e) {
    // --- ボタンの生成 ---
    const buttons = {
      ButtonA: createButton('ButtonA', '開催概要'),
      ButtonB: createButton('ButtonB', '参加者一覧'),
      ButtonAll: createButton('ButtonAll', '全表示')
    };

    // --- クリックイベントの設定 ---
    buttons.ButtonA.onclick = () => tagView('a', buttons);
    buttons.ButtonB.onclick = () => tagView('b', buttons);
    buttons.ButtonAll.onclick = () => tagView('All', buttons);

    // --- ボタンをスペースに配置 ---
    const tabSpace = kintone.app.record.getSpaceElement('TAB_ID');
    if (tabSpace) {
      if (tabSpace.children.length === 0) {
        tabSpace.style.display = 'flex';
        tabSpace.style.flexWrap = 'wrap';
        
        // buttonsオブジェクトの順序でボタンを追加
        tabSpace.appendChild(buttons.ButtonA);
        tabSpace.appendChild(buttons.ButtonB);
        tabSpace.appendChild(buttons.ButtonAll);
      }
    } else {
      console.error('スペース要素 "TAB_ID" が見つかりません。フォーム設定を確認してください。');
      return e;
    }

    // --- 初期表示 ---
    tagView('a', buttons);

    return e;
  });

})();
