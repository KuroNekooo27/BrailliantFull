import { createContext, useContext, useState } from "react";

const DeviceContext = createContext();

export function DeviceProvider({ children }) {
  const [deviceName, setDeviceName] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [characteristic, setCharacteristic] = useState(null);

  return (
    <DeviceContext.Provider
      value={{
        deviceName,
        setDeviceName,
        isConnected,
        setIsConnected,
        characteristic,
        setCharacteristic,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  return useContext(DeviceContext);
}
