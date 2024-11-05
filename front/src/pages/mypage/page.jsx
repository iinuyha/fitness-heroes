import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { routes } from "../../constants/routes";
import Popup from "../../components/Popup";
import CoinInfoDisplay from "../../components/CoinInfoDisplay";
import ReturnDisplay from "../../components/ReturnDisplay";

function MypagePage() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate(); // useNavigate 훅을 사용하여 페이지 이동

  const handlePopupOpen = (message) => {
    setPopupMessage(message);
    setIsPopupOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // 토큰 삭제
    navigate("/"); // 홈 페이지로 이동
  };

  const userInfo = {
    name: "강윤수",
    role: "기초체력 히어로",
    gender: "남",
    id: "kwu123456",
    progress: "4 / 33",
    startDate: "2024.10.16",
    coin: 9,
  };

  const episodes = [
    {
      id: 6,
      title: "에피소드 6",
      details: "스쿼트(x4) · 런지(x4) · 푸쉬업(x3) · 버피 테스트 · 플랭크",
      date: "2024.10.25 | 14:35 (금)",
    },
    {
      id: 5,
      title: "에피소드 5",
      details: "스쿼트(x4) · 런지(x4) · 푸쉬업(x3) · 플랭크",
      date: "2024.10.24 | 10:35 (목)",
    },
    {
      id: 4,
      title: "에피소드 4",
      details: "스쿼트(x3) · 푸쉬업(x3) · 인클라인 푸쉬업(x3)",
      date: "2024.10.22 | 20:05 (화)",
    },
    {
      id: 3,
      title: "에피소드 3",
      details: "스쿼트(x4) · 런지(x4) · 푸쉬업(x3) · 플랭크",
      date: "2024.10.20 | 10:35 (일)",
    },
    {
      id: 2,
      title: "에피소드 2",
      details: "푸쉬업(x3) · 버피 테스트 · 플랭크",
      date: "2024.10.18 | 15:30 (토)",
    },
    {
      id: 1,
      title: "에피소드 1",
      details: "런지(x4) · 스쿼트(x4)",
      date: "2024.10.15 | 10:00 (수)",
    },
  ];

  // 페이지당 4개씩 표시
  const itemsPerPage = 4;
  const totalPages = Math.ceil(episodes.length / itemsPerPage);

  // 슬라이드 이동 핸들러
  const nextSlide = () => {
    if (currentIndex < totalPages - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // 현재 페이지에 표시할 에피소드
  const currentEpisodes = episodes.slice(
    currentIndex * itemsPerPage,
    currentIndex * itemsPerPage + itemsPerPage
  );

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
        <Popup message={popupMessage} onClose={() => setIsPopupOpen(false)} />
      )}

      <div className="flex flex-col items-center justify-center h-full space-y-8 font-sans">
        <h1
          className="text-3xl text-white mb-2 font-semibold"
          style={{ textShadow: "0 0 10px rgba(255, 255, 255, 0.5)" }}
        >
          마이페이지
        </h1>

        {/* 사용자 정보 */}
        <div className="flex bg-white bg-opacity-20 rounded-xl p-10 text-white w-2/4 justify-center">
          <div className="flex items-center justify-between">
            <div className="font-semibold">
              <div className="flex items-baseline mb-5">
                <span className="text-3xl font-semibold">{userInfo.name}</span>
                <span className="text-lg ml-4 text-gray-300">
                  {userInfo.role}
                </span>
              </div>
              <p className="mb-2">성별 | {userInfo.gender}</p>
              <p>ID | {userInfo.id}</p>
            </div>
          </div>
          <div className="text-center ml-80">
            <div className="flex items-center justify-center mb-4">
              <img
                src="/image/story/area1.png"
                alt="근력 지역"
                className="h-28"
              />
            </div>
            <p className="text-lg font-semibold">
              진행도 | {userInfo.progress}
            </p>
          </div>
        </div>

        {/* 에피소드 슬라이드 */}
        <div className="bg-white bg-opacity-20 rounded-xl p-10 text-white w-2/4 relative">
          <div className="mb-4 flex justify-between">
            <h2 className="text-xl font-semibold text-white">지난 에피소드</h2>
            <div className="text-right text-sm text-white">
              시작일 | {userInfo.startDate}
            </div>
          </div>

          {/* 에피소드 카드 그룹 */}
          <div className="flex items-center justify-center relative">
            {currentIndex > 0 && (
              <button
                onClick={prevSlide}
                className="absolute left-0 text-white text-3xl"
              >
                &#10094;
              </button>
            )}
            <div className="flex space-x-4 w-full max-w-2xl mx-10 justify-center">
              {currentEpisodes.map((episode) => (
                <div
                  key={episode.id}
                  className="bg-white rounded-lg p-4 w-1/4 text-center text-gray-800"
                >
                  <h3 className="font-semibold text-lg">{episode.title}</h3>
                  <p className="font-semibold text-sm mt-2">
                    {episode.details}
                  </p>
                  <p className="font-semibold text-xs mt-2 text-gray-500">
                    {episode.date}
                  </p>
                </div>
              ))}
            </div>
            {currentIndex < totalPages - 1 && (
              <button
                onClick={nextSlide}
                className="absolute right-0 text-white text-3xl"
              >
                &#10095;
              </button>
            )}
          </div>

          {/* 인디케이터 */}
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: totalPages }, (_, index) => (
              <span
                key={index}
                className={`h-2 w-2 rounded-full ${index === currentIndex ? "bg-white" : "bg-gray-500"}`}
              />
            ))}
          </div>
        </div>

        {/* 로그아웃 버튼 */}
        <button
          onClick={handleLogout}
          className="mt-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}

export default MypagePage;
