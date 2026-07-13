import { useState } from "react";

export const NewListModal = ({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: (name: string) => void }) => {
  const [name, setName] = useState("");
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-bg p-4 rounded border border-border w-80">
        <h3 className="text-lg mb-4">New List</h3>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="List Name"
          className="w-full p-2 mb-4 bg-bg border border-border rounded text-text"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="p-2">Cancel</button>
          <button onClick={() => { onConfirm(name); onClose(); setName(""); }} className="p-2 bg-accent text-white rounded">Create</button>
        </div>
      </div>
    </div>
  );
};
