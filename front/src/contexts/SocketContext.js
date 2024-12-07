import React, {
  createContext,
  useState,
  useEffect,
  useRef,
  useContext,
} from "react";
import io from "socket.io-client";
import { PopupContext } from "./PopupContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [onlineFriends, setOnlineFriends] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); // 소켓 초기화 상태 추가
  const token = localStorage.getItem("token");
  const socketRef = useRef(null);
  const { showPopup } = useContext(PopupContext);

  useEffect(() => {
    if (token && !socketRef.current) {
      socketRef.current = io(process.env.REACT_APP_SERVER_URL, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
      });

      const socket = socketRef.current;

      socket.on("connect", () => {
        console.log("Connected to server with ID:", socket.id);
        setIsConnected(true);
      });
      // userStatusUpdate 이벤트 리스너 등록
      socket.on("userStatusUpdate", (updatedStatus) => {
        setOnlineFriends(updatedStatus);
      });

      // // challengeReceived 이벤트 처리
      // socket.on("challengeReceived", ({ from, roomId }) => {
      //   showPopup(
      //     `${from}님이 대결을 신청했습니다. 수락하시겠습니까?`,
      //     // 수락 동작
      //     () => {
      //       console.log("call acceptChallenge");
      //       socket.emit("joinRoom", { roomId });
      //       socket.emit("acceptChallenge", { roomId });
      //       navigate(`/friend/challenge/${roomId}`); // navigate로 이동
      //     },
      //     // 거절 동작
      //     () => {
      //       console.log("call declineChallenge");
      //       socket.emit("declineChallenge", { roomId });
      //     }
      //   );
      // });

      // // gameStart 이벤트 처리
      // socket.on("gameStart", ({ roomId }) => {
      //   console.log("Game starting for room:", roomId);
      //   navigate(`/friend/challenge/${roomId}`); // navigate로 이동
      // });

      // 연결 에러 처리
      socket.on("connect_error", (err) => {
        console.error("Connection error:", err.message);
      });
      setIsInitialized(true);

      // 연결 종료 시 처리
      socket.on("disconnect", () => {
        console.log("Disconnected from server");
        setIsConnected(false);
      });

      socket.connect();

      setIsInitialized(true);
    } else {
      console.error("No token found, socket cannot initialize.");
    }

    // Cleanup on component unmount
    return () => {
      if (socketRef.current) {
        // socketRef.current.disconnect();
        // socketRef.current = null;
        // setIsConnected(false);
      }
    };
  }, [token, showPopup]);

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
