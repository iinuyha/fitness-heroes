import React, {
  createContext,
  useState,
  useEffect,
  useRef,
  useContext,
} from "react";
import { acceptInvitation, declineInvitation } from "../pages/friend/api/api";
// import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { PopupContext } from "./PopupContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [onlineFriends, setOnlineFriends] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); // 소켓 초기화 상태 추가
  const [token, setToken] = useState(localStorage.getItem("token")); // 토큰 상태 추가
  const socketRef = useRef(null);
  const { showPopup } = useContext(PopupContext);
  // const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken); // 로컬 스토리지에서 가져온 토큰으로 상태 업데이트
    }
  }, []); // 컴포넌트 마운트 시 로컬 스토리지에서 토큰 가져오기

  useEffect(() => {
    console.log(token);
    if (token) {
      if (!socketRef.current) {
        // 소켓 초기화
        socketRef.current = io(process.env.REACT_APP_SERVER_URL, {
          auth: { token },
          transports: ["websocket"],
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 2000,
          autoConnect: false,
        });

        const socket = socketRef.current;

        socket.on("connect", () => {
          console.log("Connected to server with ID:", socket.id);
          setIsConnected(true);
        });

        socket.on("disconnect", () => {
          console.log("Disconnected from server");
          setIsConnected(false);
        });

        socket.on("userStatusUpdate", (updatedStatus) => {
          setOnlineFriends(updatedStatus);
        });

        // 대결 신청 이벤트 처리
        socket.on("challengeReceived", ({ from, roomId }) => {
          showPopup(
            `${from}님이 대결을 신청했습니다. 수락하시겠습니까?`,
            // 확인 버튼 동작
            async () => {
              await acceptInvitation(token, from);
              socket.emit("acceptChallenge", {
                roomId,
              });
              socket.emit("joinRoom", { roomId });
            },
            // 거절 버튼 동작
            async () => {
              await declineInvitation(token, from);
              socket.emit("declineChallenge", {
                roomId,
              });
            }
          );
        });

        socket.on("gameStart", ({ roomId }) => {
          console.log(roomId);
          window.location.href = `/friend/challenge/${roomId}`;
        });

        socket.on("connect_error", (err) => {
          console.error("Connection error:", err.message);
        });

        socket.connect();
      }

      setIsInitialized(true);
    } else {
      console.error("No token found, socket cannot initialize.");
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off("connect");
        socketRef.current.off("disconnect");
        socketRef.current.off("challengeReceived");
        // socketRef.current.off("redirect");
        socketRef.current.off("gameStart");
        socketRef.current.off("userStatusUpdate");
        socketRef.current.off("connect_error");
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, [token, showPopup]); // token 상태가 변경될 때만 실행

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        onlineFriends,
        isConnected,
        isInitialized,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
