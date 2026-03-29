"use client";

import { useEffect, useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { getListDetails, swapEntities } from '../app/actions/list';
import { updateItem, deleteItem, createItem, duplicateItem } from '../app/actions/item';
import { updateGroup, deleteGroup, createGroup, duplicateGroup } from '../app/actions/group';
import { Button } from "@/components/ui/button"
import { ActionMenu } from './ActionMenu';

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

const IconButton = ({ children, onClick, className = "", disabled = false, title = "" }: { 
  children: React.ReactNode, 
  onClick: (e: React.MouseEvent) => void, 
  className?: string, 
  disabled?: boolean, 
  title?: string 
}) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onClick(e); }} 
    className={`p-1 flex items-center justify-center rounded cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : 'opacity-100'} ${className}`}
    disabled={disabled}
    title={title}
  >
    {children}
  </button>
);

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
    <li className="flex justify-between items-center p-2 rounded transition-colors duration-200">
      <div className="flex items-center gap-4 flex-1">
        <span className="text-lg">{item.name}</span>
        <div className="flex items-center gap-2 bg-border rounded p-1">
          <IconButton onClick={handleDecrement} disabled={item.quantity <= 1} className="text-lg">-</IconButton>
          <span className="min-w-[1.5rem] text-center font-bold">{item.quantity}</span>
          <IconButton onClick={handleIncrement} className="text-lg">+</IconButton>
        </div>
      </div>
      
      <ActionMenu 
        onRename={handleRename}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
      />
    </li>
  );
};

const GroupView = ({ group, listId, onRefresh, canMoveUp, canMoveDown, onMoveUp, onMoveDown, searchQuery, addNotification }: {
  group: Group;
  listId: string;
  onRefresh: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  searchQuery: string;
  addNotification: (message: string, type: 'error' | 'success') => void;
}) => {
  const filterEntity = (entity: Item | Group): boolean => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    if (entity.name.toLowerCase().includes(query)) return true;
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
    
    const result = await swapEntities(
      { id: current.id, type: 'quantity' in current ? 'item' : 'group', position: current.position },
      { id: neighbor.id, type: 'quantity' in neighbor ? 'item' : 'group', position: neighbor.position }
    );
    if (result.success) {
      onRefresh();
    } else {
      addNotification(result.error, 'error');
    }
  };

  const combined = [...(group.items || []), ...(group.children || [])].sort((a, b) => a.position - b.position);
  const filtered = combined.filter(entity => filterEntity(entity));

  return (
    <div className="ml-4 border-l border-border pl-4 mt-4 relative">
      <div className="flex justify-between items-center mb-2">
        <h4 className="m-0 text-xl">{group.name}</h4>
        <div className="flex gap-2 items-center">
          <IconButton onClick={handleAddItem} title="Add Item">+</IconButton>
          <IconButton onClick={handleAddSubgroup} title="Add Group">📁</IconButton>
          <ActionMenu 
            onRename={handleRename}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
          />
        </div>
      </div>

      <div className="p-0">
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
                addNotification={addNotification}
              />
            );
          }
        })}
      </div>
    </div>
  );
};

export const ListDetailView = () => {
  const { selectedListId, addNotification } = useAppContext();
  const [list, setList] = useState<List | null>(null);
  const [loading, setLoading] = useState(false);
  const [prevId, setPrevId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  const refreshList = async () => {
    if (selectedListId) {
      try {
        const result = await getListDetails(selectedListId);
        if (result.success) {
          setList(result.data as List);
        } else {
          addNotification(result.error, 'error');
        }
      } catch (error) {
        if (error instanceof Error) {
          addNotification(error.message, 'error');
        } else {
          addNotification("An unexpected error occurred", 'error');
        }
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (selectedListId) {
      getListDetails(selectedListId)
        .then((result) => {
          if (isMounted) {
            if (result.success) {
              setList(result.data as List);
            } else {
              addNotification(result.error, 'error');
            }
          }
        })
        .catch((error) => {
          if (isMounted) {
            addNotification(error instanceof Error ? error.message : "An unexpected error occurred", 'error');
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }
    return () => { isMounted = false; };
  }, [selectedListId, addNotification]);

  if (!selectedListId) return <div className="p-8 text-white">Select a list from the sidebar.</div>;
  if (loading && !list) return <div className="p-8 text-white">Loading list details...</div>;
  if (!list) return <div className="p-8 text-white">List not found.</div>;

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
    
    const result = await swapEntities(
      { id: current.id, type: 'quantity' in current ? 'item' : 'group', position: current.position },
      { id: neighbor.id, type: 'quantity' in neighbor ? 'item' : 'group', position: neighbor.position }
    );
    if (result.success) {
      refreshList();
    } else {
      addNotification(result.error, 'error');
    }
  };

  const combinedRoot = [...(list.items || []), ...(list.groups || [])].sort((a, b) => a.position - b.position);

  const filterEntity = (entity: Item | Group): boolean => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    if (entity.name.toLowerCase().includes(query)) return true;
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
    <div className="p-8 flex-1 overflow-y-auto text-white">
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-4xl m-0 mb-2 font-bold">{list.name}</h2>
          <span className="bg-hover px-3 py-1 rounded text-sm text-text-secondary">
            {list.category}
          </span>
        </div>
        <div className="flex gap-2 flex-col items-end">
          <div className="flex gap-2">
            <Button onClick={handleAddRootItem}>+ Item</Button>
            <Button onClick={handleAddRootGroup}>+ Group</Button>
          </div>
          <input 
            type="text" 
            placeholder="Search items..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border border-border rounded p-2 text-text w-[250px] mt-2"
          />
        </div>
      </header>
      
      <div className="max-w-[800px]">
        <div className="mb-4">
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
                  addNotification={addNotification}
                />
              );
            }
          })}
        </div>
      </div>
    </div>
  );
};
