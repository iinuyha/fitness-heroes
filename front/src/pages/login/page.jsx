import React from 'react';
import { Link } from 'react-router-dom';
import { routes } from '../../constants/routes';

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
        <div className="bg-white bg-opacity-10 px-20 rounded-xl py-16 w-1/2 h-1/2">
          <div className="mb-4">
            <label className="block text-left text-white mb-2" htmlFor="username">아이디</label>
            <input
              id="username"
              type="text"
              className="w-full p-2 border-b-2 border-white focus:border-[#0675C5] bg-transparent text-white focus:outline-none"
            />
          </div>
          <div className="mb-8">
            <label className="block text-left text-white mb-2" htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              className="w-full p-2 border-b-2 border-white focus:border-[#0675C5] bg-transparent text-white focus:outline-none"
            />
          </div>
          <button className="w-full bg-white hover:bg-[#0675C5] text-black hover:text-white font-bold py-2 px-4 rounded-full">
            로그인
          </button>
          <div className="flex justify-between mx-52 text-white mt-4">
            <Link to={routes.signup} className="text-sm hover:text-[#0675C5] hover:font-semibold">회원가입</Link>
            |
            <Link to={routes.forgotPassword} className="text-sm hover:text-[#0675C5] hover:font-semibold">비밀번호찾기</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
