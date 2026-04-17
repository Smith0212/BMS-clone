// src/context/CredentialContext.jsx
'use client';
import { createContext, useContext, useState, useEffect } from 'react';
// import * as API from '@/utils/api.services';
import { Codes } from '@/config/constant';
import { TOAST_ERROR } from '@/config/common';

const CredentialContext = createContext();

export const CredentialProvider = ({ children }) => {
    const [credentials, setCredentials] = useState(null);

    // useEffect(() => {
    //     API.getCredential().then((r) => {
    //         if (r.code === Codes.SUCCESS) {
    //             setCredentials(r?.data);
    //         } else {
    //             TOAST_ERROR('Oops! Something went wrong');
    //         }
    //     });
    // }, []); 

    return (
        <CredentialContext.Provider value={credentials}>
            {children}
        </CredentialContext.Provider>
    );
};

export const useCredentials = () => useContext(CredentialContext);