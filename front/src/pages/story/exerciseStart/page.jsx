import React, { useEffect, useState } from "react";
import Popup from "../../../components/Popup"; // Popup 컴포넌트 경로 확인
import { useParams, useNavigate } from "react-router-dom";
import JumpingJackCounter from "../../../components/JumpingJackCounter";
import { routes } from "../../../constants/routes";

function ExerciseStartPage() {
  const { roomId } = useParams();
  const [isPopupOpen, setIsPopupOpen] = useState(true); // 팝업이 처음에 열려있도록 설정
  const navigate = useNavigate();

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
    <div className="exercise-start-page">
      {isPopupOpen ? (
        <Popup
          message="<img alt='점핑잭 튜토리얼' src='/image/jumping_jack.png'/>"
          onClose={handlePopupClose} // 닫기 시 handlePopupClose 호출
        />
      ) : (
        // 팝업이 닫혔을 때 JumpingJackCounter 컴포넌트 표시
        <div className="webcam-exercise-page flex items-center justify-center h-screen">
          <JumpingJackCounter />
        </div>
      )}
    </div>
  );
}

export default ExerciseStartPage;
