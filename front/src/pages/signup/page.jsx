import React, { useState } from "react";
import EmailVerification from "../../components/EmailVerification";
import { checkIdAvailability, signup } from "./api";

function SignUpPage() {
  const [isVerified, setIsVerified] = useState(false);
  const [userId, setUserId] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [idCheckResult, setIdCheckResult] = useState(null);
  const [isIdChecked, setIsIdChecked] = useState(false);

  const handleVerification = () => {
    setIsVerified(true); // 이메일 인증 완료 시 상태 변경
  };

  const handleCheckId = async () => {
    try {
      const result = await checkIdAvailability(userId);
      setIdCheckResult(result);
      setIsIdChecked(result.isAvailable);
    } catch (error) {
      console.error("ID 확인 실패:", error);
      setIdCheckResult({ isAvailable: false, message: "오류가 발생했습니다." });
      setIsIdChecked(false);
    }
  };

  const handleSignup = async () => {
    try {
      const response = await signup(userId, password1);
      alert(response.message); // 회원가입 성공 메시지
    } catch (error) {
      console.error("회원가입 실패:", error);
      alert("회원가입 실패: 다시 시도해주세요.");
    }
  };

  const isFormComplete = () => {
    return (
      isVerified && // 이메일 인증 완료 여부 확인
      isIdChecked &&
      userId &&
      password1 &&
      password2 &&
      password1 === password2
    );
  };

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
          Welcome!
        </h1>
        <div className="bg-white bg-opacity-10 px-6 sm:px-10 md:px-20 rounded-xl py-16 max-w-md md:max-w-lg lg:max-w-xl w-full mx-auto">
          <div className="mb-4">
            <div className="flex">
              <input
                id="userId"
                type="text"
                placeholder="아이디"
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  setIsIdChecked(false);
                }}
                className="w-4/6 p-2 border-b-2 border-white focus:border-[#0675C5] bg-transparent text-white focus:outline-none"
              />
              <button
                onClick={handleCheckId}
                className="w-2/6 ml-2 bg-white hover:bg-[#0675C5] text-black hover:text-white font-bold py-2 px-4 rounded-full"
              >
                중복 확인
              </button>
            </div>
            {idCheckResult && (
              <p
                className={`mt-2 ${idCheckResult.isAvailable ? "text-green-500" : "text-red-500"}`}
              >
                {idCheckResult.message}
              </p>
            )}
          </div>
          <div className="mb-4">
            <input
              id="password1"
              type="password"
              placeholder="비밀번호"
              value={password1}
              onChange={(e) => setPassword1(e.target.value)}
              className="w-full p-2 border-b-2 border-white focus:border-[#0675C5] bg-transparent text-white focus:outline-none"
            />
          </div>
          <div className="mb-4">
            <input
              id="password2"
              type="password"
              placeholder="비밀번호 확인"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              className="w-full p-2 border-b-2 border-white focus:border-[#0675C5] bg-transparent text-white focus:outline-none"
            />
          </div>
          <EmailVerification onVerify={handleVerification} />
          <button
            onClick={handleSignup}
            className={`w-full font-bold py-2 px-4 rounded-full ${
              isFormComplete()
                ? "bg-gray-800 text-white"
                : "bg-gray-400 text-gray-600 cursor-not-allowed"
            }`}
            disabled={!isFormComplete()}
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
