import { atom } from "recoil";
export interface data {
  cate: number;
  img: string;
}
export const countcart = atom<number>({
  key: "countcart",
  default: 0,
});

export const count = atom<number>({
  key: "count",
  default: 0,
});
export const FindIMG = atom<data>({
  key: "FindIMG",
  default: {
    cate: 0,
    img: "",
  },
});
