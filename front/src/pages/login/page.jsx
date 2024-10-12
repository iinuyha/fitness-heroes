import React from 'react';
import { Link } from 'react-router-dom'; // Link만 남김

function LoginPage() {

  return (
    <div className="relative w-full h-screen bg-cover bg-center" style={{ backgroundImage: "url('/image/background.png')" }}>
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
        <div className="bg-white bg-opacity-10 px-6 sm:px-10 md:px-20 rounded-xl py-16 w-full max-w-md md:max-w-lg lg:max-w-xl">
          <div className="mb-4">
            <input
              id="username"
              type="text"
              placeholder="아이디"
              className="w-full p-2 border-b-2 border-white focus:border-[#0675C5] bg-transparent text-white focus:outline-none"
            />
          </div>
          <div className="mb-12">
            <input
              id="password"
              type="password"
              placeholder="비밀번호"
              className="w-full p-2 border-b-2 border-white focus:border-[#0675C5] bg-transparent text-white focus:outline-none"
            />
          </div>

          <button className="w-full bg-white hover:bg-[#0675C5] text-black hover:text-white font-bold py-2 px-4 rounded-full">
            로그인
          </button>
          <div className="mt-4 flex text-white text-base justify-center">
            <Link
              to="/signup" // Link는 여전히 활성화
              className="hover:text-[#0675C5] hover:font-semibold block text-center"
            >
              회원가입
            </Link>
            <p className='mx-4'>|</p>
            <Link
              to="/signup" // Link는 여전히 활성화
              className="font-sans hover:text-[#0675C5] hover:font-semibold block text-center"
            >
              비밀번호 찾기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
