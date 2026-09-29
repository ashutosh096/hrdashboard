import React, { createContext, useContext, useState } from 'react';

type EntityCode = 'ALL' | 'EHM' | 'CAG' | 'COMMON';

interface EntityContextType {
  selectedEntity: EntityCode;
  setSelectedEntity: (code: EntityCode) => void;
}

const EntityContext = createContext<EntityContextType>({
  selectedEntity: 'ALL',
  setSelectedEntity: () => {},
});

export const EntityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedEntity, setSelectedEntityState] = useState<EntityCode>(() => {
    try {
      const stored = localStorage.getItem('hros_selected_entity');
      if (stored === 'EHM' || stored === 'CAG' || stored === 'COMMON' || stored === 'ALL') {
        return stored;
      }
    } catch {}
    return 'ALL';
  });

  const setSelectedEntity = (code: EntityCode) => {
    setSelectedEntityState(code);
    try {
      localStorage.setItem('hros_selected_entity', code);
    } catch {}
    window.dispatchEvent(new CustomEvent('entity-changed', { detail: code }));
  };

  return (
    <EntityContext.Provider value={{ selectedEntity, setSelectedEntity }}>
      {children}
    </EntityContext.Provider>
  );
};

export const useEntity = () => useContext(EntityContext);
