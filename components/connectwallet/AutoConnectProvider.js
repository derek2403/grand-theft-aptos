"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const AUTO_CONNECT_LOCAL_STORAGE_KEY = "AptosWalletAutoConnect";

export const AutoConnectContext = createContext({
  autoConnect: true,
  setAutoConnect: () => {},
});

export function useAutoConnect() {
  return useContext(AutoConnectContext);
}

export const AutoConnectProvider = ({ children }) => {
  const [autoConnect, setAutoConnect] = useState(true);

  useEffect(() => {
    try {
      const isAutoConnect = localStorage.getItem(AUTO_CONNECT_LOCAL_STORAGE_KEY);
      if (isAutoConnect === 'false') {
        setAutoConnect(false);
      }
    } catch (e) {
      if (typeof window !== "undefined") {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        AUTO_CONNECT_LOCAL_STORAGE_KEY,
        JSON.stringify(autoConnect)
      );
    } catch (error) {
      if (typeof window !== "undefined") {
        console.error(error);
      }
    }
  }, [autoConnect]);

  return (
    <AutoConnectContext.Provider value={{ autoConnect, setAutoConnect }}>
      {children}
    </AutoConnectContext.Provider>
  );
};