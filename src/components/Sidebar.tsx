import React from 'react';

export const Sidebar = () => {
  return (
    <aside style={{ 
      width: '250px', 
      backgroundColor: '#000000', 
      borderRight: '1px solid #333', 
      height: '100vh', 
      padding: '20px' 
    }}>
      <h2 style={{ color: '#ffffff' }}>Lists</h2>
      {/* Placeholder list item to demonstrate styling */}
      <div style={{ 
        padding: '10px', 
        backgroundColor: '#00008b', 
        color: '#ffffff', 
        marginTop: '10px',
        borderRadius: '4px'
      }}>
        List (Selected)
      </div>
    </aside>
  );
};
