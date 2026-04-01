// @ts-nocheck
import frame1st from "./assets/1st-frame.svg";
import frame2nd from "./assets/2nd-frame.svg";
import frame3rd from "./assets/3rd-frame.svg";
import img1st from "./assets/1st.png";
import img2nd from "./assets/2nd.png";
import img3rd from "./assets/3rd.png";
import prizeDetail1st from "./assets/1st-prize.svg";
import prizeDetail2nd from "./assets/2nd-prize.svg";
import prizeDetail3rd from "./assets/3rd-prize.svg";

export const PRIZE_IDS = /** @type {const} */ {
  gold: "gold",
  silver: "silver",
  bronze: "bronze",
};

/** @typedef {'gold' | 'silver' | 'bronze'} PrizeId */

/** @type {Array<{
 *   id: PrizeId,
 *   label: string,
 *   name: string,
 *   frame: string,
 *   image: string,
 *   detailImage: string,
 *   detailImageSize?: {
 *     width: string,
 *     height: string,
 *   },
 *   detailImagePosition?: {
 *     bottom: string,
 *   },
 *   isMain?: boolean,
 * }>} */
export const PRIZES = [
  {
    id: PRIZE_IDS.silver,
    label: "GIẢI BẠC",
    name: "SMART WATCH MIBAND 10",
    frame: frame2nd,
    image: img2nd,
    detailImage: prizeDetail2nd,
    detailImageSize: {
      width: "700px",
      height: "480px",
    },
    detailImagePosition: {
      bottom: "-10px",
    },
  },
  {
    id: PRIZE_IDS.gold,
    label: "GIẢI VÀNG",
    name: "SCREEN: LG 24K",
    frame: frame1st,
    image: img1st,
    detailImage: prizeDetail1st,
    detailImageSize: {
      width: "600px",
      height: "480px",
    },
    detailImagePosition: {
      bottom: "-60px",
    },
    isMain: true,
  },
  {
    id: PRIZE_IDS.bronze,
    label: "GIẢI ĐỒNG",
    name: "KEYBOARD AULA F75",
    frame: frame3rd,
    image: img3rd,
    detailImage: prizeDetail3rd,
    detailImageSize: {
      width: "700px",
      height: "480px",
    },
    detailImagePosition: {
      bottom: "-150px",
    },
  },
];

/** @param {PrizeId} prizeId */
export const getPrizeById = (prizeId) => {
  const prize = PRIZES.find((p) => p.id === prizeId);
  return prize ?? PRIZES[0];
};
