import React from "react";
import { Bell, Search, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Header = ({ title }) => {
  const { user } = useAuth();
  
  // Get user's name from email (before @) and capitalize first letters
  const displayName = user?.email 
    ? user.email
        .split('@')[0]
        .split('.')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    : 'User';

  // Create initials from the display name
  const initials = displayName
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            className="pl-10 w-64 bg-gray-50 border-gray-200 focus:bg-white" 
            placeholder="Search..." 
          />
        </div>
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>
        
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8 border border-gray-200">
            <AvatarFallback className="bg-indigo-100 text-indigo-800">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <p className="font-medium text-gray-700">{displayName}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;