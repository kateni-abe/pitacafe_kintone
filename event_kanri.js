"use strict";

// 各タブボタンを作成
function createButton(id, text) {
  var button = document.createElement("button");
  button.id = id;
  button.innerHTML = text;
  button.style.height = "40px";
  button.style.width = "auto";
  button.style.minWidth = "120px";
  button.style.borderRadius = "10px 10px 0px 0px";
  button.style.backgroundColor = "white";
  button.style.border = "1px solid #CCCCCC";
  button.style.fontSize = "12px";
  button.style.paddingLeft = "20px";
  button.style.paddingRight = "20px";
  return button;
}

var ButtonAll = createButton("ButtonAll", "全表示");
var ButtonA = createButton("ButtonA", "イベント概要");
var ButtonB = createButton("ButtonB", "参加園・法人リスト");
var ButtonC = createButton("ButtonC", "参加者");
var ButtonD = createButton("ButtonD", "会場・備品手配");
var ButtonE = createButton("ButtonE", "設営・撤収");
var ButtonF = createButton("ButtonF", "予算管理");
var ButtonG = createButton("ButtonG", "開催目的");
var ButtonH = createButton("ButtonH", "議事録・メモ");
var ButtonI = createButton("ButtonI", "告知関連");

// kintoneのレコードイベントを監視し、レコードが表示される際に処理を実行する
kintone.events.on(["app.record.create.show", "app.record.edit.show", "app.record.detail.show"], function (e) {
  if (document.getElementById("eeButton") != null) {
    return;
  }

  var tabSpace = kintone.app.record.getSpaceElement("TAB_ID");

  tabSpace.appendChild(ButtonA);
  tabSpace.appendChild(ButtonB);
  tabSpace.appendChild(ButtonC);
  tabSpace.appendChild(ButtonD);
  tabSpace.appendChild(ButtonE);
  tabSpace.appendChild(ButtonF);
  tabSpace.appendChild(ButtonG);
  tabSpace.appendChild(ButtonH);
  tabSpace.appendChild(ButtonI);
  tabSpace.appendChild(ButtonAll);

  // 初期表示では全タグを表示
  tagView("a");
});

// ボタンのクリックイベントハンドラーを定義する
ButtonAll.onclick = function () {
  tagView("All");
  return false;
};
ButtonA.onclick = function () {
  tagView("a");
  return false;
};
ButtonB.onclick = function () {
  tagView("b");
  return false;
};
ButtonC.onclick = function () {
  tagView("c");
  return false;
};
ButtonD.onclick = function () {
  tagView("d");
  return false;
};
ButtonE.onclick = function () {
  tagView("e");
  return false;
};
ButtonF.onclick = function () {
  tagView("f");
  return false;
};
ButtonG.onclick = function () {
  tagView("g");
  return false;
};
ButtonH.onclick = function () {
  tagView("h");
  return false;
};
ButtonI.onclick = function () {
  tagView("i");
  return false;
};

// タグの表示を切り替える関数
function tagView(setInfo) {
  // すべてのボタンの背景色を白にする
  ButtonA.style.background = "white";
  ButtonB.style.background = "white";
  ButtonC.style.background = "white";
  ButtonD.style.background = "white";
  ButtonE.style.background = "white";
  ButtonF.style.background = "white";
  ButtonG.style.background = "white";
  ButtonH.style.background = "white";
  ButtonI.style.background = "white";
  ButtonAll.style.background = "white";

  // すべてのフィールドを非表示にする
  kintone.app.record.setFieldShown("イベント概要", false);
  kintone.app.record.setFieldShown("参加園リスト", false);
  kintone.app.record.setFieldShown("参加法人リスト", false);
  kintone.app.record.setFieldShown("参加者リスト", false);
  kintone.app.record.setFieldShown("出席者数", false);
  kintone.app.record.setFieldShown("キャンセル者数", false);
  kintone.app.record.setFieldShown("合計", false);
  kintone.app.record.setFieldShown("欠席者数", false);
  kintone.app.record.setFieldShown("運営手配", false);
  kintone.app.record.setFieldShown("備品セットを検索", false);
  kintone.app.record.setFieldShown("備品リスト", false);
  kintone.app.record.setFieldShown("設営撤収", false);
  kintone.app.record.setFieldShown("予算集計", false);
  kintone.app.record.setFieldShown("費用明細表", false);
  kintone.app.record.setFieldShown("開催目的", false);
  kintone.app.record.setFieldShown("議事録・メモ", false);
  kintone.app.record.setFieldShown("告知関連", false);

  switch (setInfo) {
    case "All":
      // すべてのフィールドを表示する
      kintone.app.record.setFieldShown("イベント概要", true);
      kintone.app.record.setFieldShown("参加園リスト", true);
      kintone.app.record.setFieldShown("参加法人リスト", true);
      kintone.app.record.setFieldShown("出席者数", true);
      kintone.app.record.setFieldShown("キャンセル者数", true);
      kintone.app.record.setFieldShown("欠席者数", true);
      kintone.app.record.setFieldShown("合計", true);
      kintone.app.record.setFieldShown("参加者リスト", true);
      kintone.app.record.setFieldShown("運営手配", true);
      kintone.app.record.setFieldShown("備品セットを検索", true);
      kintone.app.record.setFieldShown("備品リスト", true);
      kintone.app.record.setFieldShown("予算集計", true);
      kintone.app.record.setFieldShown("設営撤収", true);
      kintone.app.record.setFieldShown("費用明細表", true);
      kintone.app.record.setFieldShown("開催目的", true);
      kintone.app.record.setFieldShown("議事録・メモ", true);
      kintone.app.record.setFieldShown("告知関連", true);
      ButtonAll.style.background = "#F1C40F";
      break;
    case "a":
      ButtonA.style.background = "#F1C40F";
      kintone.app.record.setFieldShown("イベント概要", true);
      break;
    case "b":
      ButtonB.style.background = "#F1C40F";
      kintone.app.record.setFieldShown("参加園リスト", true);
      kintone.app.record.setFieldShown("参加法人リスト", true);
      break;
    case "c":
      ButtonC.style.background = "#F1C40F";
      kintone.app.record.setFieldShown("出席者数", true);
      kintone.app.record.setFieldShown("キャンセル者数", true);
      kintone.app.record.setFieldShown("欠席者数", true);
      kintone.app.record.setFieldShown("合計", true);
      kintone.app.record.setFieldShown("参加者リスト", true);
      break;
    case "d":
      ButtonD.style.background = "#F1C40F";
      kintone.app.record.setFieldShown("運営手配", true);
      kintone.app.record.setFieldShown("備品セットを検索", true);
      kintone.app.record.setFieldShown("備品リスト", true);
      break;
    case "e":
      ButtonE.style.background = "#F1C40F";
      kintone.app.record.setFieldShown("設営撤収", true);
      break;
    case "f":
      ButtonF.style.background = "#F1C40F";
      kintone.app.record.setFieldShown("予算集計", true);
      kintone.app.record.setFieldShown("費用明細表", true);
      break;
    case "g":
      ButtonG.style.background = "#F1C40F";
      kintone.app.record.setFieldShown("開催目的", true);
      break;
    case "h":
      ButtonH.style.background = "#F1C40F";
      kintone.app.record.setFieldShown("議事録・メモ", true);
      break;
    case "i":
      ButtonI.style.background = "#F1C40F";
      kintone.app.record.setFieldShown("告知関連", true);
      break;
  }

  return; // 処理の終了
}

// レコード送信時の処理
kintone.events.on(["app.record.create.submit", "app.record.edit.submit"], function (event) {
  const record = event.record;
  // receiptsテーブルのno欄を自動採番する
  const count = record.参加者リスト.value.length;
  for (let i = 0; i < count; i++) {
    record.参加者リスト.value[i].value.no.value = i + 1;
  }

  return event;
});
