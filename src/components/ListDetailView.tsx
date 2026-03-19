"use client";

import { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { getListDetails } from '../app/actions/list';

const GroupView = ({ group }: { group: any }) => {
  return (
    <div style={{ marginLeft: '1rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem', marginTop: '1rem' }}>
      <h4 style={{ margin: '0 0 0.5rem 0' }}>{group.name}</h4>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {group.items?.map((item: any) => (
          <li key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.25rem' }}>
            <span>{item.name}</span>
            <span className="text-muted">x{item.quantity}</span>
          </li>
        ))}
      </ul>
      {group.children?.map((child: any) => (
        <GroupView key={child.id} group={child} />
      ))}
    </div>
  );
};

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

  if (!selectedListId) return <div style={{ padding: '2rem' }}>Select a list from the sidebar.</div>;
  if (loading) return <div style={{ padding: '2rem' }}>Loading list details...</div>;
  if (!list) return <div style={{ padding: '2rem' }}>List not found.</div>;

  return (
    <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>{list.name}</h2>
        <span className="text-muted" style={{ background: 'var(--hover-color)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
          {list.category}
        </span>
      </header>
      
      <div className="list-content">
        {/* Root Items */}
        {list.items?.length > 0 && (
           <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
           {list.items.map((item: any) => (
             <li key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
               <span>{item.name}</span>
               <span className="text-muted">x{item.quantity}</span>
             </li>
           ))}
         </ul>
        )}

        {/* Groups */}
        {list.groups?.map((group: any) => (
          <GroupView key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
};
