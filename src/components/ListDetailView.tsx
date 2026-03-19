"use client";

import { useEffect, useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { getListDetails } from '../app/actions/list';
import { updateItem, deleteItem, createItem, duplicateItem, updateItemPosition } from '../app/actions/item';
import { updateGroup, deleteGroup, createGroup, duplicateGroup, updateGroupPosition } from '../app/actions/group';

const IconButton = ({ children, onClick, className = "", style = {}, disabled = false, title = "" }: any) => (
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

const EditMenu = ({ onRename, onDelete, onDuplicate, onMoveUp, onMoveDown, canMoveUp, canMoveDown }: any) => {
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

const ItemView = ({ item, listId, onRefresh, canMoveUp, canMoveDown, onMoveUp, onMoveDown }: any) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleIncrement = async () => {
    await updateItem(item.id, listId, { quantity: item.quantity + 1 });
    onRefresh();
  };

  const handleDecrement = async () => {
    if (item.quantity > 1) {
      await updateItem(item.id, listId, { quantity: item.quantity - 1 });
      onRefresh();
    }
  };

  const handleDelete = async () => {
    if (confirm(`Delete item "${item.name}"?`)) {
      await deleteItem(item.id, listId);
      onRefresh();
    }
  };

  const handleRename = async () => {
    const newName = prompt("Enter new name:", item.name);
    if (newName && newName !== item.name) {
      await updateItem(item.id, listId, { name: newName });
      onRefresh();
    }
  };

  const handleDuplicate = async () => {
    await duplicateItem(item.id, listId);
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

const GroupView = ({ group, listId, onRefresh, canMoveUp, canMoveDown, onMoveUp, onMoveDown }: any) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = async () => {
    if (confirm(`Delete group "${group.name}" and all its contents?`)) {
      await deleteGroup(group.id, listId);
      onRefresh();
    }
  };

  const handleRename = async () => {
    const newName = prompt("Enter new group name:", group.name);
    if (newName && newName !== group.name) {
      await updateGroup(group.id, listId, { name: newName });
      onRefresh();
    }
  };

  const handleDuplicate = async () => {
    await duplicateGroup(group.id, listId);
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

  const handleMoveItem = async (index: number, direction: 'up' | 'down') => {
    const items = group.items;
    const neighborIndex = direction === 'up' ? index - 1 : index + 1;
    const item = items[index];
    const neighbor = items[neighborIndex];
    
    await updateItemPosition(item.id, listId, neighbor.position);
    await updateItemPosition(neighbor.id, listId, item.position);
    onRefresh();
  };

  const handleMoveChildGroup = async (index: number, direction: 'up' | 'down') => {
    const children = group.children;
    const neighborIndex = direction === 'up' ? index - 1 : index + 1;
    const child = children[index];
    const neighbor = children[neighborIndex];
    
    await updateGroupPosition(child.id, listId, neighbor.position);
    await updateGroupPosition(neighbor.id, listId, child.position);
    onRefresh();
  };

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

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {group.items?.map((item: any, index: number) => (
          <ItemView 
            key={item.id} 
            item={item} 
            listId={listId} 
            onRefresh={onRefresh}
            canMoveUp={index > 0}
            canMoveDown={index < (group.items.length - 1)}
            onMoveUp={() => handleMoveItem(index, 'up')}
            onMoveDown={() => handleMoveItem(index, 'down')}
          />
        ))}
      </ul>
      
      {group.children?.map((child: any, index: number) => (
        <GroupView 
          key={child.id} 
          group={child} 
          listId={listId} 
          onRefresh={onRefresh}
          canMoveUp={index > 0}
          canMoveDown={index < (group.children.length - 1)}
          onMoveUp={() => handleMoveChildGroup(index, 'up')}
          onMoveDown={() => handleMoveChildGroup(index, 'down')}
        />
      ))}
    </div>
  );
};

export const ListDetailView = () => {
  const { selectedListId } = useAppContext();
  const [list, setList] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const refreshList = () => {
    if (selectedListId) {
      getListDetails(selectedListId).then(setList);
    }
  };

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

  const handleMoveRootItem = async (index: number, direction: 'up' | 'down') => {
    const items = list.items;
    const neighborIndex = direction === 'up' ? index - 1 : index + 1;
    const item = items[index];
    const neighbor = items[neighborIndex];
    
    await updateItemPosition(item.id, selectedListId, neighbor.position);
    await updateItemPosition(neighbor.id, selectedListId, item.position);
    refreshList();
  };

  const handleMoveRootGroup = async (index: number, direction: 'up' | 'down') => {
    const groups = list.groups;
    const neighborIndex = direction === 'up' ? index - 1 : index + 1;
    const group = groups[index];
    const neighbor = groups[neighborIndex];
    
    await updateGroupPosition(group.id, selectedListId, neighbor.position);
    await updateGroupPosition(neighbor.id, selectedListId, group.position);
    refreshList();
  };

  return (
    <div style={{ padding: '2rem', flex: 1, overflowY: 'auto', color: 'var(--text-color)' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>{list.name}</h2>
          <span style={{ background: 'var(--hover-color)', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {list.category}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleAddRootItem} className="primary-button" style={{ padding: '0.5rem 1rem' }}>+ Item</button>
          <button onClick={handleAddRootGroup} className="primary-button" style={{ padding: '0.5rem 1rem' }}>+ Group</button>
        </div>
      </header>
      
      <div className="list-content" style={{ maxWidth: '800px' }}>
        {/* Root Items */}
        <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1rem' }}>
          {list.items?.map((item: any, index: number) => (
            <ItemView 
                key={item.id} 
                item={item} 
                listId={selectedListId} 
                onRefresh={refreshList}
                canMoveUp={index > 0}
                canMoveDown={index < (list.items.length - 1)}
                onMoveUp={() => handleMoveRootItem(index, 'up')}
                onMoveDown={() => handleMoveRootItem(index, 'down')}
            />
          ))}
        </ul>

        {/* Groups */}
        {list.groups?.map((group: any, index: number) => (
          <GroupView 
            key={group.id} 
            group={group} 
            listId={selectedListId} 
            onRefresh={refreshList} 
            canMoveUp={index > 0}
            canMoveDown={index < (list.groups.length - 1)}
            onMoveUp={() => handleMoveRootGroup(index, 'up')}
            onMoveDown={() => handleMoveRootGroup(index, 'down')}
          />
        ))}
      </div>
    </div>
  );
};
