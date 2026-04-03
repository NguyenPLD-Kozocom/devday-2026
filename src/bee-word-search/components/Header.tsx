import gameBanner from '../assets/game_banner.png';
import logoKozocom from '../assets/logo_kozocom2.png';

export function Header() {
  return (
    <header className="flex justify-between items-center w-full px-12 py-4 absolute top-12 left-0 z-50 pointer-events-none">
      <div className="flex items-start">
        <img
          src={gameBanner}
          alt="Ong Tìm Chữ"
          className="h-[190px] object-contain drop-shadow-xl"
        />
      </div>

      <div className="flex items-center pt-4">
        <img
          src={logoKozocom}
          alt="Kozocom"
          className="h-[42px] object-contain mr-5 mb-12"
        />
      </div>
    </header>
  );
}
