import React, { createContext, useState, useContext } from 'react';

const DeviceContext = createContext();

export const DeviceProvider = ({ children }) => {
  const [connectedDevice, setConnectedDevice] = useState(null);

  return (
    <DeviceContext.Provider value={{ connectedDevice, setConnectedDevice }}>
      {children}
    </DeviceContext.Provider>
  );
};

export const useDevice = () => useContext(DeviceContext);
