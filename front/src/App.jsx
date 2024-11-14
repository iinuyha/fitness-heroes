import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "./routes/routing";
import { SocketProvider } from "./contexts/SocketContext"; // SocketContext 경로 수정

function App() {
  return (
    <SocketProvider>
      <RouterProvider router={router} />
    </SocketProvider>
  );
}

export default App;
