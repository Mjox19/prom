import React from "react";
import { Search, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";
import { getCurrentUser } from "@/lib/supabase";

const Header = ({ title }) => {
  const user = getCurrentUser();
  
  const displayName = `${user.first_name} ${user.last_name}`;
  const initials = displayName
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            className="pl-10 w-64 bg-gray-50 border-gray-200 focus:bg-white focus:border-orange-300 focus:ring-orange-200" 
            placeholder="Search..." 
          />
        </div>
        
        <NotificationDropdown />
        
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8 border border-gray-200">
            <AvatarFallback className="bg-orange-100 text-orange-700">
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