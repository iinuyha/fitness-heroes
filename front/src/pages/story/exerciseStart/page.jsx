import React, { useEffect, useState } from "react";
import Popup from "../../../components/Popup"; // Popup 컴포넌트 경로 확인
import { useNavigate, useLocation } from "react-router-dom";
import JumpingJackCounter from "../../../components/JumpingJackCounter";
import ReturnDisplay from "../../../components/ReturnDisplay";
import { routes } from "../../../constants/routes";

function ExerciseStartPage() {
  const [isPopupOpen, setIsPopupOpen] = useState(true); // 팝업이 처음에 열려있도록 설정
  const location = useLocation();
  const { currentEpi } = location.state || {}; // 이게 현재 수행중인 에피소드 정보
  const navigate = useNavigate();
  const episode = currentEpi.episode; // 현재 에피소드의 숫자
  const count = currentEpi.exe_count; // 현재 에피소드의 카운트 수
  const set = currentEpi.exe_set; // 현재 에피소드의 세트수
  const concern = currentEpi.concern; // 현재 에피소드의 운동종류

  // 나중에 운동 다 끝나면 id, concern, episode, date를 Story DB에 저장해야 함!!

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate(routes.login);
    }
  }, [navigate]);

  // 팝업 닫기 시 웹캠 화면을 표시
  const handlePopupClose = () => {
    setIsPopupOpen(false); // 팝업을 닫음
  };

  return (
    <div className="exercise-start-page bg-black">
      {isPopupOpen ? (
        <Popup
          message="<img alt='점핑잭 튜토리얼' src='/image/jumping_jack.png'/>"
          onClose={handlePopupClose} // 닫기 시 handlePopupClose 호출
        />
      ) : (
        // 팝업이 닫혔을 때 JumpingJackCounter 컴포넌트 표시
        <div className="webcam-exercise-page flex items-center justify-center h-screen bg-black">
          <div className="absolute top-0 left-0 w-full z-10">
            <ReturnDisplay />
          </div>
          <JumpingJackCounter />
        </div>
      )}
    </div>
  );
}

export default ExerciseStartPage;
