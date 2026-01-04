/**
 * Custom hook for managing admin mode state
 */

import { useState, useEffect } from 'react';

const ADMIN_MODE_KEY = 'ipb-admin-mode';
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

export const useAdminMode = () => {
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [adminPasswordInput, setAdminPasswordInput] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Load admin mode from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const adminMode = localStorage.getItem(ADMIN_MODE_KEY);
            if (adminMode === 'true') {
                setIsAdminMode(true);
            }
        }
    }, []);

    const handleAdminLogin = () => {
        if (adminPasswordInput === ADMIN_PASSWORD) {
            setIsAdminMode(true);
            localStorage.setItem(ADMIN_MODE_KEY, 'true');
            setShowAdminModal(false);
            setAdminPasswordInput('');
            setPasswordError('');
        } else {
            setPasswordError('Incorrect password. Please try again.');
        }
    };

    const handleAdminLogout = () => {
        setIsAdminMode(false);
        localStorage.removeItem(ADMIN_MODE_KEY);
    };

    const openAdminModal = () => setShowAdminModal(true);
    const closeAdminModal = () => {
        setShowAdminModal(false);
        setAdminPasswordInput('');
        setPasswordError('');
    };

    return {
        isAdminMode,
        showAdminModal,
        adminPasswordInput,
        setAdminPasswordInput,
        passwordError,
        setPasswordError,
        showPassword,
        setShowPassword,
        handleAdminLogin,
        handleAdminLogout,
        openAdminModal,
        closeAdminModal
    };
};
