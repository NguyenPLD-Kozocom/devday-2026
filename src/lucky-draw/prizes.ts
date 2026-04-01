// @ts-nocheck
import frame1st from './assets/1st-frame.svg';
import frame2nd from './assets/2nd-frame.svg';
import frame3rd from './assets/3rd-frame.svg';
import img1st from './assets/1st.png';
import img2nd from './assets/2nd.png';
import img3rd from './assets/3rd.png';

export const PRIZE_IDS = /** @type {const} */ ({
  gold: 'gold',
  silver: 'silver',
  bronze: 'bronze',
});

/** @typedef {'gold' | 'silver' | 'bronze'} PrizeId */

/** @type {Array<{
 *   id: PrizeId,
 *   label: string,
 *   name: string,
 *   frame: string,
 *   image: string,
 *   isMain?: boolean,
 *   labelBg: string,
 *   panelGradient: string,
 *   panelBg: string,
 * }>} */
export const PRIZES = [
  {
    id: PRIZE_IDS.silver,
    label: 'GIẢI BẠC',
    name: 'SMART WATCH MIBAND 10',
    frame: frame2nd,
    image: img2nd,
    labelBg: 'linear-gradient(180deg, #35A3EF 0%, #0039BB 100%)',
    panelGradient: 'linear-gradient(180deg, #35A3EF 0%, #0039BB 100%)',
    panelBg: 'rgba(1, 41, 161, 0.7)',
  },
  {
    id: PRIZE_IDS.gold,
    label: 'GIẢI VÀNG',
    name: 'SCREEN: LG 24K',
    frame: frame1st,
    image: img1st,
    labelBg: 'linear-gradient(180deg, #FFD54F 0%, #FF8F00 100%)',
    panelGradient: 'linear-gradient(180deg, #FFD54F 0%, #FF8F00 100%)',
    panelBg: 'rgba(93, 49, 0, 0.55)',
    isMain: true,
  },
  {
    id: PRIZE_IDS.bronze,
    label: 'GIẢI ĐỒNG',
    name: 'KEYBOARD AULA F75',
    frame: frame3rd,
    image: img3rd,
    labelBg: 'linear-gradient(180deg, #F38B55 0%, #A64B21 100%)',
    panelGradient: 'linear-gradient(180deg, #F38B55 0%, #A64B21 100%)',
    panelBg: 'rgba(54, 20, 7, 0.65)',
  },
];

/** @param {PrizeId} prizeId */
export const getPrizeById = (prizeId) => {
  const prize = PRIZES.find((p) => p.id === prizeId);
  return prize ?? PRIZES[0];
};

