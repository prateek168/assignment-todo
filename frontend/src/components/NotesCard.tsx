import React, { useState } from 'react';

interface NotesCardProps {
  title: string;
  description: string;
  onEdit?: () => void;
  onDelete?: () => void;
  fullWidth?: boolean;
}

const NotesCard: React.FC<NotesCardProps> = ({ title, description, onEdit, onDelete, fullWidth }) => {
  const [open, setOpen] = useState(false);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete();
  };

  return (
    <div
      className={`shadow-lg mb-4 cursor-pointer ${fullWidth ? 'w-full' : 'ml-3'} bg-white rounded-lg border border-gray-200 p-3 flex flex-col gap-2 hover:shadow-xl transition-shadow`}
      onClick={() => setOpen((prev) => !prev)}
    >
      <div className="flex items-center w-full">
        <div className="font-semibold text-lg flex-1 text-left ml-1 truncate">{title}</div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleEdit}
            className="cursor-pointer mr-2 hover:bg-gray-100 p-1 rounded transition-colors"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={handleDelete}
            className="cursor-pointer flex items-center hover:bg-gray-100 p-1 rounded transition-colors"
            title="Delete"
          >
            <img src="/delete.png" alt="Delete" className="w-5 h-5" />
          </button>
        </div>
      </div>
      {open && (
        <div className="text-base text-gray-600 ml-1 mt-2 text-left">{description}</div>
      )}
    </div>
  );
};

export default NotesCard;