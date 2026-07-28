'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Document } from '../models/document';
import { Entity } from '../models/entity';
import { loadDocumentMetadata, loadAllEntities } from '../utils/data-loader';

interface DataContextType {
  documents: Document[];
  entities: Entity[];
  isLoading: boolean;
  error: string | null;
}

const DataContext = createContext<DataContextType>({
  documents: [],
  entities: [],
  isLoading: false,
  error: null
});

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [docs, ents] = await Promise.all([
          loadDocumentMetadata(),
          loadAllEntities()
        ]);
        setDocuments(docs);
        setEntities(ents);
      } catch (err) {
        console.error('Error in DataProvider:', err);
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <DataContext.Provider value={{ documents, entities, isLoading, error }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
