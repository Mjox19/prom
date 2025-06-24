import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { BarChart3, FileText, Users, TrendingUp, Settings, HelpCircle, Package, Truck } from 'lucide-react';

const navItems = [
  { icon: BarChart3, label: "Dashboard", path: "/" },
  { icon: FileText, label: "Quotes", path: "/quotes" },
  { icon: TrendingUp, label: "Sales", path: "/sales" },
  { icon: Users, label: "Customers", path: "/customers" },
  { icon: Package, label: "Products", path: "/products" },
  { icon: Truck, label: "Orders & Deliveries", path: "/orders" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 text-gray-900 flex flex-col shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <img 
            src="/logo promocups Normal.png" 
            alt="Promocups" 
            className="h-8 w-auto"
          />
        </div>
        <p className="text-gray-600 text-sm mt-2">Sales Management</p>
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
                      ? "bg-orange-50 text-orange-600 border border-orange-200" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 rounded-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                  <Icon className={`h-5 w-5 mr-3 ${isActive ? "text-orange-500" : "text-gray-400"}`} />
                  <span className={isActive ? "font-medium" : ""}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center mb-4 px-4 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
          <HelpCircle className="h-5 w-5 mr-3 text-gray-400" />
          <span className="text-gray-600">Help & Support</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;