/* Kintone レコード画面用：タブ風ボタンでフィールド表示を切替えるスクリプト */

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
      fontSize: '13px',
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
   * @param {string} setInfo - 表示するタブの種類 ('All', 'a', 'b', ...)
   * @param {object} buttons - 全てのボタン要素を含むオブジェクト
   */
  function tagView(setInfo, buttons) {
    // --- 各タブで表示するフィールドのフィールドコードを配列で管理 ---
    const fieldsForA = ['プロフィール', '就職先', '経歴'];
    const fieldsForB = ['案件一覧', 'コミュニケーション記録'];
    const fieldsForC = ['ポイント合計', '計算開始', '計算終了', 'ポイント'];
    const fieldsForD = ['イベント・インターン参加歴'];
    const fieldsForE = ['就職先希望', '就転職希望情報', '就転職先の希望・要望', '就転職活動歴', '転職希望時期', '支援フェーズ'];

    // 管理対象の全フィールドコードの重複をなくしたリストを作成
    const allFields = [...new Set([
      ...fieldsForA, ...fieldsForB, ...fieldsForC, ...fieldsForD, ...fieldsForE
    ])];

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
      button.style.color = '#333333';
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
      case 'c':
        fieldsToShow = fieldsForC;
        activeButton = buttons.ButtonC;
        break;
      case 'd':
        fieldsToShow = fieldsForD;
        activeButton = buttons.ButtonD;
        break;
      case 'e':
        fieldsToShow = fieldsForE;
        activeButton = buttons.ButtonE;
        break;
    }
    
    // 選択されたボタンの背景色を変更
    if (activeButton) {
      activeButton.style.background = '#989898';
      activeButton.style.color = '#ffffff';
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
      ButtonA: createButton('ButtonA', 'プロフィール'),
      ButtonB: createButton('ButtonB', '案件一覧・コミュニケーション記録'),
      ButtonC: createButton('ButtonC', '獲得ポイント'),
      ButtonD: createButton('ButtonD', '研修etc参加歴'),
      ButtonE: createButton('ButtonE', '就職・転職活動'),
      ButtonAll: createButton('ButtonAll', '全表示')
    };

    // --- クリックイベントの設定 ---
    buttons.ButtonA.onclick = () => tagView('a', buttons);
    buttons.ButtonB.onclick = () => tagView('b', buttons);
    buttons.ButtonC.onclick = () => tagView('c', buttons);
    buttons.ButtonD.onclick = () => tagView('d', buttons);
    buttons.ButtonE.onclick = () => tagView('e', buttons);
    buttons.ButtonAll.onclick = () => tagView('All', buttons);

    // --- ボタンをスペースに配置 ---
    const tabSpace = kintone.app.record.getSpaceElement('TAB_ID');
    if (tabSpace) {
      if (tabSpace.children.length === 0) {
        tabSpace.style.display = 'flex';
        tabSpace.style.flexWrap = 'wrap';
        
        // buttonsオブジェクトの順序でボタンを追加
        Object.values(buttons).forEach(button => {
            tabSpace.appendChild(button);
        });
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
