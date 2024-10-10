import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { routes } from '../../constants/routes';
import Popup from '../../components/Popup';  // 팝업 컴포넌트 가져오기

function StoryPage() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const handlePopupOpen = (message) => {
    setPopupMessage(message);
    setIsPopupOpen(true);
  };

  return (
    <div className="relative w-full h-screen bg-cover bg-center" style={{ backgroundImage: "url('/image/background.png')" }}>
      
      {/* 뒤로가기 버튼 */}
      <Link to={routes.menu} className="absolute top-4 left-4 flex items-center">
        <img src="/image/back_icon.png" alt="back" className="w-10 h-10" />
      </Link>

      {/* 우측 상단 i 아이콘 */}
      <div className="absolute top-4 right-4">
        <button onClick={() => handlePopupOpen("story 페이지에 대한 정보입니다.")}>
          <img src="/image/info_icon.png" alt="Info" className="w-8 h-8" />
        </button>
      </div>

      {/* 팝업창 */}
      {isPopupOpen && (
        <Popup 
          message={popupMessage} 
          onClose={() => setIsPopupOpen(false)}  // 닫기 핸들러 전달
        />
      )}

      <div className="flex flex-col items-center justify-center h-full space-y-8 font-sans">
        <h1 className="text-3xl text-white mb-6 font-semibold font-sans"
            style={{
                textShadow: '0 0 10px rgba(255, 255, 255, 0.5)', // 흰색 블러 효과
            }}>
            <span className="text-[#90DEFF]">근력 지역</span>
            을 책임지고 구출할 것!!
        </h1>

        {/* 가운데 3개 아이콘 메뉴 */}
        <div className="flex space-x-28">
          <button onClick={() => handlePopupOpen("아직 열리지 않은 지역입니다.")} className="flex flex-col items-center">
            <p className="text-white text-xl font-semibold mb-2">근지구력 지역</p>
            <img src="/image/story/area3.png" alt="근지구력 지역" className="w-32" />
          </button>
          <Link to={routes.story} className="flex flex-col items-center">
            <img src="/image/story/area1.png" alt="근력 운동" className="w-52" />
            <div className="mt-4 w-full flex justify-center">
                <div className="bg-white py-2 px-8 rounded-full">
                    <p className="text-[#00B2FF] text-xl font-bold">1 / 33</p>
                </div>
            </div>
          </Link>
          <button onClick={() => handlePopupOpen("아직 열리지 않은 지역입니다.")} className="flex flex-col items-center">
            <p className="text-white text-xl font-semibold mb-2">체력 지역</p>
            <img src="/image/story/area2.png" alt="체력 지역" className="w-32" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default StoryPage;
