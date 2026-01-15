import { custom } from "devextreme/ui/dialog";

export const MsgOK = async (
  header: string,
  text: string,
  btntext: string = "ตกลง"
) => {
  let myDialog = custom({
    showTitle: true,
    title: header,
    messageHtml: `<div class='text-center'><div class='text-md'>${text}</div></div>`,
    buttons: [
      {
        text: btntext,
        type: "default",
        stylingMode: "text",
        focusStateEnabled: false,
        onClick: (e) => {
          return "OK";
        },
      },
    ],
  });
  const ret = await myDialog.show().then((ret) => {
    return ret;
  });
  return ret;
};
export async function MsgOKCancel(
  header: string,
  text: string,
  Lbtntext: string = "OK",
  Rbtntext: string = "Cancel"
) {
  let myDialog = custom({
    showTitle: false,
    messageHtml: `<div class='text-center'><div class='text-xl font-bold'>${header}</div><div class='text-md'>${text}</div></div>`,
    buttons: [
      {
        text: Lbtntext,
        type: "default",
        stylingMode: "text",
        focusStateEnabled: false,
        onClick: (e) => {
          return "OK";
        },
      },
      {
        text: Rbtntext,
        type: "danger",
        stylingMode: "text",
        focusStateEnabled: false,
        onClick: (e) => {
          return "Cancel";
        },
      },
      // ...
    ],
  });
  const ret = await myDialog.show().then((ret) => {
    return ret;
  });
  return ret;
}
export const MsgWarning = async (text: string) => {
  let myDialog = custom({
    showTitle: false,
    messageHtml: `
    <div class='text-center '><div class='text-md mb-7 mt-5'><i class="fas fa-exclamation"></i></div></div>
    <div class='text-center'><div class='text-md'>${text}</div></div>`,
    buttons: [
      {
        text: "OK",
        type: "default",
        stylingMode: "text",
        focusStateEnabled: false,
        onClick: (e) => {
          return "OK";
        },
      },
    ],
  });
  const ret = await myDialog.show().then((ret) => {
    return ret;
  });
  return ret;
};
