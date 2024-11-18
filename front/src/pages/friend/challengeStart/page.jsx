import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Popup from "../../../components/Popup"; // Popup 컴포넌트 경로 확인
import { routes } from "../../../constants/routes";

function ChallengeStartPage() {
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
      {isPopupOpen && (
        <Popup
          message="게임을 시작합니다!"
          onClose={handlePopupClose} // 닫기 시 handlePopupClose 호출
        />
      )}

      {/* 팝업이 닫혔을 때 운동 시작 웹캠 화면 표시 */}
      <div className="webcam-exercise-page flex items-center justify-center h-screen">
        <h1 className="text-3xl font-semibold text-center text-black">
          운동 시작! 여기에 웹캠 화면 표시되면 됨
        </h1>

        {/* 여기에 웹캠 또는 운동 진행 화면을 위한 로직을 추가하면 됨!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */}
        {/* 여기에 웹캠 또는 운동 진행 화면을 위한 로직을 추가하면 됨!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */}
        {/* 여기에 웹캠 또는 운동 진행 화면을 위한 로직을 추가하면 됨!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */}
      </div>
    </div>
  );
}

export default ChallengeStartPage;
