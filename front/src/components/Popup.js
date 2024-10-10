import React from 'react';

function Popup({ message, onClose }) {
  return (
    <>
      {/* 어두운 배경 */}
      <div className="fixed inset-0 bg-black bg-opacity-70 z-10"></div>

      {/* 팝업창 */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-lg shadow-lg z-20 flex flex-col justify-between h-fit">
        {/* 메시지 내용 */}
        <p>{message}</p>

        {/* 닫기 버튼 */}
        <div className="flex justify-end mt-8">
          <button
            className="bg-blue-500 text-white py-2 px-6 rounded-full shadow-md"
            onClick={onClose}
          >
            닫기
          </button>
        </div>
      </div>
    </>
  );
}

export default Popup;
