import axios from "axios";
import React, { useState, useEffect } from "react";
import { getRecoil, getRecoilPromise, setRecoil } from "recoil-nexus";
import Cookies from "universal-cookie";
import { GetdataAPI, ResolveUrl } from "../MainCall/MainCall";
import {
  Islogin,
  OnlineRec,
  tkState,
  userdata,
  UserState,
} from "../Recoil/MainRecoil";
import { MsgOK, MsgWarning } from "./dialog";
/* import auhv from "./auhv.json";
const { Authenticate } = auhv; */
const cookies = new Cookies();

const Login = async (Authenticate: string, user: string, pass: string) => {
  if (cookies.get("mtk") !== undefined) {
    cookies.remove("mtk", { path: "/" });
  }
  if (cookies.get("rtk") !== undefined) {
    cookies.remove("rtk", { path: "/" });
  }
  let data;
  const online = await getRecoilPromise(OnlineRec);
  if (online.isOnline) {
    data = await axios
      .post(
        ResolveUrl("~" + "/token"),
        new URLSearchParams({
          grant_type: "password",
          username: user,
          password: pass,
        }),
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            Authenticate: Authenticate,
          },
        }
      )
      .then((res) => {
        return res.data;
      })
      .then((response) => {
        if (!("error" in response)) {
          const mtk = response.access_token;
          const rtk = response.refresh_token;
          const ud = "[]";

          localStorage.setItem("ud", ud);
          localStorage.setItem("username", response.userName);

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
          setRecoil(Islogin, true);
        } else {
          localStorage.removeItem("ud");
          localStorage.removeItem("username");
          cookies.remove("mtk", { path: "/" });
          cookies.remove("rtk", { path: "/" });
        }

        setMtk();
        setUser();

        return { Status: "Success" };
      })
      .catch((error) => {
        LogOut();
        console.log(error.message);
        return { Status: "Unauthorized" };
      });
  } else {
    LogOut();
    MsgWarning("Now,you are Offline\r\nPlease check your internet");
    data = { Status: "Offline" };
  }

  return data;
};

const CurrentUser = async () => {
  const tkmstate = await getRecoilPromise(tkState);
  if (tkmstate.mtk !== "") {
    const muserstate = await getRecoilPromise(UserState);
    getRecoil<userdata>(UserState);
    return muserstate.username;
  } else {
    LogOut();
    return "";
  }
};

const RefreshDataUser = async () => {
  const tkmstate = await getRecoilPromise(tkState);
  if (tkmstate.mtk !== "") {
    const uud = await GetdataAPI("/api/Main/Profile").then((res) => {
      if (res.Status === "Unauthorized") {
      } else if (res.Status === "Success") {
        const ud = res.Data;
        localStorage.setItem("ud", JSON.stringify(ud));
        localStorage.setItem("username", ud.user_name);
        setUser();
      }
      return res;
    });
    setRecoil(Islogin, true);
    return uud;
  } else {
    LogOut();

    return { Status: "Unauthorized", Data: "" };
  }
};

const LogOut = async () => {
  console.log("logout");

  localStorage.removeItem("ud");
  localStorage.removeItem("username");
  cookies.remove("mtk", { path: "/" });
  cookies.remove("rtk", { path: "/" });

  setMtk();
  setUser();
  setRecoil(Islogin, false);
};

export const setMtk = () => {
  const mtk: string =
    cookies.get("mtk") === undefined ? "" : cookies.get("mtk");
  const rtk: string =
    cookies.get("rtk") === undefined ? "" : cookies.get("rtk");
  setRecoil(tkState, {
    mtk: mtk,
    rtk: rtk,
  });
};
export const setUser = () => {
  const user_username =
    localStorage.getItem("username") === null
      ? ""
      : localStorage.getItem("username");
  const ud =
    localStorage.getItem("ud") === null
      ? ""
      : JSON.parse(localStorage.getItem("ud"));
  setRecoil(UserState, {
    username: user_username,
    ud: ud,
  });
};

const Auth = { Login, LogOut, CurrentUser, RefreshDataUser, setMtk, setUser };

export default Auth;
