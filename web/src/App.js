import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { DeviceProvider } from "./pages/user/devide settings/context/DeviceContext";

function App() {
  return (
    <BrowserRouter>
      <DeviceProvider>
        <AppRoutes />
      </DeviceProvider>
    </BrowserRouter>
  );
}

export default App;
