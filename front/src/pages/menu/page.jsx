import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { routes } from "../../constants/routes";
import CoinInfoDisplay from "../../components/CoinInfoDisplay"; // InfoPopup 컴포넌트 불러오기

function MenuPage() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate(routes.login);
    }
  }, [navigate]);

  const handlePopupOpen = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/image/background.png')" }}
    >
      {/* 코인 및 정보 팝업 */}
      <CoinInfoDisplay message="# 이 게임에 대한 정보입니다.  <u>dd</u> **운동을 통해 에너지를 모아보세요!**" />

      {/* 가운데 5개 아이콘 메뉴 */}
      <div className="flex flex-col items-center justify-center h-full space-y-8 font-sans">
        <h1
          className="text-3xl text-white mb-6 font-semibold font-sans"
          style={{
            textShadow: "0 0 10px rgba(255, 255, 255, 0.5)", // 흰색 블러 효과
          }}
        >
          피트니스 히어로, 에너지를 모아라!
        </h1>
        <div className="flex space-x-20 text-xl font-medium">
          <Link to={routes.story} className="flex flex-col items-center">
            <img
              src="/image/menu/story_icon.png"
              alt="Story"
              className="w-28 h-28"
            />
            <p className="text-white mt-3">스토리</p>
          </Link>
          <Link to={routes.focus} className="flex flex-col items-center">
            <img
              src="/image/menu/focus_icon.png"
              alt="Focus"
              className="w-28 h-28"
            />
            <p className="text-white mt-3">집중 운동</p>
          </Link>
          <Link to={routes.friend} className="flex flex-col items-center">
            <img
              src="/image/menu/together_icon.png"
              alt="Group"
              className="w-28 h-28"
            />
            <p className="text-white mt-3">같이 운동</p>
          </Link>
          <Link to={routes.character} className="flex flex-col items-center">
            <img
              src="/image/menu/character_icon.png"
              alt="Character"
              className="w-28 h-28"
            />
            <p className="text-white mt-3">캐릭터</p>
          </Link>
          <Link to={routes.mypage} className="flex flex-col items-center">
            <img
              src="/image/menu/mypage_icon.png"
              alt="Mypage"
              className="w-28 h-28"
            />
            <p className="text-white mt-3">마이페이지</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default MenuPage;
