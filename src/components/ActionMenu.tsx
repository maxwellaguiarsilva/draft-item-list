import React from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ActionMenuProps {
  onRename: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export const ActionMenu = ({ 
  onRename, 
  onDelete, 
  onDuplicate, 
  onMoveUp, 
  onMoveDown, 
  canMoveUp, 
  canMoveDown 
}: ActionMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" title="Actions">
          <span className="text-lg">⋮</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuItem onClick={onRename}>Rename</DropdownMenuItem>
        <DropdownMenuItem onClick={onDuplicate}>Duplicate</DropdownMenuItem>
        <DropdownMenuItem onClick={onMoveUp} disabled={!canMoveUp}>Move Up</DropdownMenuItem>
        <DropdownMenuItem onClick={onMoveDown} disabled={!canMoveDown}>Move Down</DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
