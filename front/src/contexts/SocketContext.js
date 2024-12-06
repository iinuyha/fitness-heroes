import React, { createContext, useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [onlineFriends, setOnlineFriends] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      // 소켓 초기화
      socketRef.current = io(process.env.REACT_APP_SERVER_URL, {
        auth: { token },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
      });

      const socket = socketRef.current;

      // 소켓 연결 확인
      socket.on("connect", () => {
        console.log("Connected to server with ID:", socket.id);
        setIsConnected(true); // 연결 완료 상태 업데이트
      });

      // 연결 끊김 처리
      socket.on("disconnect", () => {
        console.log("Disconnected from server");
        setIsConnected(false); // 연결 끊김 상태 업데이트
      });

      // 전체 사용자 상태 업데이트
      socket.on("userStatusUpdate", (updatedStatus) => {
        console.log("User status updated:", updatedStatus);
        setOnlineFriends(updatedStatus);
      });

      // 에러 처리
      socket.on("connect_error", (err) => {
        console.error("Connection error:", err.message);
      });

      // 클린업
      return () => {
        socket.disconnect();
        console.log("Socket disconnected on cleanup");
        setIsConnected(false);
      };
    }
  }, [token]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        onlineFriends,
        isConnected,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;