import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface Settings {
  discord_invite_url: string;
  game_url: string;
  app_icon_url: string;
  bg_home: string;
  bg_mutations: string;
  bg_plants: string;
  bg_codes?: string;
  bg_updates?: string;
}

interface SettingsContextType {
  settings: Settings | null;
  refreshSettings: () => Promise<void>;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      const res = await axios.get('/api/settings/public');
      setSettings(res.data);
    } catch (error) {
      console.error('Failed to load settings', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, refreshSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
