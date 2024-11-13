import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import {
  fetchFriendList,
  searchFriend,
  inviteFriend,
  acceptInvitation,
  declineInvitation,
} from "./api/api";
import CoinInfoDisplay from "../../components/CoinInfoDisplay";
import ReturnDisplay from "../../components/ReturnDisplay";
import YesNoPopup from "../../components/YesNoPopup";
import Popup from "../../components/Popup";

function FriendPage() {
  const [friendList, setFriendList] = useState([]);
  const [isInvitationSent, setIsInvitationSent] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [newFriendId, setNewFriendId] = useState("");
  const [isChallengePopupOpen, setIsChallengePopupOpen] = useState(false);
  const [challengeFrom, setChallengeFrom] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);

  const token = localStorage.getItem("token");
  const socketRef = useRef();

  useEffect(() => {
    loadFriends();
    initializeSocket();

    return () => {
      cleanupSocket();
    };
  }, [token]);

  // 소켓 초기화
  const initializeSocket = () => {
    socketRef.current = io(process.env.REACT_APP_SERVER_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    setupSocketListeners();
  };

  // 소켓 이벤트 리스너 설정
  const setupSocketListeners = () => {
    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("서버와 연결 성공:", socket.id);
    });

    socket.on("userStatusUpdate", ({ userId, isOnline }) => {
      updateFriendStatus(userId, isOnline);
    });

    socket.on("connect_error", (error) => {
      console.error("서버 연결 오류:", error.message);
      setPopupMessage("서버 연결에 실패했습니다. 다시 시도해주세요.");
      setIsPopupOpen(true);
    });

    socket.on("error", ({ message }) => {
      setPopupMessage(message);
      setIsPopupOpen(true);
      setIsInvitationSent(false);
    });

    socket.on("challengeReceived", handleChallengeReceived); // 대결 신청 받는 경우 (초대받는 사람)
    socket.on("challengeDeclined", handleChallengeDeclined); // 초대하는 사람 브라우저에 거절되었다고 뜨는거
    socket.on("challengeCancelled", handleChallengeCancelled); // 초대하는 사람 브라우저에 2분 지나서 취소됐다고 뜨는거
    socket.on("gameStart", handleGameStart); // 둘 다
  };

  // 친구 목록 로드
  const loadFriends = async () => {
    try {
      const friends = await fetchFriendList(token);
      setFriendList(friends.friends);
    } catch (error) {
      console.error("친구 목록 로드 실패:", error);
      setPopupMessage("친구 목록을 불러오는데 실패했습니다.");
      setIsPopupOpen(true);
    }
  };

  // 소켓 정리
  const cleanupSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  // 친구 상태 업데이트
  const updateFriendStatus = (userId, isOnline) => {
    setFriendList((prevFriends) =>
      prevFriends.map((friend) =>
        friend.id === userId ? { ...friend, isOnline } : friend
      )
    );
  };

  // 대결 신청하기 (초대하는 사람)
  const handleInvite = async (friend) => {
    if (!friend.isOnline) {
      setPopupMessage("친구가 온라인 상태일 때만 초대할 수 있습니다.");
      setIsPopupOpen(true);
      return;
    }

    setIsInvitationSent(true);
    if (isInvitationSent) {
      setPopupMessage(
        "이미 초대를 보냈습니다.<br>2분 뒤에 다시 초대를 할 수 있습니다."
      );
      setIsPopupOpen(true);
      return;
    }

    try {
      const response = await inviteFriend(token, friend.id);
      if (response.success) {
        setIsInvitationSent(true);
        socketRef.current.emit("sendChallenge", { friendId: friend.id });
      } else {
        setPopupMessage(response.message);
        setIsPopupOpen(true);
      }
    } catch (error) {
      console.error("초대 실패:", error);
      // 서버에서 반환된 에러 메시지가 있을 경우 이를 팝업 메시지로 설정
      if (error.response && error.response.data && error.response.data.error) {
        setPopupMessage(error.response.data.error);
      } else {
        // 서버에서 반환된 메시지가 없을 경우 기본 메시지 사용
        setPopupMessage("초대 처리 중 오류가 발생했습니다.");
      }
      setIsPopupOpen(true);
    }
  };

  // 대결 수신 처리 (초대받는 사람)
  const handleChallengeReceived = ({ from, roomId }) => {
    setChallengeFrom({ from, roomId });
    setIsChallengePopupOpen(true);

    socketRef.current.emit("joinRoom", { roomId }); // 초대받은 사용자가 roomId에 참가
  };

  // 초대받은 사람이 대결을 수락함
  const handleChallengeAccept = async () => {
    try {
      await acceptInvitation(token, challengeFrom.from);
      socketRef.current.emit("acceptChallenge", {
        roomId: challengeFrom.roomId,
      });
      setCurrentRoom(challengeFrom.roomId);
      setIsChallengePopupOpen(false);
    } catch (error) {
      console.error("대결 수락 실패:", error);
      setPopupMessage("대결 수락 처리 중 오류가 발생했습니다.");
      setIsPopupOpen(true);
    }
  };

  // 초대받은 사람이 대결을 거절함
  const handleChallengeDecline = async () => {
    try {
      await declineInvitation(token, challengeFrom.from); // 초대 거절 API 호출
      socketRef.current.emit("declineChallenge", {
        roomId: challengeFrom.roomId,
      });

      setIsChallengePopupOpen(false);
      setPopupMessage("초대를 거절하였습니다.");
      setIsPopupOpen(true);
    } catch (error) {
      console.error("대결 거절 실패:", error);
      setPopupMessage("대결 거절 처리 중 오류가 발생했습니다.");
      setIsPopupOpen(true);
    }
  };

  // 대결 취소 처리
  const handleChallengeCancelled = ({ message }) => {
    setPopupMessage(message);
    setIsPopupOpen(true);
    setIsInvitationSent(false);
    setCurrentRoom(null);
  };

  // 대결 거절 처리됨 (초대하는 사람 브라우저에 뜨는거)
  const handleChallengeDeclined = ({ message }) => {
    setPopupMessage(message || "상대방이 대결을 거절했습니다.");
    setIsPopupOpen(true);
    setIsInvitationSent(false);
  };

  // 게임 시작 처리 - 팝업 메시지를 통해 모든 사용자에게 표시
  const handleGameStart = ({ roomId }) => {
    setCurrentRoom(roomId);
    setPopupMessage("게임을 시작합니다!");
    setIsPopupOpen(true);
  };

  // 친구 추가 처리
  const handleAddFriend = async () => {
    if (!newFriendId.trim()) {
      setPopupMessage("친구의 ID를 입력해주세요.");
      setIsPopupOpen(true);
      return;
    }

    try {
      const response = await searchFriend(token, newFriendId);
      setPopupMessage(`${newFriendId}님과 친구가 되셨습니다!`);
      setIsPopupOpen(true);
      setNewFriendId("");
      loadFriends(); // 친구 목록 새로고침
    } catch (error) {
      setPopupMessage(error.message || "친구 추가 중 오류가 발생했습니다.");
      setIsPopupOpen(true);
    }
  };

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/image/background.png')" }}
    >
      <ReturnDisplay />
      <CoinInfoDisplay message="<u>운동 경쟁 설명</u>" />

      {isPopupOpen && (
        <Popup message={popupMessage} onClose={() => setIsPopupOpen(false)} />
      )}

      {isChallengePopupOpen && (
        <YesNoPopup
          message={`${challengeFrom.from}님이 대결을 신청했습니다. 수락하시겠습니까?`}
          onConfirm={handleChallengeAccept} // 확인 버튼 클릭 시 초대 수락
          onCancel={handleChallengeDecline} // 취소 버튼 클릭 시 초대 거절
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
          <ul className="space-y-0 max-h-72 overflow-y-auto pr-3">
            {friendList.map((friend) => (
              <li
                key={friend.id}
                className="flex justify-between items-center text-white py-2 border-b border-gray-500 last:border-none"
              >
                <span className="flex items-center">
                  <span className="font-semibold mr-1">{friend.name}</span>(
                  {friend.id})
                  <span className="text-sm text-gray-400">
                    - {friend.win}승 {friend.draw}무 {friend.lose}패
                  </span>
                </span>
                <button
                  disabled={!friend.isOnline}
                  onClick={() => handleInvite(friend)}
                  className={`px-4 py-1 rounded-full ${
                    friend.isOnline ? "bg-[#00B2FF]" : "bg-gray-400"
                  } text-white`}
                >
                  {friend.isOnline ? "대결신청" : "오프라인"}
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
      </div>
    </div>
  );
}

export default FriendPage;
