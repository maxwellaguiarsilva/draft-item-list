"use client";

import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { deleteList, duplicateList } from '../app/actions/list';

export const Sidebar = ({ lists }: { lists: any[] }) => {
  const { selectedListId, setSelectedListId } = useAppContext();
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <aside className="w-64 bg-black border-r border-gray-800 h-screen p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white">Lists</h2>
        <button onClick={toggleSidebar} className="text-gray-400">☰</button>
      </div>
      {isSidebarOpen && (
        <ul className="space-y-2">
        {lists.map((list) => (
          <li
            key={list.id}
            className={`flex items-center justify-between p-2 rounded cursor-pointer ${
              selectedListId === list.id ? 'bg-blue-900' : 'hover:bg-gray-800'
            }`}
            onClick={() => setSelectedListId(list.id)}
          >
            <span>{list.name}</span>
            <div className="relative">
              <button
                className="text-gray-400 hover:text-white px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingId(editingId === list.id ? null : list.id);
                }}
              >
                ...
              </button>
              {editingId === list.id && (
                <div className="absolute right-0 bg-gray-900 border border-gray-700 rounded p-2 z-10">
                  <button
                    className="block w-full text-left p-1 text-sm hover:bg-gray-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateList(list.id);
                      setEditingId(null);
                    }}
                  >
                    Duplicate
                  </button>
                  <button
                    className="block w-full text-left p-1 text-sm text-red-500 hover:bg-gray-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteList(list.id);
                      setEditingId(null);
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
};
