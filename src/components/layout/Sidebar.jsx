import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { BarChart3, FileText, Users, TrendingUp, Settings, HelpCircle, LogOut, Package } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const navItems = [
  { icon: BarChart3, label: "Dashboard", path: "/" },
  { icon: FileText, label: "Quotes", path: "/quotes" },
  { icon: TrendingUp, label: "Sales", path: "/sales" },
  { icon: Users, label: "Customers", path: "/customers" },
  { icon: Package, label: "Products", path: "/products" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="h-screen w-64 bg-gradient-to-b from-indigo-900 to-blue-800 text-white flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold">QuoteSales Pro</h1>
        <p className="text-blue-200 text-sm mt-1">Sales Management</p>
      </div>

      <nav className="flex-1 px-4 py-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-lg transition-all duration-200 group relative",
                    isActive 
                      ? "bg-white/10 text-white" 
                      : "text-blue-100 hover:bg-white/5"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                  <Icon className="h-5 w-5 mr-3" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-indigo-800">
        <div className="flex items-center mb-4 px-4 py-2 rounded-lg hover:bg-white/5 cursor-pointer">
          <HelpCircle className="h-5 w-5 mr-3 text-blue-200" />
          <span className="text-blue-100">Help & Support</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 rounded-lg hover:bg-white/5 cursor-pointer"
        >
          <LogOut className="h-5 w-5 mr-3 text-blue-200" />
          <span className="text-blue-100">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;