// lib/RegistrationContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface RegistrationData {
  // Personal Info
  fullName: string;
  userType: 'job_seeker' | 'hiring';
  profileImage?: string;
  
  // Job Seeker specific
  skills?: string;
  bio?: string;
  
  // Hiring Manager specific  
  skillsNeeded?: string;
  
  // Contact Info (optional)
  phone?: string;
  linkedin?: string;
  instagram?: string;
  website?: string;
}

interface RegistrationContextType {
  registrationData: RegistrationData;
  updateRegistrationData: (data: Partial<RegistrationData>) => void;
  clearRegistrationData: () => void;
  isComplete: () => boolean;
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

const initialRegistrationData: RegistrationData = {
  fullName: '',
  userType: 'job_seeker',
  profileImage: undefined,
  skills: undefined,
  bio: undefined,
  skillsNeeded: undefined,
  phone: undefined,
  linkedin: undefined,
  instagram: undefined,
  website: undefined,
};

export function RegistrationProvider({ children }: { children: ReactNode }) {
  const [registrationData, setRegistrationData] = useState<RegistrationData>(() => {
    // Try to load from localStorage on init
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('registrationData');
      if (saved) {
        try {
          return { ...initialRegistrationData, ...JSON.parse(saved) };
        } catch {
          // If parsing fails, use initial data
          return initialRegistrationData;
        }
      }
    }
    return initialRegistrationData;
  });

  const updateRegistrationData = (data: Partial<RegistrationData>) => {
    const newData = { ...registrationData, ...data };
    setRegistrationData(newData);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('registrationData', JSON.stringify(newData));
    }
  };

  const clearRegistrationData = () => {
    setRegistrationData(initialRegistrationData);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('registrationData');
    }
  };

  const isComplete = () => {
    return !!(registrationData.fullName && registrationData.userType);
  };

  return (
    <RegistrationContext.Provider value={{
      registrationData,
      updateRegistrationData,
      clearRegistrationData,
      isComplete
    }}>
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistration() {
  const context = useContext(RegistrationContext);
  if (context === undefined) {
    throw new Error('useRegistration must be used within a RegistrationProvider');
  }
  return context;
}
