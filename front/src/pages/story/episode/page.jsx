import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../../constants/routes";
import Popup from "../../../components/Popup";
import CoinInfoDisplay from "../../../components/CoinInfoDisplay";
import ReturnDisplay from "../../../components/ReturnDisplay";
import { getStoryEpisode, getEpCardData, getUserGender } from "./api";

function EpisodePage() {
  const [concern, setConcern] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [episodes, setEpisodes] = useState([]);
  const [progressDisplay, setProgressDisplay] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token"); // JWT 토큰 가져오기
        const [storyEpisodes, exerciseEpisodes, gender] = await Promise.all([
          getStoryEpisode(),
          getEpCardData(token),
          getUserGender(token),
        ]);

        // 관심사 설정
        setConcern(storyEpisodes[0]?.concern || "");

        // 사용자가 가장 최근에 완료한 에피소드 찾기
        const lastCompletedEpisode = Math.max(
          ...storyEpisodes.map((episode) => episode.episode)
        );

        // 진행 상황 표시 설정
        setProgressDisplay(`${lastCompletedEpisode} / 33`);

        // 에피소드 카드 데이터 설정
        const episodeCards = exerciseEpisodes.map((exercise) => {
          const isCompleted = exercise.episode <= lastCompletedEpisode;
          const isNext = exercise.episode === lastCompletedEpisode + 1;
          return {
            ...exercise,
            buttonEnabled: isNext,
            isVisible: !isCompleted,
          };
        });
        setEpisodes(episodeCards);
      } catch (error) {
        console.error("Error setting up episode display:", error);
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
      <ReturnDisplay />
      <CoinInfoDisplay message="스토리모드 관련된 설명 적으면 됨" />

      {isPopupOpen && (
        <Popup message={popupMessage} onClose={() => setIsPopupOpen(false)} />
      )}

      <div className="flex flex-col items-center justify-center h-full space-y-8 font-sans">
        <h1
          className="text-3xl text-white mb-6 font-semibold font-sans"
          style={{
            textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
          }}
        >
          <span className="text-[#90DEFF]">{concern}</span> 지역
        </h1>

        <div className="flex space-x-28 justify-center">
          <div className="flex flex-col items-center">
            <img
              src={`/image/concern/${concern}.png`}
              alt={`${concern} 운동`}
              className="w-52"
            />
            <div className="mt-4 w-full flex justify-center">
              <div className="bg-white py-2 px-8 rounded-full">
                <p className="text-[#00B2FF] text-xl font-bold">
                  {progressDisplay}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center mt-8 space-x-4">
          {episodes
            .filter((epCard) => epCard.isVisible)
            .map((epCard, index) => (
              <div
                key={epCard.episode || index}
                className="bg-white bg-opacity-80 rounded-lg p-4 w-1/4 text-center text-gray-800 shadow-md"
              >
                <h3 className="font-semibold text-lg">
                  에피소드 {epCard.episode}
                </h3>
                <ul className="text-left mt-4">
                  <li>
                    {epCard.exe_name} | {epCard.exe_count}회 X {epCard.exe_set}
                    세트
                  </li>
                </ul>
                <button
                  className="bg-blue-500 text-white mt-4 py-2 px-6 rounded-lg font-semibold"
                  disabled={!epCard.buttonEnabled}
                  onClick={() =>
                    handlePopupOpen("오늘의 에피소드를 진행하세요.")
                  }
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
