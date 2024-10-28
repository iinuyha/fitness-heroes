import React, { useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../constants/routes";
import Popup from "../../components/Popup";
import CoinInfoDisplay from "../../components/CoinInfoDisplay";
import ReturnDisplay from "../../components/ReturnDisplay";

function StorePage() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [ownedSkins, setOwnedSkins] = useState(["회원복"]); // 보유한 스킨 초기값

  const handlePopupOpen = (message) => {
    setPopupMessage(message);
    setIsPopupOpen(true);
  };

  // 스킨 목록과 가격
  const skins = [
    {
      id: "회원복",
      name: "회원복 스킨",
      price: 0,
      image: "/image/skin/skin/회원복.png",
    },
    {
      id: "초급자",
      name: "초급자 스킨",
      price: 30,
      image: "/image/skin/skin/초급자.png",
    },
    {
      id: "중급자",
      name: "중급자 스킨",
      price: 60,
      image: "/image/skin/skin/중급자.png",
    },
    {
      id: "고인물",
      name: "고인물 스킨",
      price: 100,
      image: "/image/skin/skin/고인물.png",
    },
  ];

  const handlePurchase = (skinId) => {
    if (!ownedSkins.includes(skinId)) {
      setOwnedSkins([...ownedSkins, skinId]);
      handlePopupOpen(`${skinId} 스킨을 구매했습니다!`);
    }
  };

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/image/background.png')" }}
    >
      {/* 뒤로가기 버튼 */}
      <ReturnDisplay />

      {/* 코인 및 정보 팝업 */}
      <CoinInfoDisplay message="상점 페이지 관련된 설명 적으면 됨" />

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
          상점
        </h1>

        {/* 스킨 카드 목록 */}
        <div className="flex space-x-8">
          {skins.map((skin) => (
            <div
              key={skin.id}
              className="bg-blue-500 bg-opacity-20 p-6 rounded-lg text-center text-white w-48"
            >
              <h2 className="text-lg font-semibold mb-4">{skin.name}</h2>
              <img
                src={skin.image}
                alt={skin.name}
                className="h-40 mx-auto mb-4"
              />
              <div className="flex items-center justify-center mb-4">
                <img
                  src="/image/menu/coin_icon.png"
                  alt="코인 아이콘"
                  className="h-6 w-6 mr-2"
                />
                <span className="text-yellow-400 text-xl font-bold">
                  {skin.price}
                </span>
              </div>
              {ownedSkins.includes(skin.id) ? (
                <p className="text-green-300 font-semibold">보유 중</p>
              ) : (
                <button
                  onClick={() => handlePurchase(skin.id)}
                  className="bg-blue-400 text-white px-4 py-2 rounded-full"
                >
                  구매
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StorePage;
