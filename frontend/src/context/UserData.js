// src/context/UserData.jsx
'use client';
import { createContext, useEffect, useState } from "react";
import Constant from "@/config/constant";
import { decrypt } from "@/utils/encrypt.decrypt";

export const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const [role, setRole] = useState('');
  const [user, setUser] = useState({});

  useEffect(() => {
    const encryptedUser = localStorage.getItem(Constant.AUTH_KEY) || '';
    const user = encryptedUser ? decrypt(encryptedUser) : null;

    if (encryptedUser) {
      if (user && user?.token) {
        setRole(user?.role);
        setUser(user);
      }
    }
  }, []);

  const updateUser = () => {
    const encryptedUser = localStorage.getItem(Constant.AUTH_KEY) || '';
    const user = encryptedUser ? decrypt(encryptedUser) : null;

    if (encryptedUser) {
      if (user && user?.token) {
        setRole(user?.role);
        delete user?.module_permissions;
        setUser(user);
      }
    }
  };

  return (
    <UserContext.Provider value={{ role, user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};