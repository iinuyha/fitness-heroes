import React, { useState, useEffect, useContext } from "react";
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
import SocketContext from "../../contexts/SocketContext";

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
  const { socket, onlineFriends } = useContext(SocketContext);

  useEffect(() => {
    loadFriends();
    if (socket) {
      setupSocketListeners();
    }

    return () => {
      cleanupSocketListeners();
    };
  }, [socket, token]);

  // 소켓 이벤트 리스너 설정
  const setupSocketListeners = () => {
    socket.on("error", ({ message }) => {
      setPopupMessage(message);
      setIsPopupOpen(true);
      setIsInvitationSent(false);
    });

    socket.on("challengeReceived", handleChallengeReceived);
    socket.on("challengeDeclined", handleChallengeDeclined);
    socket.on("challengeCancelled", handleChallengeCancelled);
    socket.on("gameStart", handleGameStart);
  };

  // 소켓 리스너 정리
  const cleanupSocketListeners = () => {
    if (socket) {
      socket.off("error");
      socket.off("challengeReceived");
      socket.off("challengeDeclined");
      socket.off("challengeCancelled");
      socket.off("gameStart");
    }
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

  // 대결 신청하기 (초대하는 사람)
  const handleInvite = async (friend) => {
    if (!onlineFriends[friend.id]) {
      setPopupMessage("친구가 온라인 상태일 때만 초대할 수 있습니다.");
      setIsPopupOpen(true);
      return;
    }

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
        socket.emit("sendChallenge", { friendId: friend.id });
      } else {
        setPopupMessage(response.message);
        setIsPopupOpen(true);
      }
    } catch (error) {
      console.error("초대 실패:", error);
      if (error.response?.data?.error) {
        setPopupMessage(error.response.data.error);
      } else {
        setPopupMessage("초대 처리 중 오류가 발생했습니다.");
      }
      setIsPopupOpen(true);
    }
  };

  // 대결 수신 처리 (초대받는 사람)
  const handleChallengeReceived = ({ from, roomId }) => {
    setChallengeFrom({ from, roomId });
    setIsChallengePopupOpen(true);
    socket.emit("joinRoom", { roomId });
  };

  // 초대받은 사람이 대결을 수락함
  const handleChallengeAccept = async () => {
    try {
      await acceptInvitation(token, challengeFrom.from);
      socket.emit("acceptChallenge", {
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
      await declineInvitation(token, challengeFrom.from);
      socket.emit("declineChallenge", {
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

  // 게임 시작 처리
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
      loadFriends();
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
          onConfirm={handleChallengeAccept}
          onCancel={handleChallengeDecline}
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
                  disabled={!onlineFriends[friend.id]}
                  onClick={() => handleInvite(friend)}
                  className={`px-4 py-1 rounded-full ${
                    onlineFriends[friend.id] ? "bg-[#00B2FF]" : "bg-gray-400"
                  } text-white`}
                >
                  {onlineFriends[friend.id] ? "대결신청" : "오프라인"}
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
