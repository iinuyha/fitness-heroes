import React, { createContext, useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [onlineFriends, setOnlineFriends] = useState({});
  const socketRef = useRef(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      socketRef.current = io(process.env.REACT_APP_SERVER_URL, {
        auth: { token },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
      });

      socketRef.current.on("connect", () => {
        console.log("Connected to server with ID:", socketRef.current.id);
      });

      // 전체 사용자 온라인 상태 업데이트
      socketRef.current.on("userStatusUpdate", (updatedStatus) => {
        setOnlineFriends(updatedStatus);
      });

      return () => {
        socketRef.current.disconnect();
      };
    }
  }, [token]);

  return (
    <SocketContext.Provider
      value={{ socket: socketRef.current, onlineFriends }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
