/*
 * このJavaScriptは、Kintoneアプリにおいて「案件タグ」フィールド（Proposed_plan）の値に応じて、
 * 「進捗ステータス」フィールド（progress_status）の選択肢を動的に変更します。
 *
 * ■機能概要
 * フォームに配置した「スペース」要素内に、カスタムのドロップダウンを生成します。
 * 「案件タグ」フィールドの値が変わると、カスタムドロップダウンの選択肢が連動して変わります。
 * ここで選択された値が、Kintoneの「進捗ステータス」フィールドに保存されます。
 *
 * ■【重要】事前設定
 * 1. Kintoneアプリのフォーム設定で、進捗ステータスを表示したい場所に「スペース」フィールドを配置します。
 * 2. 配置した「スペース」フィールドの設定を開き、「要素ID」に `custom_status_spacer` と設定してください。
 * 3. このスクリプトは、「Proposed_plan」（案件タグ）と「progress_status」（進捗ステータス）という
 * フィールドコードが存在することを前提としています。実際のフィールドコードに合わせて修正してください。
 */
(function() {
  "use strict";

  // --- 設定項目 ---
  const config = {
    // 連動のトリガー（きっかけ）となるフィールドのコード
    triggerField: 'Proposed_plan',
    // 値を保存するターゲットとなるフィールドのコード
    targetField: 'progress_status',
    // フォームに配置したスペース要素のID
    spacerId: 'custom_status_spacer',
    // 「案件タグ」の値と、「進捗ステータス」の選択肢の対応表
    optionsMap: {
      'ぴたワーク': ['新規', '初回連絡済', '面談中', '条件提示', '内定', '成約', '失注', '来年度フォロー'],
      'LINEコンサル': ['新規', '提案中', '見積提出', '受注', '納品', '完了', '失注'],
      // 他のタグも必要に応じて追加
    }
  };
  // --- 設定はここまで ---


  /**
   * カスタムドロップダウンを作成・更新する関数
   * @param {object} event Kintoneのイベントオブジェクト
   */
  const updateCustomDropdown = (event) => {
    const record = event.record;
    const triggerValue = record[config.triggerField].value;
    const targetFieldObject = record[config.targetField];

    // スペース要素を取得
    const spaceElement = kintone.app.record.getSpaceElement(config.spacerId);
    if (!spaceElement) {
      // スペースが見つからない場合はエラーをコンソールに出力して終了
      console.error(`Error: Spacer element with ID "${config.spacerId}" not found.`);
      return;
    }

    // スペース内の既存の要素をクリア
    spaceElement.innerHTML = '';

    // 表示すべき選択肢のリストを取得
    const options = (triggerValue && config.optionsMap[triggerValue]) ? config.optionsMap[triggerValue] : [];

    // 選択肢がない場合は、保存先のフィールドの値をクリアして終了
    if (options.length === 0) {
      if (targetFieldObject) {
          targetFieldObject.value = '';
      }
      return;
    }

    // <select>要素（ドロップダウン）を新規作成
    const customSelect = document.createElement('select');
    // Kintone標準のスタイルを適用
    customSelect.classList.add('input-select-cybozu'); 

    // 先頭に空の選択肢「---」を追加
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '---';
    customSelect.appendChild(defaultOption);

    // 設定に基づいた選択肢を追加
    options.forEach(opt => {
      const optionElement = document.createElement('option');
      optionElement.value = opt;
      optionElement.textContent = opt;
      customSelect.appendChild(optionElement);
    });

    // Kintoneフィールドに保存されている値で、カスタムドロップダウンの初期選択状態を設定
    if (targetFieldObject) {
        customSelect.value = targetFieldObject.value || '';
    }

    // カスタムドロップダウンの値が変更されたら、Kintoneのフィールドに値をセットする
    customSelect.addEventListener('change', (e) => {
      if (targetFieldObject) {
        targetFieldObject.value = e.target.value;
      }
    });

    // 作成したドロップダウンをスペースに追加
    spaceElement.appendChild(customSelect);
  };

  // この処理を実行するイベントを指定
  const events = [
    'app.record.create.show',
    'app.record.edit.show',
    `app.record.create.change.${config.triggerField}`,
    `app.record.edit.change.${config.triggerField}`
  ];

  kintone.events.on(events, function(event) {
    // 元のターゲットフィールドを画面から隠す
    kintone.app.record.setFieldShown(config.targetField, false);
    
    // カスタムドロップダウンの作成/更新処理を実行
    updateCustomDropdown(event);

    return event;
  });
})();
