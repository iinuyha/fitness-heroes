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

      socketRef.current.on("userStatusUpdate", ({ userId, isOnline }) => {
        setOnlineFriends((prevStatus) => ({
          ...prevStatus,
          [userId]: isOnline,
        }));
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
