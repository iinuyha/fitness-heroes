import React, { useEffect, useState, useRef } from "react";
import Popup from "../../../components/Popup";
import { useNavigate, useLocation } from "react-router-dom";
import JumpingJackCounter from "../../../components/JumpingJackCounter";
import ReturnDisplay from "../../../components/ReturnDisplay";
import { routes } from "../../../constants/routes";
import { saveNewEpisode } from "./api";

function ExerciseStartPage() {
  const [isPopupOpen, setIsPopupOpen] = useState(true);
  const [count, setCount] = useState(0); // 현재 카운트
  const [currentSet, setCurrentSet] = useState(1); // 현재 세트
  const [isResting, setIsResting] = useState(false); // 휴식 여부
  const [restTime, setRestTime] = useState(20); // 휴식 카운트다운
  const [isWorkoutComplete, setIsWorkoutComplete] = useState(false); // 운동 종료 여부

  const restIntervalRef = useRef(null);

  const location = useLocation();
  const { currentEpi } = location.state || {};
  const countPerSet = currentEpi.exe_count;
  const totalSets = currentEpi.exe_set;

  const episode = currentEpi.episode; // 현재 에피소드 숫자 (story db 저장용 변수)
  const exe_name = currentEpi.exe_name; // 현재 운동 이름 (story db 저장용 변수)

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate(routes.login);
    }

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
      }
    };
  }, [navigate]);

  const handlePopupClose = () => {
    setIsPopupOpen(false);
  };

  const handleCountIncrease = () => {
    if (!isResting) {
      setCount((prevCount) => {
        if (prevCount + 1 === countPerSet) {
          setCurrentSet((prevSet) => {
            const nextSet = prevSet + 1;
            if (nextSet > totalSets) {
              setIsWorkoutComplete(true); // 운동 종료
              return prevSet;
            } else {
              handleToNextSet(); // 다음 세트로 넘어가기
              return nextSet;
            }
          });
          return 0; // 다음 세트를 위해 카운트 초기화
        }
        return prevCount + 1;
      });
    }
  };

  const handleToNextSet = () => {
    // 기존 인터벌 정리
    if (restIntervalRef.current) {
      clearInterval(restIntervalRef.current);
    }

    setIsResting(true); // 휴식 시작
    setRestTime(20); // 휴식 시간 초기화

    restIntervalRef.current = setInterval(() => {
      setRestTime((prevTime) => {
        if (prevTime <= 1) {
          if (restIntervalRef.current) {
            clearInterval(restIntervalRef.current);
          }
          setIsResting(false); // 휴식 종료
          return 20; // 다음 초기값 설정
        }
        return prevTime - 1; // 남은 시간
      });
    }, 1000);
  };

  const saveExercise = async () => {
    const token = localStorage.getItem("token"); // JWT 토큰을 localStorage에서 가져오기
    try {
      await saveNewEpisode({
        token,
        episode,
        exe_name,
        exe_count: countPerSet,
        exe_set: totalSets,
      });
      console.log("운동 기록 저장 후 페이지 이동");
      navigate(routes.episode); // 저장 성공 후 페이지 이동
    } catch (error) {
      console.error("운동 기록 저장 실패:", error.message);
      alert("운동 기록 저장에 실패했습니다. 다시 시도해주세요.");
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
          {!isWorkoutComplete && (
            <>
              <div className="absolute top-0 left-0 w-full z-10">
                <ReturnDisplay />
              </div>
              <div className="absolute top-5 left-1/2 transform text-9xl -translate-x-1/2 z-10 bg-black bg-opacity-50 text-white px-6 py-3 rounded-lg font-bold">
                {isResting
                  ? `휴식 중: ${restTime}초 남음`
                  : `${count}/${countPerSet} (세트 ${currentSet}/${totalSets})`}
              </div>
              <JumpingJackCounter onCountIncrease={handleCountIncrease} />
            </>
          )}
          {isWorkoutComplete && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10">
              <div className="text-white px-6 py-3 rounded-lg text-2xl font-bold text-center">
                <p>
                  운동이 종료되었습니다! 수고하셨습니다! (코인 얻는 로직 및 내용
                  추가해야 함) 이거 확인 버튼 누르면 현재 운동 저장되어서 다음
                  에피소드로 넘어가버리니까 일단 확인 누르지 마
                </p>
                <button
                  onClick={saveExercise}
                  className="block mt-4 bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-base font-semibold"
                >
                  확인
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ExerciseStartPage;
