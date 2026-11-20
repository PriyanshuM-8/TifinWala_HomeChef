import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import chefService from '../services/chefService';

const AuthContext = createContext(null);

const normalizeUser = (u) => {
  if (!u) return null;
  const idVal = u._id || u.id;
  return { ...u, _id: idVal, id: idVal };
};

const normalizeProfile = (p) => {
  if (!p) return null;
  const idVal = p._id || p.id;
  return { ...p, _id: idVal, id: idVal };
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('gharkaswad_chef_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('gharkaswad_chef_user');
      return saved ? normalizeUser(JSON.parse(saved)) : null;
    } catch {
      return null;
    }
  });
  const [chefProfile, setChefProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('gharkaswad_chef_profile');
      return saved ? normalizeProfile(JSON.parse(saved)) : null;
    } catch {
      return null;
    }
  });
  const [approvalStatus, setApprovalStatus] = useState(() => {
    return chefProfile?.approvalStatus || 'pending';
  });
  const [loading, setLoading] = useState(true);

  /**
   * Logout
   */
  const logout = useCallback(() => {
    authService.logout();
    setToken(null);
    setUser(null);
    setChefProfile(null);
    setApprovalStatus('pending');
  }, []);

  // Synchronize chef status and profile from backend
  const refreshProfile = useCallback(async () => {
    if (!token) return;
    try {
      const [statusRes, profileRes] = await Promise.allSettled([
        chefService.getApprovalStatus(),
        chefService.getProfile(),
      ]);

      if (statusRes.status === 'fulfilled' && statusRes.value?.success) {
        const newStatus = statusRes.value.approvalStatus || 'pending';
        setApprovalStatus(newStatus);
      }

      if (profileRes.status === 'fulfilled' && profileRes.value?.success) {
        const rawProfile =
          profileRes.value.profile ||
          profileRes.value.chefProfile ||
          profileRes.value.data;
        if (rawProfile) {
          const newProfile = normalizeProfile(rawProfile);
          setChefProfile(newProfile);
          if (newProfile.approvalStatus) {
            setApprovalStatus(newProfile.approvalStatus);
          }
          localStorage.setItem('gharkaswad_chef_profile', JSON.stringify(newProfile));
        }
      }
    } catch (err) {
      console.error('Failed to sync chef profile:', err);
    }
  }, [token]);

  // Initial load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('gharkaswad_chef_token');
      if (storedToken) {
        try {
          const meData = await authService.getMe();
          if (meData?.user) {
            if (meData.user.role !== 'chef') {
              throw new Error('Access denied. This portal is strictly for GharKaSwad HomeChef partners.');
            }
            const normalizedU = normalizeUser(meData.user);
            setUser(normalizedU);
            localStorage.setItem('gharkaswad_chef_user', JSON.stringify(normalizedU));
            await refreshProfile();
          }
        } catch (err) {
          console.error('Auth verification failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [refreshProfile, logout]);

  /**
   * HomeChef Partner Login
   */
  const login = async (email, password) => {
    const data = await authService.login(email, password);
    if (!data?.token || !data?.user) {
      throw new Error(data?.message || 'Login failed. Invalid response from server.');
    }

    if (data.user.role !== 'chef') {
      throw new Error('Access restricted: Only GharKaSwad HomeChef accounts can log in here.');
    }

    const normalizedU = normalizeUser(data.user);
    const normalizedProf = normalizeProfile(data.chefProfile);

    setToken(data.token);
    setUser(normalizedU);
    localStorage.setItem('gharkaswad_chef_token', data.token);
    localStorage.setItem('gharkaswad_chef_user', JSON.stringify(normalizedU));

    if (normalizedProf) {
      setChefProfile(normalizedProf);
      setApprovalStatus(normalizedProf.approvalStatus || 'pending');
      localStorage.setItem('gharkaswad_chef_profile', JSON.stringify(normalizedProf));
    }

    // Immediately sync freshest status
    try {
      const statusRes = await chefService.getApprovalStatus();
      if (statusRes?.success && statusRes.approvalStatus) {
        setApprovalStatus(statusRes.approvalStatus);
      }
    } catch {
      // Ignore background sync failure on login
    }

    return data;
  };

  /**
   * Step 1: Send registration OTP
   */
  const registerSendOtp = async (formData) => {
    return await authService.registerSendOtp(formData);
  };

  /**
   * Step 2: Verify registration OTP and authenticate
   */
  const registerVerifyOtp = async (verifyData) => {
    const data = await authService.registerVerifyOtp(verifyData);
    if (data?.token && data?.user) {
      setToken(data.token);
      setUser(data.user);
      setApprovalStatus('pending');
      localStorage.setItem('gharkaswad_chef_token', data.token);
      localStorage.setItem('gharkaswad_chef_user', JSON.stringify(data.user));

      if (data.chefProfile) {
        setChefProfile(data.chefProfile);
        localStorage.setItem('gharkaswad_chef_profile', JSON.stringify(data.chefProfile));
      }
    }
    return data;
  };

  const value = {
    token,
    user,
    chefProfile,
    approvalStatus,
    isAuthenticated: !!token && !!user,
    isApproved: approvalStatus === 'approved',
    isPending: approvalStatus === 'pending',
    isRejected: approvalStatus === 'rejected',
    loading,
    login,
    registerSendOtp,
    registerVerifyOtp,
    refreshProfile,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
