import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../../constants/routes";
import Popup from "../../../components/Popup"; // 팝업 컴포넌트 가져오기
import CoinInfoDisplay from "../../../components/CoinInfoDisplay";
import ReturnDisplay from "../../../components/ReturnDisplay";
import { getStoryEpisode } from "../api"; // API 함수 가져오기

function EpisodePage() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [concern, setConcern] = useState("근력"); // 예시로 "근력" 설정
  const [episode, setEpisode] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token"); // JWT 토큰을 localStorage에서 가져오기
        const data = await getStoryEpisode(token);
        setConcern(data[0].concern);
        setEpisode(data[0].episode);
      } catch (error) {
        console.error("Failed to fetch story data:", error);
      }
    };

    fetchData();
  }, []);

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
      <CoinInfoDisplay message="스토리모드 관련된 설명 적으면 됨" />

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
          <span className="text-[#90DEFF]">{concern} 지역</span>을 책임지고
          구출할 것!!
        </h1>

        {/* 가운데 5개 아이콘 메뉴 */}
        <div className="flex space-x-28 justify-center">
          {/* 선택된 concern */}
          <img className="flex flex-col items-center" alt={`${concern} 운동`}>
            <img
              src={`/image/concern/${concern}.png`}
              alt={`${concern} 운동`}
              className="w-52"
            />
            <div className="mt-4 w-full flex justify-center">
              <div className="bg-white py-2 px-8 rounded-full">
                <p className="text-[#00B2FF] text-xl font-bold">
                  {episode} / 33
                </p>
              </div>
            </div>
          </img>
        </div>
      </div>
    </div>
  );
}

export default EpisodePage;
