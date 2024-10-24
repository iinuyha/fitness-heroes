import React, { useState, useEffect } from "react";
import Popup from "./Popup"; // Popup 컴포넌트 불러오기

function CoinInfoDisplay({ message }) {
  const [coinCount, setCoinCount] = useState(0); // 코인 숫자를 상태로 관리
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // DB에서 코인 데이터를 불러오는 함수
  const fetchCoinCount = async () => {
    try {
      // 여기에 실제로 API 요청을 통해 코인 데이터를 불러오는 로직 추가
      const response = await fetch("/api/coin-count"); // 예시 API
      const data = await response.json();
      setCoinCount(data.coinCount);
    } catch (error) {
      console.error("Failed to fetch coin count:", error);
    }
  };

  useEffect(() => {
    // 컴포넌트가 처음 렌더링될 때 코인 데이터를 불러옴
    fetchCoinCount();
  }, []);

  // 팝업 열기/닫기 핸들러
  const handlePopupOpen = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  return (
    <div className="absolute top-4 right-4 flex items-center space-x-16">
      {/* 코인 표시 */}
      <div className="flex items-center">
        <img src="/image/menu/coin_icon.png" alt="Coin" className="w-8 h-8" />
        <p className="text-white text-2xl ml-2">{coinCount}</p>
      </div>

      {/* 정보 아이콘 및 팝업 */}
      <div>
        <button onClick={handlePopupOpen}>
          <img src="/image/info_icon.png" alt="Info" className="w-8 h-8" />
        </button>
        {isPopupOpen && (
          <Popup
            message={message} // props로 받은 메시지 전달
            onClose={handlePopupOpen} // 닫기 핸들러 전달
          />
        )}
      </div>
    </div>
  );
}

export default CoinInfoDisplay;
