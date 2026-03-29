"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { deleteList, duplicateList, updateList, moveList, createList } from '../app/actions/list';
import { NewListModal } from './NewListModal';

interface List {
  id: string;
  name: string;
  category: string;
  position: number;
}

const EditMenu = ({ onRename, onDelete, onDuplicate, onMoveUp, onMoveDown }: {
  onRename: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        className="p-1 rounded cursor-pointer text-text-secondary hover:text-text text-base"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        ⋮
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full z-10 bg-menu border border-border rounded p-1 min-w-[120px]">
          <button className="w-full text-left bg-none border-none text-text p-2 text-sm cursor-pointer hover:bg-hover" onClick={(e) => { e.stopPropagation(); onRename(); setIsOpen(false); }}>Rename</button>
          <button className="w-full text-left bg-none border-none text-text p-2 text-sm cursor-pointer hover:bg-hover" onClick={(e) => { e.stopPropagation(); onDuplicate(); setIsOpen(false); }}>Duplicate</button>
          <button className="w-full text-left bg-none border-none text-text p-2 text-sm cursor-pointer hover:bg-hover" onClick={(e) => { e.stopPropagation(); onMoveUp(); setIsOpen(false); }}>Move Up</button>
          <button className="w-full text-left bg-none border-none text-text p-2 text-sm cursor-pointer hover:bg-hover" onClick={(e) => { e.stopPropagation(); onMoveDown(); setIsOpen(false); }}>Move Down</button>
          <button className="w-full text-left bg-none border-none text-text p-2 text-sm cursor-pointer hover:bg-hover text-error" onClick={(e) => { e.stopPropagation(); onDelete(); setIsOpen(false); }}>Delete</button>
        </div>
      )}
    </div>
  );
};

export const Sidebar = ({ lists }: { lists: List[] }) => {
  const { selectedListId, setSelectedListId, isSidebarOpen, toggleSidebar, addNotification } = useAppContext();
  const [isNewListModalOpen, setIsNewListModalOpen] = useState(false);

  useEffect(() => {
    if (!selectedListId && lists.length > 0) {
      setSelectedListId(lists[0].id);
    }
  }, [lists, selectedListId, setSelectedListId]);

  const handleRename = async (list: List) => {
    const newName = prompt("Enter new list name:", list.name);
    if (newName && newName !== list.name) {
      const result = await updateList(list.id, { name: newName });
      if (!result.success) addNotification(result.error, 'error');
    }
  };

  const handleDelete = async (list: List) => {
    if (confirm(`Delete list "${list.name}"?`)) {
      const result = await deleteList(list.id);
      if (!result.success) addNotification(result.error, 'error');
      if (selectedListId === list.id) {
        setSelectedListId(null);
      }
    }
  };

  return (
    <aside className="flex flex-col h-full w-[260px] bg-bg border-r border-border">
      <div className="p-4 flex justify-between items-center">
        <h2 className="text-xl m-0">Lists</h2>
        <button onClick={toggleSidebar} className="p-1 rounded cursor-pointer text-text-secondary hover:text-text">☰</button>
      </div>
      {isSidebarOpen && (
        <div className="flex-1 overflow-y-auto p-2">
          <div className="mb-4">
            <button 
              onClick={() => setIsNewListModalOpen(true)}
              className="w-full p-2 bg-green-600 text-white rounded text-center cursor-pointer hover:bg-green-700"
            >
              +
            </button>
          </div>
          <ul className="list-none p-0 m-0">
            {lists.map((list) => (
              <li
                key={list.id}
                className={`flex justify-between items-center p-3 rounded cursor-pointer transition-colors duration-200 hover:bg-hover ${selectedListId === list.id ? 'bg-accent' : ''}`}
                onClick={() => setSelectedListId(list.id)}
              >
                <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                    {list.name}
                </span>
                <EditMenu 
                    onRename={() => handleRename(list)}
                    onDuplicate={async () => {
                        const result = await duplicateList(list.id);
                        if (!result.success) addNotification(result.error, 'error');
                    }}
                    onMoveUp={async () => {
                        const result = await moveList(list.id, 'up');
                        if (!result.success) addNotification(result.error, 'error');
                    }}
                    onMoveDown={async () => {
                        const result = await moveList(list.id, 'down');
                        if (!result.success) addNotification(result.error, 'error');
                    }}
                    onDelete={() => handleDelete(list)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
      <NewListModal 
        isOpen={isNewListModalOpen} 
        onClose={() => setIsNewListModalOpen(false)}
        onConfirm={async (name: string) => {
            const result = await createList({ name, category: "General" });
            if (!result.success) addNotification(result.error, 'error');
        }}
      />
    </aside>
  );
};
