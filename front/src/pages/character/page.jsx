import React, { useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../constants/routes";
import Popup from "../../components/Popup"; // 팝업 컴포넌트 가져오기
import CoinInfoDisplay from "../../components/CoinInfoDisplay";
import ReturnDisplay from "../../components/ReturnDisplay";

function CharacterPage() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const handlePopupOpen = (message) => {
    setPopupMessage(message);
    setIsPopupOpen(true);
  };

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/image/background.png')" }}
    >
      {/* 뒤로가기 버튼 */}
      <ReturnDisplay />

      {/* 코인 및 정보 팝업 */}
      <CoinInfoDisplay message="마이페이지 관련된 설명 적으면 됨" />

      {/* 팝업창 */}
      {isPopupOpen && (
        <Popup
          message={popupMessage}
          onClose={() => setIsPopupOpen(false)} // 닫기 핸들러 전달
        />
      )}

      <div className="flex flex-col items-center justify-center h-full space-y-8 font-sans">
        <h1
          className="text-3xl text-white mb-6 font-semibold font-sans"
          style={{
            textShadow: "0 0 10px rgba(255, 255, 255, 0.5)", // 흰색 블러 효과
          }}
        >
          캐릭터
        </h1>

        {/* 가운데 3개 아이콘 메뉴 */}
        <div className="flex space-x-28"></div>
      </div>
    </div>
  );
}

export default CharacterPage;
