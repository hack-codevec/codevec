"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/auth-context";

interface UserButtonProps {
  email: string;
  name?: string;
  imageUrl?: string;
}

export function UserButton({ email, name, imageUrl }: UserButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();

  // Get initials from email or name
  const getInitials = () => {
    if (name) {
      return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }

    return email.substring(0, 2).toUpperCase();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-secondary cursor-pointer">
          <Avatar className="h-8 w-8 border border-border">
            <AvatarImage
              src={imageUrl || "/placeholder.svg"}
              alt={name || email}
            />
            <AvatarFallback className="bg-primary text-sm">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <span className="max-w-[150px] truncate text-sm font-medium pr-2">
            {name}
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-secondary border-border"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            {name && <p className="text-sm font-medium">{name}</p>}
            <p className="text-xs text-muted-foreground truncate">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="cursor-pointer hover:bg-accent/30 flex flex-row items-center px-2 py-1 rounded-xl my-1 gap-2">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </div>
        <div className="cursor-pointer hover:bg-accent/30 flex flex-row items-center px-2 py-1 rounded-xl my-1 gap-2">
          <User className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </div>
        <DropdownMenuSeparator />
        <div
          className="hover:bg-accent/30 flex flex-row items-center px-2 py-1 rounded-xl my-1 gap-2 cursor-pointer text-red-500 focus:text-red-500"
          onClick={() => logout()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
