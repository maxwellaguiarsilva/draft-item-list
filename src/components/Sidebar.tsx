"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { deleteList, duplicateList, updateList, moveList } from '../app/actions/list';
import { ListForm } from './ListForm';

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
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button 
        className="icon-button"
        style={{ fontSize: '1rem' }}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        ⋮
      </button>
      {isOpen && (
        <div className="menu-popup" style={{ right: 0, top: '100%', zIndex: 100 }}>
          <button className="menu-item" onClick={(e) => { e.stopPropagation(); onRename(); setIsOpen(false); }}>Rename</button>
          <button className="menu-item" onClick={(e) => { e.stopPropagation(); onDuplicate(); setIsOpen(false); }}>Duplicate</button>
          <button className="menu-item" onClick={(e) => { e.stopPropagation(); onMoveUp(); setIsOpen(false); }}>Move Up</button>
          <button className="menu-item" onClick={(e) => { e.stopPropagation(); onMoveDown(); setIsOpen(false); }}>Move Down</button>
          <button className="menu-item danger" onClick={(e) => { e.stopPropagation(); onDelete(); setIsOpen(false); }}>Delete</button>
        </div>
      )}
    </div>
  );
};

export const Sidebar = ({ lists }: { lists: List[] }) => {
  const { selectedListId, setSelectedListId, isSidebarOpen, toggleSidebar } = useAppContext();

  useEffect(() => {
    if (!selectedListId && lists.length > 0) {
      setSelectedListId(lists[0].id);
    }
  }, [lists, selectedListId, setSelectedListId]);

  const handleRename = async (list: List) => {
    const newName = prompt("Enter new list name:", list.name);
    if (newName && newName !== list.name) {
      await updateList(list.id, { name: newName }).then(r => r.success || console.error(r.error));
    }
  };

  const handleDelete = async (list: List) => {
    if (confirm(`Delete list "${list.name}"?`)) {
      await deleteList(list.id).then(r => r.success || console.error(r.error));
      if (selectedListId === list.id) {
        setSelectedListId(null);
      }
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Lists</h2>
        <button onClick={toggleSidebar} className="icon-button">☰</button>
      </div>
      {isSidebarOpen && (
        <div className="sidebar-content">
          <div style={{ marginBottom: '1rem' }}>
            <ListForm />
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {lists.map((list) => (
              <li
                key={list.id}
                className={`list-item ${selectedListId === list.id ? 'selected' : ''}`}
                onClick={() => setSelectedListId(list.id)}
              >
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {list.name}
                </span>
                <EditMenu 
                    onRename={() => handleRename(list)}
                    onDuplicate={() => duplicateList(list.id).then(r => r.success || console.error(r.error))}
                    onMoveUp={() => moveList(list.id, 'up').then(r => r.success || console.error(r.error))}
                    onMoveDown={() => moveList(list.id, 'down').then(r => r.success || console.error(r.error))}
                    onDelete={() => handleDelete(list)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
};
