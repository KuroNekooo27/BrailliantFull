import React, { createContext, useContext, useState } from "react";

const DeviceContext = createContext();

export const DeviceProvider = ({ children }) => {
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [deviceServices, setDeviceServices] = useState([]);
  const [deviceCharacteristics, setDeviceCharacteristics] = useState([]);
  const [writeService, setWriteService] = useState(null);
  const [writeCharacteristic, setWriteCharacteristic] = useState(null);
  const [brailleSeconds, setBrailleSeconds] = useState(1750); 

  return (
    <DeviceContext.Provider
      value={{
        connectedDevice,
        setConnectedDevice,
        deviceServices,
        setDeviceServices,
        deviceCharacteristics,
        setDeviceCharacteristics,
        writeService,
        setWriteService,
        writeCharacteristic,
        setWriteCharacteristic,
        brailleSeconds,
        setBrailleSeconds,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
};

export const useDevice = () => useContext(DeviceContext);
