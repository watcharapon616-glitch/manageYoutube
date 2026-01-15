import React, { useState, useEffect } from "react";
import Mainserv from "./Mainserv.json";
import IM_serv from "./IM_serv.json";
import { OnlineRec, tk, tkState } from "../Recoil/MainRecoil";
import { useRecoilValue } from "recoil";
import Cookies from "universal-cookie";
import { getRecoil, getRecoilPromise, setRecoil } from "recoil-nexus";
import Auth from "./Auth";
import axios, { AxiosResponse, CancelToken, CancelTokenSource } from "axios";
import auhv from "./auhv.json";
import { MsgOK, MsgWarning } from "./dialog";
const { AuthenticateEX } = auhv;
const cookies = new Cookies();

export const timeout = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export function ResolveUrl(url: string) {
  const { MainAPIserv } = Mainserv;
  return url.replace("~/", MainAPIserv);
}

export async function GetdataAPI_Outside(
  url: string,
  databody: any = {},
  ccToken?: CancelTokenSource
) {
  let data;
  let token = undefined;
  if (ccToken !== undefined) {
    token = ccToken.token;
  }
  const online = await getRecoilPromise(OnlineRec);
  if (online.isOnline) {
    data = await axios
      .post(ResolveUrl("~" + url), JSON.stringify(databody), {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          Authenticate: AuthenticateEX,
          sys: "App",
        },
        cancelToken: token,
      })
      .then((res) => res.data)
      .then(async (response) => {
        return response;
      })
      .catch((error) => {
        if (axios.isCancel(error)) {
          return { Status: "Cancle" };
        } else {
          MsgWarning("Something went wrong");
          console.error("Error:", error);
          return { Status: "Error" };
        }
      });
  } else {
    MsgWarning("Now,you are Offline\r\nPlease check your internet");
    data = { Status: "Offline" };
  }

  console.log("call API");

  return data;
}

export async function GetdataAPI(
  url: string,
  databody: any = {},
  ccToken?: CancelTokenSource
) {
  console.log("call API");
  let token = undefined;
  if (ccToken !== undefined) {
    token = ccToken.token;
  }
  let data;
  const online = await getRecoilPromise(OnlineRec);
  const tkmstate = await getRecoilPromise(tkState);
  if (online.isOnline) {
    data = await axios
      .post(ResolveUrl("~" + url), JSON.stringify(databody), {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          Authorization: "bearer " + tkmstate.mtk,
          sys: "WebApp",
        },
        cancelToken: token,
      })
      .then(async (res) => {
        /*const ret = await GetdataAPISection(url, databody, res, ccToken); */
        const ret = res.data;
        return ret;
      })
      .then((response) => response)
      .catch(async (error) => {
        if (axios.isCancel(error)) {
          return { Status: "Cancle" };
        } else if (error.response) {
          if ((error.response.status = 401)) {
            const ret = await GetdataAPISection(url, databody, ccToken);
            return ret;
          } else {
            MsgWarning("Something went wrong");
            return { Status: "Error" };
          }
        } else {
          MsgWarning("Something went wrong");
          return { Status: "Error" };
        }
      });
  } else {
    MsgWarning("Now,you are Offline\r\nPlease check your internet");
    data = { Status: "Offline" };
  }

  return data;
}

const GetdataAPISection = async (
  url: string,
  databody: any = {},
  ccToken?: CancelTokenSource
) => {
  const tkmstate = await getRecoilPromise(tkState);
  let token = undefined;
  if (ccToken !== undefined) {
    token = ccToken.token;
  }

  const datamtk: string = await axios
    .post(
      ResolveUrl("~" + "/token"),
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: tkmstate.rtk,
      }),
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        cancelToken: token,
      }
    )
    .then((res) => {
      return res.data;
    })
    .then((response) => {
      if ("error" in response) {
        cookies.remove("mtk", { path: "/" });
        cookies.remove("rtk", { path: "/" });
        Auth.setMtk();

        return "";
      } else {
        const mtk = response.access_token;
        const rtk = response.refresh_token;
        const t = new Date(new Date());
        t.setDate(t.getDate() + 1);

        cookies.set("mtk", mtk, {
          path: "/",
          sameSite: "lax",
          expires: t,
        });
        cookies.set("rtk", rtk, {
          path: "/",
          sameSite: "lax",
          expires: t,
        });
        Auth.setMtk();
        return mtk;
      }
    })
    .catch((error) => {
      if (axios.isCancel(error)) {
        console.error("Cancle:", error);
      } else {
      }

      return "";
    });
  if (datamtk !== "") {
    const data = await axios
      .post(ResolveUrl("~" + url), JSON.stringify(databody), {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          Authorization: "bearer " + datamtk,
          sys: "WebApp",
        },
        cancelToken: token,
      })
      .then((res) => res.data)
      .then(async (response) => {
        return response;
      })
      .catch((error) => {
        if (axios.isCancel(error)) {
          return { Status: "Cancle" };
        } else {
          MsgWarning("Something went wrong");
          console.error("Error:", error);
          return { Status: "Error" };
        }
      });

    return data;
  } else {
    Auth.LogOut();
    return { Status: "Unauthorized", Data: datamtk };
  }
};

function ResolveIM_Url(url: string) {
  const { MainAPIserv } = IM_serv;
  return url.replace("~/", MainAPIserv);
}

export async function GetdataIM_API(url: string, databody: any = {}) {
  const tkmstate = await getRecoilPromise(tkState);
  const data = await fetch(ResolveIM_Url("~" + url), {
    body: JSON.stringify(databody),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  console.log("call API");
  return data;
}

export const resizeImg = (files, size) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      const img = new Image();
      img.onload = function (ev) {
        // var resizedDataUrl = this.resizeImage(img);
        console.log(ev);
        const ratio = size / img.width;
        const canvas = document.createElement("canvas");
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const resizedDataUrl = canvas.toDataURL("image/jpeg", 0.5);
        resolve(resizedDataUrl);
      };
      img.src = String(e.target.result);
    };
    reader.readAsDataURL(files);
  });
