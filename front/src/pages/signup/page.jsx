import React from 'react';

function SignUpPage() {
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
        <div className="bg-white bg-opacity-10 px-6 sm:px-10 md:px-20 rounded-xl py-16 max-w-md md:max-w-lg lg:max-w-xl w-full mx-auto">
          <div className="mb-4">
            <label className="block text-left text-white mb-2" htmlFor="userId">아이디</label>
            <div className="flex">
              <input
                id="userId"
                type="text"
                className="w-4/6 p-2 border-b-2 border-white focus:border-[#0675C5] bg-transparent text-white focus:outline-none"
              />
              <button
                className="w-2/6 ml-2 bg-white hover:bg-[#0675C5] text-black hover:text-white font-bold py-2 px-4 rounded-full opacity-50 cursor-not-allowed"
              >
                중복 확인
              </button>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-left text-white mb-2" htmlFor="password1">비밀번호</label>
            <input
              id="password1"
              type="password"
              className="w-full p-2 border-b-2 border-white focus:border-[#0675C5] bg-transparent text-white focus:outline-none"
            />
          </div>
          <div className="mb-8">
            <label className="block text-left text-white mb-2" htmlFor="password2">비밀번호 확인</label>
            <input
              id="password2"
              type="password"
              className="w-full p-2 border-b-2 border-white focus:border-[#0675C5] bg-transparent text-white focus:outline-none"
            />
          </div>

          <button
            className="w-full font-bold py-2 px-4 rounded-full bg-gray-400 text-gray-600 cursor-not-allowed"
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
