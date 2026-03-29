"use client";

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { deleteList, duplicateList, updateList, moveList, createList } from '../app/actions/list';
import { NewListModal } from './NewListModal';

interface List {
  id: string;
  name: string;
  category: string;
  position: number;
}

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

const EditMenu = ({ onRename, onDelete, onDuplicate, onMoveUp, onMoveDown }: {
  onRename: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className="p-1 rounded cursor-pointer text-text-secondary hover:text-text text-base"
          onClick={(e) => e.stopPropagation()}
        >
          ⋮
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onRename}>Rename</DropdownMenuItem>
        <DropdownMenuItem onClick={onDuplicate}>Duplicate</DropdownMenuItem>
        <DropdownMenuItem onClick={onMoveUp}>Move Up</DropdownMenuItem>
        <DropdownMenuItem onClick={onMoveDown}>Move Down</DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
    <div className="relative h-full">
      <aside className={`flex flex-col h-full bg-bg border-r border-border transition-all duration-300 ${isSidebarOpen ? 'w-[260px]' : 'w-0'} overflow-hidden`}>
        <div className="p-4 flex justify-between items-center w-[260px]">
          <h2 className="text-xl m-0">Lists</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 w-[260px]">
          <div className="mb-4">
            <Button 
              onClick={() => setIsNewListModalOpen(true)}
              className="w-full"
            >
              +
            </Button>
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
        <NewListModal 
          isOpen={isNewListModalOpen} 
          onClose={() => setIsNewListModalOpen(false)}
          onConfirm={async (name: string) => {
              const result = await createList({ name, category: "General" });
              if (!result.success) addNotification(result.error, 'error');
          }}
        />
      </aside>
      <button 
        onClick={toggleSidebar} 
        className="absolute top-4 -right-10 p-2 rounded-r-md cursor-pointer text-text-secondary hover:text-text bg-bg border-y border-r border-border"
      >
        ☰
      </button>
    </div>
  );
};
