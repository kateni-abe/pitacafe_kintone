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
    const fieldsForA = ['園名', 
                        '担当者名_園', 
                        '園長名', 
                        '園児定員数', 
                        '請求先', 
                        '備考_0', 
                        'TEL',
                        'FAX',
                        'メールアドレス_1', 
                        '用途_1', 
                        '備考_1', 
                        'メールアドレス_2', 
                        '用途_2', 
                        '備考_2', 
                        'メールアドレス_3', 
                        '用途_3', 
                        '備考_3', 
                        '郵便番号', 
                        '住所', 
                        '備考_4',
                        'パンフレット', 
                        '写真'];
    const fieldsForB = ['園名', 
                        '担当者名_園', 
                        '園長名',
                        '案件一覧'];
    const fieldsForC = ['園名', 
                        '担当者名_園', 
                        '園長名',
                        'コミュニケーション記録'];
    const fieldsForD = ['園名', 
                        '担当者名_園', 
                        '園長名',
                        'Field_trip_インターン_申込数・参加者数', 
                        '研修会・勉強会など_企画参加実績',
                        'ぴたカフェ貸切利用'];
    const fieldsForE = ['園名', 
                        '担当者名_園', 
                        '園長名',
                        '請求書'];
    const fieldsForF = ['園名', 
                        '担当者名_園', 
                        '園長名',
                        '担当者情報'];
    const fieldsForG = ['園名', 
                        '担当者名_園', 
                        '園長名',
                        '法人名検索',
                        '法人名',
                        '法人担当者名',
                        'コース',
                        '関連レコード一覧'];

    // 管理対象の全フィールドコードの重複をなくしたリストを作成
    const allFields = [...new Set([
      ...fieldsForA, ...fieldsForB, ...fieldsForC, ...fieldsForD,
      ...fieldsForE, ...fieldsForF, ...fieldsForG
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
      case 'f':
        fieldsToShow = fieldsForF;
        activeButton = buttons.ButtonF;
        break;
      case 'g':
        fieldsToShow = fieldsForG;
        activeButton = buttons.ButtonG;
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
      ButtonA: createButton('ButtonA', '園概要'),
      ButtonB: createButton('ButtonB', '案件一覧'),
      ButtonC: createButton('ButtonC', 'コミュニケーション記録'),
      ButtonD: createButton('ButtonD', '企画参加・集客実績'),
      ButtonE: createButton('ButtonE', '請求書一覧'),
      ButtonF: createButton('ButtonF', '園担当者情報'),
      ButtonG: createButton('ButtonG', '法人情報'),
      ButtonAll: createButton('ButtonAll', '全表示')
    };

    // --- クリックイベントの設定 ---
    Object.keys(buttons).forEach(key => {
      const shortKey = key.replace('Button', '').toLowerCase();
      buttons[key].onclick = () => tagView(shortKey, buttons);
    });
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

})();
