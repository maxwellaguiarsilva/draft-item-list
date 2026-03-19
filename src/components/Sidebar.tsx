"use client";

import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { deleteList, duplicateList } from '../app/actions/list';
import { ListForm } from './ListForm';

export const Sidebar = ({ lists }: { lists: any[] }) => {
  const { selectedListId, setSelectedListId, isSidebarOpen, toggleSidebar } = useAppContext();
  const [editingId, setEditingId] = useState<string | null>(null);

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
                <span>{list.name}</span>
                <div style={{ position: 'relative' }}>
                  <button
                    className="icon-button"
                    style={{ fontSize: '1rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(editingId === list.id ? null : list.id);
                    }}
                  >
                    ⋮
                  </button>
                  {editingId === list.id && (
                    <div className="menu-popup">
                      <button
                        className="menu-item"
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateList(list.id);
                          setEditingId(null);
                        }}
                      >
                        Duplicate
                      </button>
                      <button
                        className="menu-item danger"
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
        </div>
      )}
    </aside>
  );
};
