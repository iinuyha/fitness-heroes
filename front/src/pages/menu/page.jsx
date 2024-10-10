import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { routes } from '../../constants/routes';

function MenuPage() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handlePopupOpen = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  return (
    <div className="relative w-full h-screen bg-cover bg-center" style={{ backgroundImage: "url('/image/background.png')" }}>
      
      {/* 좌측 상단 코인 이미지 및 숫자 */}
      <div className="absolute top-4 left-4 flex items-center">
        <img src="/image/menu/coin_icon.png" alt="Coin" className="w-10 h-10" />
        <p className="text-white text-2xl ml-2">9</p>
      </div>

      {/* 우측 상단 i 아이콘 */}
      <div className="absolute top-4 right-4">
        <button onClick={handlePopupOpen}>
          <img src="/image/info_icon.png" alt="Info" className="w-8 h-8" />
        </button>
      </div>

      {/* 팝업창 */}
      {isPopupOpen && (
        <div className="absolute top-12 right-4 bg-white p-4 rounded shadow-lg">
          <p>이 게임에 대한 정보입니다.</p>
          <button className="mt-2 bg-blue-500 text-white py-1 px-4 rounded" onClick={handlePopupOpen}>
            닫기
          </button>
        </div>
      )}

      {/* 가운데 5개 아이콘 메뉴 */}
      <div className="flex flex-col items-center justify-center h-full space-y-8 font-sans">
        <h1 className="text-3xl text-white mb-6 font-sans">피트니스 히어로, 체력을 지켜라!</h1>
        <div className="flex space-x-20">
          <Link to={routes.story} className="flex flex-col items-center">
            <img src="/image/menu/story_icon.png" alt="Story" className="w-28 h-28" />
            <p className="text-white mt-2">스토리</p>
          </Link>
          <Link to={routes.focusExercise} className="flex flex-col items-center">
            <img src="/image/menu/focus_icon.png" alt="Focus" className="w-28 h-28" />
            <p className="text-white mt-2">집중 운동</p>
          </Link>
          <Link to={routes.groupExercise} className="flex flex-col items-center">
            <img src="/image/menu/together_icon.png" alt="Group" className="w-28 h-28" />
            <p className="text-white mt-2">같이 운동</p>
          </Link>
          <Link to={routes.character} className="flex flex-col items-center">
            <img src="/image/menu/mypage_icon.png" alt="Character" className="w-28 h-28" />
            <p className="text-white mt-2">캐릭터</p>
          </Link>
          <Link to={routes.shop} className="flex flex-col items-center">
            <img src="/image/menu/store_icon.png" alt="Shop" className="w-28 h-28" />
            <p className="text-white mt-2">상점</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default MenuPage;
