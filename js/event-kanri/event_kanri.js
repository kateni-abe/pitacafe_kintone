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
    // ボタンの共通スタイルを設定
    Object.assign(button.style, {
      height: '40px',
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
    const fieldsForB = ['参加園リスト', '参加法人リスト'];
    const fieldsForC = ['参加者リスト', '出席者数', 'キャンセル者数', '欠席者数', '合計'];
    const fieldsForD = ['運営手配', '備品セットを検索', '備品リスト'];
    const fieldsForE = ['設営撤収'];
    const fieldsForF = ['予算集計', '費用明細表'];
    const fieldsForG = ['開催目的'];
    const fieldsForH = ['議事録・メモ'];
    const fieldsForI = ['告知関連'];

    // 管理対象の全フィールドコードの重複をなくしたリストを作成
    const allFields = [...new Set([
      ...fieldsForA, ...fieldsForB, ...fieldsForC, ...fieldsForD,
      ...fieldsForE, ...fieldsForF, ...fieldsForG, ...fieldsForH, ...fieldsForI
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
      ButtonA: createButton('ButtonA', 'イベント概要'),
      ButtonB: createButton('ButtonB', '参加園・法人リスト'),
      ButtonC: createButton('ButtonC', '参加者'),
      ButtonD: createButton('ButtonD', '会場・備品手配'),
      ButtonE: createButton('ButtonE', '設営・撤収'),
      ButtonF: createButton('ButtonF', '予算管理'),
      ButtonG: createButton('ButtonG', '開催目的'),
      ButtonH: createButton('ButtonH', '議事録・メモ'),
      ButtonI: createButton('ButtonI', '告知関連'),
      ButtonAll: createButton('ButtonAll', '全表示')
    };

    // --- クリックイベントの設定 ---
    Object.keys(buttons).forEach(key => {
      const shortKey = key.replace('Button', ''); // 'ButtonA' -> 'A'
      buttons[key].onclick = () => tagView(shortKey.toLowerCase(), buttons);
    });
    // 'All'ボタンだけは特別なので上書き
    buttons.ButtonAll.onclick = () => tagView('All', buttons);

    // --- ボタンをスペースに配置 ---
    const tabSpace = kintone.app.record.getSpaceElement('TAB_ID');
    if (tabSpace) {
      if (tabSpace.children.length === 0) {
        tabSpace.style.display = 'flex';
        tabSpace.style.flexWrap = 'wrap';
        
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

  // レコード送信時の処理（参加者リストのNo.を自動採番）
  kintone.events.on(['app.record.create.submit', 'app.record.edit.submit'], function (event) {
    const record = event.record;
    // 参加者リストテーブルが存在し、行がある場合のみ処理
    if (record.参加者リスト && record.参加者リスト.value.length > 0) {
      record.参加者リスト.value.forEach((row, index) => {
        row.value.no.value = index + 1;
      });
    }
    return event;
  });

})();
