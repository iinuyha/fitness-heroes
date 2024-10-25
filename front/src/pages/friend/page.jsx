import React, { useState, useEffect, useRef } from "react";
import CoinInfoDisplay from "../../components/CoinInfoDisplay";
import ReturnDisplay from "../../components/ReturnDisplay";
import YesNoPopup from "../../components/YesNoPopup"; // YesNoPopup import
import {
  fetchFriendList,
  inviteFriend,
  checkInvitationStatus,
} from "./api/api"; // API 함수 가져오기

function FriendPage() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [friendList, setFriendList] = useState([]); // 친구 목록
  const [selectedFriend, setSelectedFriend] = useState(null); // 선택한 친구
  const [isInvitationSent, setIsInvitationSent] = useState(false); // 초대 상태
  const [isStartEnabled, setIsStartEnabled] = useState(false); // 게임 시작 버튼 활성화 상태
  const [isCancelConfirm, setIsCancelConfirm] = useState(false); // 초대 취소 팝업 상태
  const [hasScrollbar, setHasScrollbar] = useState(false); // 스크롤바 감지 상태
  const listRef = useRef(null); // 친구 목록의 참조를 저장할 ref
  const [newFriendId, setNewFriendId] = useState(""); // 새로운 친구의 ID 입력 상태

  // 스크롤바 여부 감지
  useEffect(() => {
    const listElement = listRef.current;
    if (listElement.scrollHeight > listElement.clientHeight) {
      setHasScrollbar(true); // 스크롤바가 있을 때
    } else {
      setHasScrollbar(false); // 스크롤바가 없을 때
    }
  }, [friendList]); // friendList가 변경될 때마다 스크롤바 감지

  // 친구 목록을 DB에서 받아오기
  useEffect(() => {
    const loadFriends = async () => {
      try {
        const friends = await fetchFriendList(); // API 호출하여 친구 목록 불러오기
        setFriendList(friends);
      } catch (error) {
        console.error("친구 목록을 불러오는 중 오류 발생:", error);
      }
    };

    loadFriends(); // 친구 목록 불러오는 함수 실행
  }, []);

  // 새로운 친구 추가 함수 (아이디 입력 후 버튼 클릭 시 호출)
  const handleAddFriend = () => {
    if (newFriendId.trim()) {
      console.log("새 친구 추가:", newFriendId);
      // 여기에 친구 추가 API를 호출하거나 다른 로직을 추가할 수 있습니다
      setNewFriendId(""); // 입력 필드 초기화
    } else {
      alert("친구의 ID를 입력해주세요.");
    }
  };

  // 초대 상태 확인 함수
  const checkStatus = async (friendId) => {
    try {
      const intervalId = setInterval(async () => {
        const response = await checkInvitationStatus(friendId); // API 호출하여 초대 상태 확인
        if (response.accepted) {
          setIsStartEnabled(true); // 친구가 수락하면 시작 버튼 활성화
          clearInterval(intervalId); // 수락 확인되면 반복 종료
        }
      }, 3000); // 3초마다 상태 확인
    } catch (error) {
      console.error("초대 상태 확인 중 오류 발생:", error);
    }
  };

  // 초대 취소 함수
  const cancelInvite = () => {
    setSelectedFriend(null);
    setIsInvitationSent(false);
    setIsStartEnabled(false);
  };

  // 초대 버튼 클릭 시 처리
  const handleInvite = async (friend) => {
    if (selectedFriend?.userId === friend.userId) {
      // 초대 취소 확인 팝업 띄우기
      setIsCancelConfirm(true);
      setPopupMessage("초대를 취소하시겠습니까?");
    } else {
      try {
        const response = await inviteFriend(friend.userId); // API 호출하여 친구 초대
        if (response.success) {
          setSelectedFriend(friend); // 선택한 친구 설정
          setIsInvitationSent(true); // 초대가 성공했음을 표시
          checkStatus(friend.userId); // 초대 상태 확인
        } else {
          handlePopupOpen(response.message); // 실패 메시지 표시
        }
      } catch (error) {
        console.error("초대하는 중 오류 발생:", error);
      }
    }
  };

  // 팝업 열기 함수
  const handlePopupOpen = (message) => {
    setPopupMessage(message);
    setIsPopupOpen(true);
  };

  // 초대 취소 확인 팝업 처리
  const handleCancelConfirmation = (confirm) => {
    if (confirm) {
      cancelInvite();
    }
    setIsCancelConfirm(false); // 팝업 닫기
  };

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/image/background.png')" }}
    >
      {/* 뒤로가기 버튼 */}
      <ReturnDisplay />

      {/* 코인 및 정보 팝업 */}
      <CoinInfoDisplay message="<u>운동 경쟁 관련된 설명</u> 적으면 됨.. html이나 마크다운 문법 사용 가능" />

      {/* 초대 취소 확인 팝업 */}
      {isCancelConfirm && (
        <YesNoPopup
          message={popupMessage}
          onCancel={() => handleCancelConfirmation(false)} // 취소
          onConfirm={() => handleCancelConfirmation(true)} // 확인
        />
      )}

      <div className="flex flex-col items-center justify-center h-full space-y-5 font-sans">
        <h1
          className="text-3xl text-white mb-6 font-semibold"
          style={{ textShadow: "0 0 10px rgba(255, 255, 255, 0.5)" }}
        >
          친구를 초대하여 운동 경쟁을 해보세요!
        </h1>
        <div className="flex items-center">
          <img
            src="/image/friend/competition.png"
            alt="경쟁 아이콘"
            className="h-20"
          />
          <span className="ml-4 text-white font-semibold text-2xl">
            게임 참가비:
          </span>
          <div className="flex items-center px-3 py-1 bg-white bg-opacity-20 rounded-full font-semibold text-lg ml-2">
            <img src="/image/friend/coin.png" alt="코인" className="h-7 mr-3" />
            <span className="text-xl text-white">3</span>
          </div>
        </div>

        {/* 친구 목록 */}
        <div className="w-full max-w-md bg-white bg-opacity-10 rounded-lg p-3">
          <h2 className="text-xl text-white font-semibold mb-2 w-full text-center bg-[#193E59] py-2 rounded-xl">
            친구 목록
          </h2>
          <ul
            className={`space-y-0 max-h-72 overflow-y-auto ${hasScrollbar ? "pr-3" : ""}`} // 스크롤바가 있을 때만 pr-3 적용
            ref={listRef} // 친구 목록에 ref 추가
          >
            {friendList.map((friend, index) => (
              <li
                key={friend.userId}
                className="flex justify-between items-center text-white py-2 border-b border-gray-500 last:border-none" // li에 border-bottom 적용, 마지막 항목에만 border 제거
              >
                <span className="flex items-center">
                  <span className="font-semibold mr-1">{friend.username}</span>(
                  {friend.userId})
                </span>
                <button
                  className={`px-4 py-1 rounded-full ${
                    selectedFriend?.userId === friend.userId
                      ? "bg-gray-400"
                      : "bg-[#00B2FF]"
                  } text-white flex items-center justify-center`}
                  onClick={() => handleInvite(friend)}
                >
                  {selectedFriend?.userId === friend.userId
                    ? "취소"
                    : "초대하기"}
                </button>
              </li>
            ))}
          </ul>
          {/* 친구 추가 입력 및 버튼 */}
          <div className="flex items-center mt-4 bg-gray-200 rounded-xl">
            <input
              type="text"
              placeholder="친구의 ID를 입력해주세요"
              value={newFriendId}
              onChange={(e) => setNewFriendId(e.target.value)}
              className="flex-grow py-2 px-3 rounded-xl rounded-r-none bg-gray-200 text-gray-800"
            />
            <button
              onClick={handleAddFriend}
              className="px-4 py-2 rounded-xl bg-[#193E59] text-white font-semibold"
            >
              친구 추가 +
            </button>
          </div>
        </div>

        {/* 게임 시작 버튼 (공간 유지) */}
        <div
          className={`mt-8 px-6 py-2 text-lg rounded-full font-semibold text-white
            ${isStartEnabled ? "bg-green-500" : "bg-gray-500"}`}
          style={{ visibility: isInvitationSent ? "visible" : "hidden" }}
        >
          <button
            className="w-full"
            onClick={() => alert("게임 시작!")}
            disabled={!isStartEnabled}
          >
            {isStartEnabled ? "게임 시작" : "수락 대기 중"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FriendPage;
