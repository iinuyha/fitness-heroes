import React, { useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../constants/routes";
import Popup from "../../components/Popup";
import CoinInfoDisplay from "../../components/CoinInfoDisplay";
import ReturnDisplay from "../../components/ReturnDisplay";

function CharacterPage() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [selectedSkin, setSelectedSkin] = useState("회원복"); // 기본 선택 스킨

  const handlePopupOpen = (message) => {
    setPopupMessage(message);
    setIsPopupOpen(true);
  };

  const skins = ["회원복", "초급자", "중급자", "고인물"]; // 스킨 목록

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/image/background.png')" }}
    >
      {/* 뒤로가기 버튼 */}
      <ReturnDisplay />

      {/* 코인 및 정보 팝업 */}
      <CoinInfoDisplay message="캐릭터 페이지 관련된 설명 적으면 됨" />

      {/* 팝업창 */}
      {isPopupOpen && (
        <Popup message={popupMessage} onClose={() => setIsPopupOpen(false)} />
      )}

      <div className="flex flex-col items-center justify-center h-full space-y-8 font-sans">
        <h1
          className="text-3xl text-white mb-6 font-semibold"
          style={{
            textShadow: "0 0 10px rgba(255, 255, 255, 0.5)", // 흰색 블러 효과
          }}
        >
          캐릭터
        </h1>

        {/* 캐릭터 이미지 */}
        <div className="flex space-x-20 items-center">
          {/* 왼쪽 캐릭터 */}
          <div className="bg-white bg-opacity-10 rounded-lg p-8">
            <img
              src={`/image/skin/character/크로_${selectedSkin}.png`}
              alt="캐릭터 이미지"
              className="h-80 mx-auto"
            />
          </div>

          {/* 오른쪽 보유 스킨 선택 */}
          <div className="bg-white bg-opacity-10 rounded-lg p-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">보유 스킨</h2>

              {/* 상점 아이콘과 텍스트 */}
              <Link
                to={routes.store}
                className="flex items-center text-white font-semibold space-x-2 border-2 border-white rounded-xl px-2"
              >
                상점 &gt;
              </Link>
            </div>

            <div className="flex space-x-4">
              {skins.map((skin) => (
                <div
                  key={skin}
                  onClick={() => setSelectedSkin(skin)}
                  className={`p-4 rounded-lg cursor-pointer ${
                    selectedSkin === skin
                      ? "bg-blue-400"
                      : "bg-white bg-opacity-20"
                  }`}
                >
                  <img
                    src={`/image/skin/skin/${skin}.png`}
                    alt={`${skin} 이미지`}
                    className="h-60"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CharacterPage;
