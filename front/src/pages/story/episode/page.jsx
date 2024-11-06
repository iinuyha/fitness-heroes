import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../../constants/routes";
import Popup from "../../../components/Popup";
import CoinInfoDisplay from "../../../components/CoinInfoDisplay";
import ReturnDisplay from "../../../components/ReturnDisplay";
import { getStoryEpisode } from "../api"; // API 함수 가져오기
import { useLocation } from "react-router-dom";

function EpisodePage() {
  const location = useLocation();
  const { concern } = location.state || {};
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [episode, setEpisode] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token"); // JWT 토큰을 localStorage에서 가져오기

        // 관심사와 성별 정보 가져오기
        const storyData = await getStoryEpisode(token);
        setEpisode(storyData); // epCards 배열에 저장
      } catch (error) {
        console.error("Failed to fetch story data:", error);
        handlePopupOpen("스토리 데이터를 불러오는 중 오류가 발생했습니다.");
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
          <div className="flex flex-col items-center">
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
          </div>
        </div>

        {/* 에피소드 카드 */}
        <div className="flex flex-wrap justify-center mt-8 space-x-4">
          {episode.map((epCard, index) => (
            <div
              key={epCard.episode || index}
              className="bg-white bg-opacity-80 rounded-lg p-4 w-1/4 text-center text-gray-800 shadow-md"
            >
              <h3 className="font-semibold text-lg">
                에피소드 {epCard.episode}
              </h3>
              <ul className="text-left mt-4">
                {epCard.exe_name.map((exe, i) => (
                  <li key={i} className="mb-2">
                    {exe} | {epCard.exe_set[i]}회 X {epCard.count[i]}세트
                  </li>
                ))}
              </ul>
              <button
                className="bg-blue-500 text-white mt-4 py-2 px-6 rounded-lg font-semibold"
                onClick={() => handlePopupOpen("오늘의 에피소드를 진행하세요.")}
              >
                게임 시작
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EpisodePage;
