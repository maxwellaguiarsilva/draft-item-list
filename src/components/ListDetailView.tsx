"use client";

import { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { getListDetails } from '../app/actions/list';

export const ListDetailView = () => {
  const { selectedListId } = useAppContext();
  const [list, setList] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedListId) {
      setLoading(true);
      getListDetails(selectedListId)
        .then(setList)
        .finally(() => setLoading(false));
    } else {
      setList(null);
    }
  }, [selectedListId]);

  if (!selectedListId) return <div className="p-4">Select a list to view details.</div>;
  if (loading) return <div className="p-4">Loading...</div>;
  if (!list) return <div className="p-4">List not found.</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">{list.name}</h2>
      <p className="text-gray-500 mb-4">{list.category}</p>
      
      {/* Groups and items rendering will go here */}
      <pre>{JSON.stringify(list, null, 2)}</pre>
    </div>
  );
};
