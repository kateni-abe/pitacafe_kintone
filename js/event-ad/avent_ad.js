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
      borderRadius: '10px 10px 0px 0px',
      backgroundColor: 'white',
      border: '1px solid #CCCCCC',
      fontSize: '13px',
      paddingLeft: '10px',
      paddingRight: '10px',
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
    const fieldsForA = ['イベント概要'];
    const fieldsForB = ['開催目的'];
    const fieldsForC = ['参考資料_素材'];
    const fieldsForD = ['ストーリーズ'];
    const fieldsForE = ['リール'];
    const fieldsForF = ['オフィシャルLINE'];
    const fieldsForG = ['HOCARIグループLINE'];
    const fieldsForH = ['紙媒体'];
    const fieldsForI = ['その他'];

    // 管理対象の全フィールドコードの重複をなくしたリストを作成
    const allFields = [...new Set([
      ...fieldsForA, ...fieldsForB, ...fieldsForC, ...fieldsForD, ...fieldsForE,
      ...fieldsForF, ...fieldsForG, ...fieldsForH, ...fieldsForI
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
      case 'f':
        fieldsToShow = fieldsForF;
        activeButton = buttons.ButtonF;
        break;
      case 'g':
        fieldsToShow = fieldsForG;
        activeButton = buttons.ButtonG;
        break;
      case 'h':
        fieldsToShow = fieldsForH;
        activeButton = buttons.ButtonH;
        break;
      case 'i':
        fieldsToShow = fieldsForI;
        activeButton = buttons.ButtonI;
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
      ButtonAll: createButton('ButtonAll', '全表示'),
      ButtonA: createButton('ButtonA', 'イベント概要'),
      ButtonB: createButton('ButtonB', '開催目的'),
      ButtonC: createButton('ButtonC', '参考資料・素材'),
      ButtonD: createButton('ButtonD', 'ストーリーズ'),
      ButtonE: createButton('ButtonE', 'リール'),
      ButtonF: createButton('ButtonF', 'オフィシャルLINE'),
      ButtonG: createButton('ButtonG', 'HOCARIグループLINE'),
      ButtonH: createButton('ButtonH', '紙媒体'),
      ButtonI: createButton('ButtonI', 'その他')
    };

    // --- クリックイベントの設定 ---
    Object.keys(buttons).forEach(key => {
      const shortKey = key.replace('Button', '').toLowerCase();
      buttons[key].onclick = () => tagView(shortKey, buttons);
    });
    buttons.ButtonAll.onclick = () => tagView('All', buttons);

    // --- ボタンをスペースに配置 ---
    // どのボタンをどのスペースに配置するかを定義
    const buttonLayout = {
      TAB_ID: ['ButtonAll', 'ButtonA', 'ButtonB', 'ButtonC'],
      TAB_ID_2: ['ButtonD', 'ButtonE', 'ButtonF', 'ButtonG', 'ButtonH', 'ButtonI']
    };

    // 定義に従ってボタンを配置
    for (const spaceId in buttonLayout) {
      const tabSpace = kintone.app.record.getSpaceElement(spaceId);
      if (tabSpace) {
        if (tabSpace.children.length === 0) { // 二重追加を防止
          tabSpace.style.display = 'flex';
          tabSpace.style.flexWrap = 'wrap';
          buttonLayout[spaceId].forEach(buttonKey => {
            tabSpace.appendChild(buttons[buttonKey]);
          });
        }
      } else {
        console.error(`スペース要素 "${spaceId}" が見つかりません。フォーム設定を確認してください。`);
      }
    }

    // --- 初期表示 ---
    tagView('All', buttons);

    return e;
  });

})();
