import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { DeviceProvider } from "./pages/user/devide settings/context/DeviceContext";

function App() {
  
  return (
    <DeviceProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </DeviceProvider>
  );
}

export default App;
