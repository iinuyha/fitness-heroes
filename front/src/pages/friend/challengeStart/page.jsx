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
  const [opponentLeft, setOpponentLeft] = useState(false); // 상대방이 나갔는지 여부

  const [myId, setMyId] = useState(""); // 자신의 ID
  const [opponentId, setOpponentId] = useState(""); // 상대방의 ID

  const [myCount, setMyCount] = useState(0); // 내 점핑잭 카운트
  const [opponentCount, setOpponentCount] = useState(0); // 상대방 점핑잭 카운트

  const [isReady, setIsReady] = useState(false); // 내가 준비되었는지 여부
  const [opponentReady, setOpponentReady] = useState(false); // 상대방 준비 여부
  const [countdown, setCountdown] = useState(0); // 카운트다운 값
  const [canCount, setCanCount] = useState(false); // 점핑잭 카운트 활성화 여부

  const [remainingTime, setRemainingTime] = useState(0); // 남은 게임 시간

  const [popupContent, setPopupContent] = useState(null); // 결과 Popup 내용을 저장

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

    // 상대방이 준비됐는지
    socket.on("opponentReady", () => {
      setOpponentReady(true);
    });

    // 모두 준비 되면 카운트다운 3초 시작
    socket.on("startCountdown", () => {
      let countdownValue = 3;
      setCountdown(countdownValue);
      const countdownInterval = setInterval(() => {
        countdownValue -= 1;
        setCountdown(countdownValue);
        if (countdownValue === 0) {
          setCanCount(true); // 카운트 활성화
          clearInterval(countdownInterval);
          startGameTimer();
        }
      }, 1000);
    });

    // 상대방 점핑잭 카운트 업데이트
    socket.on("updatedCount", ({ userId, count }) => {
      if (userId !== myId) {
        setOpponentCount(count);
      }
    });

    // 상대방이 나갔을 때 처리
    socket.on("userLeft", () => {
      setOpponentLeft(true); // 상대방 나감 상태 업데이트
      setTimeout(() => {
        navigate(-1); // 이전 페이지로 이동
      }, 5000); // 5초 뒤 페이지 이동
    });

    // 대결 종료시
    socket.on("challengeEnded", ({ message, scores, resultMessage }) => {
      // 최종 스코어와 결과 메시지를 Popup에 표시
      setPopupContent(`
        ${message}
        
          ${Object.entries(scores)
            .map(([userId, score]) => `${score}점`)
            .join(":")}
        
        ${resultMessage}
      `);
    });

    return () => {
      // 이벤트 정리
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("opponentReady");
      socket.off("startCountdown");
      socket.off("updatedCount");
      socket.off("userLeft");
      socket.off("challengeEnded");

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

  const handleReady = () => {
    setIsReady(true);
    socket.emit("ready", { roomId });
  };

  // 팝업 닫기
  const handlePopupClose = () => {
    setIsPopupOpen(false);
  };

  // 점핑잭 카운트 증가 핸들러
  const handleCountIncrease = () => {
    // 카운트 가능한 상태
    console.log("canCount 상태:", canCount);
    if (canCount) {
      setMyCount((prevCount) => {
        console.log("이전 카운트:", prevCount);
        const newCount = prevCount + 1;
        console.log("새로운 카운트:", newCount);
        socket.emit("updateCount", { roomId, count: newCount });
        return newCount;
      });
    }
  };

  const startGameTimer = () => {
    const gameDuration = 30; // 게임 시간 30초
    setRemainingTime(gameDuration); // 초기 시간 설정
    setCanCount(true); // 점핑잭 카운트 활성화

    const timerInterval = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerInterval); // 타이머 종료
          setCanCount(false); // 점핑잭 카운트 비활성화
          socket.emit("endChallenge", { roomId });
          return 0;
        }
        return prevTime - 1; // 1초씩 감소
      });
    }, 1000);
  };

  return (
    <div className="exercise-start-page">
      {isPopupOpen && (
        <Popup
          message="<b><u>준비 버튼</u></b>을 눌러주세요!<br>모두 준비가 완료되면 3초 카운트다운 후 대결이 시작됩니다."
          onClose={() => setIsPopupOpen(false)}
        />
      )}
      {popupContent && (
        <Popup
          message={popupContent}
          onClose={() => {
            setIsPopupOpen(false);
            navigate(-1); // 이전 페이지로 이동
          }}
        />
      )}
      {opponentLeft && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-xl font-bold z-30">
          상대방이 방을 나가 대결이 중단되었습니다. 5초 후 이전 화면으로
          돌아갑니다.
        </div>
      )}
      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-black text-white text-xl font-bold px-4 py-2 rounded-lg z-30">
        남은 시간: {remainingTime}초
      </div>
      <div className="absolute top-0 left-0 w-full z-10">
        <button
          onClick={() => {
            socket.emit("disconnectFromChallenge", { roomId }); // 이벤트 발생
            navigate(-1); // 이전 페이지로 이동
          }}
          className="px-2 py-1 bg-red-500 text-white"
        >
          나가기
        </button>
      </div>
      <div className="webcam-container flex h-screen">
        {isChallenger ? (
          <>
            <div></div>
            <div className="local-video w-1/2 h-full flex items-center justify-center bg-gray-200 relative">
              <div className="absolute top-5 left-1/2 text-white text-xl font-bold z-10 bg-black rounded-lg">
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
              {!isReady && (
                <button
                  onClick={handleReady}
                  className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-base font-semibold absolute bottom-4 left-4 z-20"
                >
                  준비
                </button>
              )}
            </div>
            <div className="remote-video w-1/2 h-full flex items-center justify-center bg-gray-300 relative">
              <div className="absolute top-5 left-1/2 text-white text-xl font-bold z-10 bg-black rounded-lg">
                {opponentId} (상대) - 점핑잭: {opponentCount}
              </div>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-1/2 text-white text-xl z-20">
                {opponentReady ? "상대방 준비 완료" : "상대방 준비 중..."}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="remote-video w-1/2 h-full flex items-center justify-center bg-gray-300 relative">
              <div className="absolute top-5 left-1/2 text-white text-xl font-bold z-10 bg-black rounded-lg">
                {opponentId} (상대) - 점핑잭: {opponentCount}
              </div>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-1/2 text-white text-xl z-20">
                {opponentReady ? "상대방 준비 완료" : "상대방 준비 중..."}
              </div>
            </div>
            <div className="local-video w-1/2 h-full flex items-center justify-center bg-gray-200 relative">
              <div className="absolute top-5 left-1/2 text-white text-xl font-bold z-10 bg-black rounded-lg">
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
              {!isReady && (
                <button
                  onClick={handleReady}
                  className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-base font-semibold absolute bottom-4 left-4 z-20"
                >
                  준비
                </button>
              )}
            </div>
          </>
        )}
      </div>
      {countdown > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-6xl font-bold z-30">
          {countdown}
        </div>
      )}
      <JumpingJackCounter
        videoRef={localVideoRef}
        onCountIncrease={handleCountIncrease}
      />
    </div>
  );
}

export default ChallengeStartPage;
