import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Component1 from "./_components/Component1"; // 이름
import Component2 from "./_components/Component2"; // 생년월일
import Component3 from "./_components/Component3"; // 성별
import Component4 from "./_components/Component4"; // 체력고민
import Component5 from "./_components/Component5"; // 캐릭터 선택
import Component6 from "./_components/Component6"; // 로딩중 화면
import Component7 from "./_components/Component7"; // 환영합니다 화면

import { routes } from "../../constants/routes";

function OnBoardingPage() {
  const [step, setStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false); // 입력 완료 여부 관리
  const [name, setName] = useState(""); // 이름 저장
  const [character, setCharacter] = useState(""); // 캐릭터 저장
  const navigate = useNavigate(); // 메뉴로 이동할 때 사용

  const handleNext = () => {
    if (isComplete) {
      setStep((prevStep) => prevStep + 1);
      setIsComplete(false); // 다음 단계로 넘어가면 다시 비활성화 상태로 변경
    }
  };

  // Component6에서 일정 시간 후 자동으로 Component7로 넘어가는 로직
  useEffect(() => {
    if (step === 5) {
      const timer = setTimeout(() => {
        setStep(6); // Component6에서 Component7로 넘어감
      }, 3000); // 3초 후에 다음 단계로 자동 이동

      return () => clearTimeout(timer); // 컴포넌트가 언마운트될 때 타이머 클리어
    }
  }, [step]);

  const components = [
    <Component1 moveToNext={() => setIsComplete(true)} setName={setName} />, // 이름 저장
    <Component2 moveToNext={() => setIsComplete(true)} />,
    <Component3 moveToNext={() => setIsComplete(true)} />,
    <Component4 moveToNext={() => setIsComplete(true)} />,
    <Component5
      moveToNext={() => setIsComplete(true)}
      setCharacter={setCharacter}
    />, // 캐릭터 저장
    <Component6 name={name} />, // name 전달
    <Component7
      character={character}
      moveToMenu={() => navigate(routes.menu)}
    />, // Component7에 캐릭터 전달
  ];

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/image/background.png')" }}
    >
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h1
          className="text-7xl mb-8 font-press-start"
          style={{
            background: "linear-gradient(90deg, #0675C5 0%, #D9CC59 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Onboarding
        </h1>
        <div className="text-left bg-white text-black px-6 sm:px-10 md:px-20 rounded-xl py-16 w-full max-w-md md:max-w-lg lg:max-w-xl">
          {components[step]} {/* 현재 스텝에 해당하는 컴포넌트 표시 */}
          {/* Component6에서는 버튼이 없어야 함 */}
          {step !== 5 &&
            step !== 6 && ( // Component6가 아닐 때만 버튼 표시
              <div className="text-right">
                <button
                  className={`mt-4 text-base font-semibold py-1 ml-auto ${
                    isComplete
                      ? "text-[#0675C5] hover:text-[#143978]"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                  onClick={handleNext}
                  disabled={!isComplete} // 입력이 완료되지 않으면 비활성화
                >
                  다음 &gt;
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default OnBoardingPage;
