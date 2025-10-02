import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { useState } from "react";

function App() {
  const [characteristic, setCharacteristic] = useState(null);
  return (
    <BrowserRouter>
      <AppRoutes characteristic={characteristic} setCharacteristic={setCharacteristic}/>
    </BrowserRouter>
  );
}

export default App;
