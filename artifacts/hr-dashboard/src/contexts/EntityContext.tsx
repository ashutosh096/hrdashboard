import React, { createContext, useContext, useState } from 'react';

type EntityCode = 'ALL' | 'EHM' | 'CAG';

interface EntityContextType {
  selectedEntity: EntityCode;
  setSelectedEntity: (code: EntityCode) => void;
}

const EntityContext = createContext<EntityContextType>({
  selectedEntity: 'ALL',
  setSelectedEntity: () => {},
});

export const EntityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedEntity, setSelectedEntity] = useState<EntityCode>('ALL');

  return (
    <EntityContext.Provider value={{ selectedEntity, setSelectedEntity }}>
      {children}
    </EntityContext.Provider>
  );
};

export const useEntity = () => useContext(EntityContext);
