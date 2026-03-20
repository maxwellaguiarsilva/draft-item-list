"use client";

import { useEffect, useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { getListDetails, swapEntities } from '../app/actions/list';
import { updateItem, deleteItem, createItem, duplicateItem } from '../app/actions/item';
import { updateGroup, deleteGroup, createGroup, duplicateGroup } from '../app/actions/group';

interface Item {
  id: string;
  name: string;
  quantity: number;
  position: number;
  groupId: string | null;
}

interface Group {
  id: string;
  name: string;
  position: number;
  items?: Item[];
  children?: Group[];
}

interface List {
  id: string;
  name: string;
  category: string;
  items: Item[];
  groups: Group[];
}

const IconButton = ({ children, onClick, className = "", style = {}, disabled = false, title = "" }: { 
  children: React.ReactNode, 
  onClick: (e: React.MouseEvent) => void, 
  className?: string, 
  style?: React.CSSProperties, 
  disabled?: boolean, 
  title?: string 
}) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onClick(e); }} 
    className={`icon-button ${className}`} 
    style={{ 
      background: 'none', 
      border: 'none', 
      color: 'inherit', 
      cursor: disabled ? 'not-allowed' : 'pointer', 
      padding: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled ? 0.5 : 1,
      ...style 
    }}
    disabled={disabled}
    title={title}
  >
    {children}
  </button>
);

const EditMenu = ({ onRename, onDelete, onDuplicate, onMoveUp, onMoveDown, canMoveUp, canMoveDown }: {
  onRename: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
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
      <IconButton onClick={() => setIsOpen(!isOpen)} title="Actions">⋮</IconButton>
      {isOpen && (
        <div className="menu-popup" style={{ right: 0, top: '100%', zIndex: 10 }}>
          <button className="menu-item" onClick={() => { onRename(); setIsOpen(false); }}>Rename</button>
          <button className="menu-item" onClick={() => { onDuplicate(); setIsOpen(false); }}>Duplicate</button>
          <button className="menu-item" onClick={() => { onMoveUp(); setIsOpen(false); }} disabled={!canMoveUp}>Move Up</button>
          <button className="menu-item" onClick={() => { onMoveDown(); setIsOpen(false); }} disabled={!canMoveDown}>Move Down</button>
          <button className="menu-item danger" onClick={() => { onDelete(); setIsOpen(false); }}>Delete</button>
        </div>
      )}
    </div>
  );
};

const ItemView = ({ item, onRefresh, canMoveUp, canMoveDown, onMoveUp, onMoveDown }: {
  item: Item;
  onRefresh: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleIncrement = async () => {
    await updateItem(item.id, { quantity: item.quantity + 1 });
    onRefresh();
  };

  const handleDecrement = async () => {
    if (item.quantity > 1) {
      await updateItem(item.id, { quantity: item.quantity - 1 });
      onRefresh();
    }
  };

  const handleDelete = async () => {
    if (confirm(`Delete item "${item.name}"?`)) {
      await deleteItem(item.id);
      onRefresh();
    }
  };

  const handleRename = async () => {
    const newName = prompt("Enter new name:", item.name);
    if (newName && newName !== item.name) {
      await updateItem(item.id, { name: newName });
      onRefresh();
    }
  };

  const handleDuplicate = async () => {
    await duplicateItem(item.id);
    onRefresh();
  };

  return (
    <li 
      style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '0.5rem',
        borderRadius: '4px',
        background: isHovered ? 'var(--hover-color)' : 'transparent',
        transition: 'background 0.2s'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
        <span style={{ fontSize: '1.1rem' }}>{item.name}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#222', borderRadius: '4px', padding: '2px' }}>
          <IconButton onClick={handleDecrement} disabled={item.quantity <= 1} style={{ fontSize: '1.2rem' }}>-</IconButton>
          <span style={{ minWidth: '1.5rem', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</span>
          <IconButton onClick={handleIncrement} style={{ fontSize: '1.2rem' }}>+</IconButton>
        </div>
      </div>
      
      {isHovered && (
        <EditMenu 
          onRename={handleRename}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
        />
      )}
    </li>
  );
};

const GroupView = ({ group, listId, onRefresh, canMoveUp, canMoveDown, onMoveUp, onMoveDown, searchQuery }: {
  group: Group;
  listId: string;
  onRefresh: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  searchQuery: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const filterEntity = (entity: Item | Group): boolean => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    
    // Check if current matches
    if (entity.name.toLowerCase().includes(query)) return true;
    
    // Check descendants
    if (!('quantity' in entity)) {
      const g = entity as Group;
      const hasMatchingChild = (g.children || []).some(child => filterEntity(child));
      const hasMatchingItem = (g.items || []).some(item => item.name.toLowerCase().includes(query));
      return hasMatchingChild || hasMatchingItem;
    }
    return false;
  };

  const handleDelete = async () => {
    if (confirm(`Delete group "${group.name}" and all its contents?`)) {
      await deleteGroup(group.id);
      onRefresh();
    }
  };

  const handleRename = async () => {
    const newName = prompt("Enter new group name:", group.name);
    if (newName && newName !== group.name) {
      await updateGroup(group.id, { name: newName });
      onRefresh();
    }
  };

  const handleDuplicate = async () => {
    await duplicateGroup(group.id);
    onRefresh();
  };

  const handleAddItem = async () => {
    const name = prompt("Enter item name:");
    if (name) {
      await createItem(listId, { 
        name, 
        groupId: group.id, 
        position: (group.items?.length || 0) + (group.children?.length || 0) 
      });
      onRefresh();
    }
  };

  const handleAddSubgroup = async () => {
    const name = prompt("Enter subgroup name:");
    if (name) {
      await createGroup(listId, { 
        name, 
        parentId: group.id, 
        position: (group.items?.length || 0) + (group.children?.length || 0) 
      });
      onRefresh();
    }
  };

  const handleMoveInside = async (index: number, direction: 'up' | 'down', combined: (Item | Group)[]) => {
    const neighborIndex = direction === 'up' ? index - 1 : index + 1;
    const current = combined[index];
    const neighbor = combined[neighborIndex];
    
    await swapEntities(
      { id: current.id, type: 'quantity' in current ? 'item' : 'group', position: current.position },
      { id: neighbor.id, type: 'quantity' in neighbor ? 'item' : 'group', position: neighbor.position }
    );
    onRefresh();
  };

  const combined = [...(group.items || []), ...(group.children || [])].sort((a, b) => a.position - b.position);
  const filtered = combined.filter(entity => filterEntity(entity));

  return (
    <div 
      style={{ 
        marginLeft: '1rem', 
        borderLeft: '1px solid var(--border-color)', 
        paddingLeft: '1rem', 
        marginTop: '1rem',
        position: 'relative'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h4 style={{ margin: 0, fontSize: '1.2rem' }}>{group.name}</h4>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {isHovered && (
            <>
              <IconButton onClick={handleAddItem} title="Add Item">+</IconButton>
              <IconButton onClick={handleAddSubgroup} title="Add Group">📁</IconButton>
              <EditMenu 
                onRename={handleRename}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
                canMoveUp={canMoveUp}
                canMoveDown={canMoveDown}
              />
            </>
          )}
        </div>
      </div>

      <div style={{ padding: 0 }}>
        {filtered.map((entity, index) => {
          const isItem = 'quantity' in entity;
          if (isItem) {
            return (
              <ItemView 
                key={entity.id} 
                item={entity as Item} 
                onRefresh={onRefresh}
                canMoveUp={index > 0}
                canMoveDown={index < (filtered.length - 1)}
                onMoveUp={() => handleMoveInside(index, 'up', combined)}
                onMoveDown={() => handleMoveInside(index, 'down', combined)}
              />
            );
          } else {
            return (
              <GroupView 
                key={entity.id} 
                group={entity as Group} 
                listId={listId} 
                onRefresh={onRefresh}
                canMoveUp={index > 0}
                canMoveDown={index < (filtered.length - 1)}
                onMoveUp={() => handleMoveInside(index, 'up', combined)}
                onMoveDown={() => handleMoveInside(index, 'down', combined)}
                searchQuery={searchQuery}
              />
            );
          }
        })}
      </div>
    </div>
  );
};

export const ListDetailView = () => {
  const { selectedListId } = useAppContext();
  const [list, setList] = useState<List | null>(null);
  const [loading, setLoading] = useState(false);
  const [prevId, setPrevId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Set loading state during render if the ID changed to avoid synchronous effect updates
  if (selectedListId !== prevId) {
    setPrevId(selectedListId);
    if (selectedListId) {
      setLoading(true);
      setList(null);
      setSearchQuery("");
    } else {
      setLoading(false);
      setList(null);
    }
  }

  const refreshList = () => {
    if (selectedListId) {
      getListDetails(selectedListId).then((result) => {
        if (result.success) setList(result.data as List);
        else console.error(result.error);
      });
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (selectedListId) {
      getListDetails(selectedListId)
        .then((result) => {
          if (isMounted) {
            if (result.success) setList(result.data as List);
            else console.error(result.error);
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }
    return () => { isMounted = false; };
  }, [selectedListId]);

  if (!selectedListId) return <div style={{ padding: '2rem', color: 'var(--text-color)' }}>Select a list from the sidebar.</div>;
  if (loading && !list) return <div style={{ padding: '2rem', color: 'var(--text-color)' }}>Loading list details...</div>;
  if (!list) return <div style={{ padding: '2rem', color: 'var(--text-color)' }}>List not found.</div>;

  const handleAddRootItem = async () => {
    const name = prompt("Enter item name:");
    if (name) {
      await createItem(selectedListId, { 
        name, 
        position: (list.items?.length || 0) + (list.groups?.length || 0) 
      });
      refreshList();
    }
  };

  const handleAddRootGroup = async () => {
    const name = prompt("Enter group name:");
    if (name) {
      await createGroup(selectedListId, { 
        name, 
        position: (list.items?.length || 0) + (list.groups?.length || 0) 
      });
      refreshList();
    }
  };

  const handleMoveRoot = async (index: number, direction: 'up' | 'down', combined: (Item | Group)[]) => {
    const neighborIndex = direction === 'up' ? index - 1 : index + 1;
    const current = combined[index];
    const neighbor = combined[neighborIndex];
    
    await swapEntities(
      { id: current.id, type: 'quantity' in current ? 'item' : 'group', position: current.position },
      { id: neighbor.id, type: 'quantity' in neighbor ? 'item' : 'group', position: neighbor.position }
    );
    refreshList();
  };

  const combinedRoot = [...(list.items || []), ...(list.groups || [])].sort((a, b) => a.position - b.position);

  const filterEntity = (entity: Item | Group): boolean => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    
    // Check if the current entity matches
    if (entity.name.toLowerCase().includes(query)) return true;
    
    // If it's a group, check its children
    if (!('quantity' in entity)) {
      const g = entity as Group;
      const hasMatchingChild = (g.children || []).some(child => filterEntity(child));
      const hasMatchingItem = (g.items || []).some(item => item.name.toLowerCase().includes(query));
      return hasMatchingChild || hasMatchingItem;
    }
    
    return false;
  };

  const filteredRoot = combinedRoot.filter(entity => filterEntity(entity));

  return (
    <div style={{ padding: '2rem', flex: 1, overflowY: 'auto', color: 'var(--text-color)' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>{list.name}</h2>
          <span style={{ background: 'var(--hover-color)', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {list.category}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleAddRootItem} className="primary-button" style={{ padding: '0.5rem 1rem' }}>+ Item</button>
            <button onClick={handleAddRootGroup} className="primary-button" style={{ padding: '0.5rem 1rem' }}>+ Group</button>
          </div>
          <input 
            type="text" 
            placeholder="Search items..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            style={{ 
              background: 'transparent', 
              border: '1px solid var(--border-color)', 
              borderRadius: '4px', 
              padding: '0.5rem', 
              color: 'var(--text-color)',
              width: '250px',
              marginTop: '0.5rem'
            }}
          />
        </div>
      </header>
      
      <div className="list-content" style={{ maxWidth: '800px' }}>
        <div style={{ marginBottom: '1rem' }}>
          {filteredRoot.map((entity, index) => {
            const isItem = 'quantity' in entity;
            if (isItem) {
              return (
                <ItemView 
                  key={entity.id} 
                  item={entity as Item} 
                  onRefresh={refreshList}
                  canMoveUp={index > 0}
                  canMoveDown={index < (filteredRoot.length - 1)}
                  onMoveUp={() => handleMoveRoot(index, 'up', combinedRoot)}
                  onMoveDown={() => handleMoveRoot(index, 'down', combinedRoot)}
                />
              );
            } else {
              return (
                <GroupView 
                  key={entity.id} 
                  group={entity as Group} 
                  listId={selectedListId} 
                  onRefresh={refreshList}
                  canMoveUp={index > 0}
                  canMoveDown={index < (filteredRoot.length - 1)}
                  onMoveUp={() => handleMoveRoot(index, 'up', combinedRoot)}
                  onMoveDown={() => handleMoveRoot(index, 'down', combinedRoot)}
                  searchQuery={searchQuery}
                />
              );
            }
          })}
        </div>
      </div>
    </div>
  );
};
