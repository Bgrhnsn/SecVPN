import { createContext, useContext, useState } from 'react';

// Sunucu bilgilerinin tipi
export interface Server {
  id: string;
  country: string;
  flag: string;
  ping: number;
  isVirtual: boolean; // Gerçek sunucu mu yoksa görsel olarak mı var
}

// Gerçek sunucu ayarları
export const REAL_SERVER = {
  remoteAddress: '35.185.234.63', // Gerçek VPN sunucusu
  ovpnFileName: 'client',
  assetsPath: 'ovpn/',
};

// Sunucu listesi (görsel)
export const SERVERS: Server[] = [
  { id: '1', country: 'United States', flag: '🇺🇸', ping: 45, isVirtual: true },
  { id: '2', country: 'United Kingdom', flag: '🇬🇧', ping: 62, isVirtual: true },
  { id: '3', country: 'Germany', flag: '🇩🇪', ping: 78, isVirtual: true },
  { id: '4', country: 'Japan', flag: '🇯🇵', ping: 112, isVirtual: true },
  { id: '5', country: 'Singapore', flag: '🇸🇬', ping: 94, isVirtual: true },
];

// Context için tip tanımı
interface ServerContextType {
  selectedServer: Server;
  setSelectedServer: (server: Server) => void;
  serverList: Server[];
}

// Varsayılan sunucu (ABD)
const DEFAULT_SERVER = SERVERS[0];

// Context oluşturma
const ServerContext = createContext<ServerContextType>({
  selectedServer: DEFAULT_SERVER,
  setSelectedServer: () => {},
  serverList: SERVERS,
});

// Hook
export const useServer = () => useContext(ServerContext);

// Provider component
export const ServerProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [selectedServer, setSelectedServer] = useState<Server>(DEFAULT_SERVER);

  return (
    <ServerContext.Provider value={{
      selectedServer,
      setSelectedServer,
      serverList: SERVERS,
    }}>
      {children}
    </ServerContext.Provider>
  );
}; 