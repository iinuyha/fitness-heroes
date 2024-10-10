import './index.css';
import {RouterProvider} from "react-router-dom"
import router from "./routes/routing"

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
