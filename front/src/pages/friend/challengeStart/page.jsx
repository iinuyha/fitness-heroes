import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Popup from "../../../components/Popup";
import { routes } from "../../../constants/routes";
import SocketContext from "../../../contexts/SocketContext";
import { jwtDecode } from "jwt-decode";
import JumpingJackCounter from "../../../components/JumpingJackCounter";

function ChallengeStartPage() {
  const [isPopupOpen, setIsPopupOpen] = useState(true);
  const [isChallenger, setIsChallenger] = useState(false); // 챌린저 여부

  const [myId, setMyId] = useState(""); // 자신의 ID
  const [opponentId, setOpponentId] = useState(""); // 상대방의 ID

  const [myCount, setMyCount] = useState(0); // 내 점핑잭 카운트
  const [opponentCount, setOpponentCount] = useState(0); // 상대방 점핑잭 카운트

  const navigate = useNavigate();
  const { roomId } = useParams(); // roomId 가져오기
  const { socket } = useContext(SocketContext);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null);

  const iceServers = {
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302", // Google STUN 서버
      },
    ],
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate(routes.login);
      return;
    }

    // 토큰에서 사용자 ID 추출
    const decoded = jwtDecode(token);
    const userId = decoded.id;
    setMyId(userId);

    // roomId에서 챌린저와 챌린지드 구분
    const [challengerId, challengedId] = roomId.split("-");
    if (userId === challengerId) {
      setIsChallenger(true);
      setOpponentId(challengedId);
    } else {
      setIsChallenger(false);
      setOpponentId(challengerId);
    }

    // WebRTC 연결 초기화
    initializeWebRTC(userId);

    // WebRTC 신호 처리
    socket.on("offer", async ({ offer, roomId: receivedRoomId }) => {
      if (peerConnection.current && receivedRoomId === roomId) {
        try {
          console.log(`Offer 수신: ${offer}`);
          await peerConnection.current.setRemoteDescription(
            new RTCSessionDescription(offer)
          );
          console.log("Offer를 Remote Description으로 설정 완료");

          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);
          console.log("Answer 생성 및 Local Description 설정 완료");

          socket.emit("answer", { answer, roomId });
        } catch (error) {
          console.error("Offer 처리 중 오류:", error);
        }
      }
    });

    socket.on("answer", async ({ answer, roomId: receivedRoomId }) => {
      if (peerConnection.current && receivedRoomId === roomId) {
        try {
          console.log(`Answer 수신: ${answer}`);
          await peerConnection.current.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
          console.log("Answer를 Remote Description으로 설정 완료");
        } catch (error) {
          console.error("Answer 처리 중 오류:", error);
        }
      }
    });

    socket.on(
      "ice-candidate",
      async ({ candidate, roomId: receivedRoomId }) => {
        if (peerConnection.current && receivedRoomId === roomId) {
          if (peerConnection.current.remoteDescription) {
            try {
              console.log(`ICE 후보 수신: ${JSON.stringify(candidate)}`);
              await peerConnection.current.addIceCandidate(
                new RTCIceCandidate(candidate)
              );
              console.log("ICE 후보 추가 완료");
            } catch (error) {
              console.error("ICE 후보 추가 중 오류:", error);
            }
          } else {
            console.warn(
              "Remote Description이 설정되지 않아 ICE 후보를 추가할 수 없습니다."
            );
          }
        }
      }
    );

    // 상대방 점핑잭 카운트 업데이트
    socket.on("updatedCount", ({ userId, count }) => {
      if (userId !== myId) {
        setOpponentCount(count);
      }
    });

    return () => {
      // Clean up
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("updatedCount");
      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => track.stop());
      }
      if (peerConnection.current) {
        peerConnection.current.close();
      }
    };
  }, [socket, navigate, roomId]);

  const initializeWebRTC = async (userId) => {
    try {
      peerConnection.current = new RTCPeerConnection(iceServers);

      // Local stream
      localStream.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localVideoRef.current.srcObject = localStream.current;

      // Add local stream tracks to peer connection
      localStream.current.getTracks().forEach((track) => {
        console.log(`Adding track: ${track.kind}`);
        peerConnection.current.addTrack(track, localStream.current);
      });

      // Remote stream
      peerConnection.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0]; // 상대방 스트림 연결
        }
      };

      // ICE candidate exchange
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", { candidate: event.candidate, roomId });
        }
      };

      // Create and send offer (if the user is the challenger)
      const challengerId = roomId.split("-")[0];
      if (userId === challengerId) {
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        socket.emit("offer", { offer, roomId });
      }
    } catch (error) {
      console.error("WebRTC 초기화 오류:", error);
    }
  };

  // 팝업 닫기
  const handlePopupClose = () => {
    setIsPopupOpen(false);
  };

  // 점핑잭 카운트 증가 핸들러
  const handleCountIncrease = () => {
    const newCount = myCount + 1;
    setMyCount(newCount);
    socket.emit("updateCount", { roomId, count: newCount });
  };

  return (
    <div className="exercise-start-page">
      {isPopupOpen && (
        <Popup message="게임을 시작합니다!" onClose={handlePopupClose} />
      )}

      {/* 화상 통화 화면 */}
      <div className="webcam-container flex h-screen">
        {isChallenger ? (
          <>
            {/* 챌린저 웹캠 왼쪽 */}
            <div className="local-video w-1/2 h-full flex items-center justify-center bg-gray-200 relative">
              <div className="absolute top-4 left-4 text-white text-xl font-bold z-10 bg-black rounded-lg">
                {myId} (나) - 점핑잭: {myCount}
              </div>
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <button
                onClick={handleCountIncrease}
                className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-base font-semibold absolute bottom-4 right-4 z-20"
              >
                테스트: Count 증가
              </button>
            </div>
            {/* 상대방 웹캠 오른쪽 */}
            <div className="remote-video w-1/2 h-full flex items-center justify-center bg-gray-300 relative">
              <div className="absolute top-4 left-4 text-white text-xl font-bold z-10 bg-black rounded-lg">
                {opponentId} (상대) - 점핑잭: {opponentCount}
              </div>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </>
        ) : (
          <>
            {/* 상대방 웹캠 왼쪽 */}
            <div className="remote-video w-1/2 h-full flex items-center justify-center bg-gray-300 relative">
              <div className="absolute top-4 left-4 text-white text-xl font-bold z-10 bg-black rounded-lg">
                {opponentId} (상대) - 점핑잭: {opponentCount}
              </div>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            {/* 챌린저 웹캠 오른쪽 */}
            <div className="local-video w-1/2 h-full flex items-center justify-center bg-gray-200 relative">
              <div className="absolute top-4 left-4 text-white text-xl font-bold z-10 bg-black rounded-lg">
                {myId} (나) - 점핑잭: {myCount}
              </div>
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <button
                onClick={handleCountIncrease}
                className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-base font-semibold absolute bottom-4 right-4 z-20"
              >
                테스트: Count 증가
              </button>
            </div>
          </>
        )}
      </div>
      <JumpingJackCounter
        videoRef={localVideoRef}
        onCountIncrease={handleCountIncrease}
      />
    </div>
  );
}

export default ChallengeStartPage;
