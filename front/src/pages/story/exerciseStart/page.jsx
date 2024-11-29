import React, { useEffect, useState } from "react";
import Popup from "../../../components/Popup";
import { useNavigate, useLocation } from "react-router-dom";
import JumpingJackCounter from "../../../components/JumpingJackCounter";
import ReturnDisplay from "../../../components/ReturnDisplay";
import { routes } from "../../../constants/routes";

function ExerciseStartPage() {
  const [isPopupOpen, setIsPopupOpen] = useState(true);
  const [count, setCount] = useState(0); // 현재 카운트
  const [currentSet, setCurrentSet] = useState(1); // 현재 세트
  const [isResting, setIsResting] = useState(false); // 휴식 여부
  const [restTime, setRestTime] = useState(20); // 휴식 카운트다운
  const [isWorkoutComplete, setIsWorkoutComplete] = useState(false); // 운동 종료 여부

  const location = useLocation();
  const { currentEpi } = location.state || {};
  const countPerSet = currentEpi.exe_count;
  const totalSets = currentEpi.exe_set;
  const episode = currentEpi.episode;
  const concern = currentEpi.concern;

  // 운동 종료되면 id, episode, concern, date를 Story db에 저장해야 함

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate(routes.login);
    }
  }, [navigate]);

  const handlePopupClose = () => {
    setIsPopupOpen(false);
  };

  const handleCountIncrease = () => {
    setCount((prevCount) => {
      if (prevCount + 1 === countPerSet) {
        handleSetComplete();
        return 0; // 다음 세트를 위해 카운트 초기화
      }
      return prevCount + 1;
    });
  };

  const handleSetComplete = () => {
    if (currentSet === totalSets) {
      setIsWorkoutComplete(true); // 운동 종료
    } else {
      setIsResting(true); // 휴식 시작
      let restInterval = setInterval(() => {
        setRestTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(restInterval);
            setRestTime(20); // 초기화
            setCurrentSet((prevSet) => prevSet + 1); // 다음 세트로
            setIsResting(false); // 휴식 종료
          }
          return prevTime - 1;
        });
      }, 1000);
    }
  };

  return (
    <div className="exercise-start-page bg-black">
      {isPopupOpen ? (
        <Popup
          message="<img alt='점핑잭 튜토리얼' src='/image/jumping_jack.png'/>"
          onClose={handlePopupClose}
        />
      ) : (
        <div className="webcam-exercise-page flex items-center justify-center h-screen bg-black">
          <div className="absolute top-0 left-0 w-full z-10">
            <ReturnDisplay />
          </div>
          {!isWorkoutComplete && (
            <>
              <div className="absolute top-5 left-1/2 transform text-9xl -translate-x-1/2 z-10 bg-black bg-opacity-50 text-white px-6 py-3 rounded-lg text-lg font-bold">
                {isResting
                  ? `휴식 중: ${restTime}초 남음`
                  : `점핑잭 횟수: ${count}/${countPerSet} (세트 ${currentSet}/${totalSets})`}
              </div>
              <JumpingJackCounter onCountIncrease={handleCountIncrease} />
            </>
          )}
          {isWorkoutComplete && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-70 text-white px-6 py-3 rounded-lg text-2xl font-bold">
              운동이 종료되었습니다! 수고하셨습니다!
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ExerciseStartPage;
