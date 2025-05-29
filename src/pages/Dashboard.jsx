import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  FileText, 
  Users, 
  TrendingUp, 
  ArrowUpRight, 
  DollarSign,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const statCards = [
  {
    title: "Total Quotes",
    icon: FileText,
    color: "bg-blue-500",
    statKey: "totalQuotes",
    formatter: (value) => value
  },
  {
    title: "Total Sales",
    icon: TrendingUp,
    color: "bg-green-500",
    statKey: "totalSales",
    formatter: (value) => value
  },
  {
    title: "Total Customers",
    icon: Users,
    color: "bg-purple-500",
    statKey: "totalCustomers",
    formatter: (value) => value
  },
  {
    title: "Total Revenue",
    icon: DollarSign,
    color: "bg-amber-500",
    statKey: "totalSalesValue",
    formatter: (value) => `$${value.toLocaleString()}`
  }
];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Get quotes for the current user
      const { data: quotes, error: quotesError } = await supabase
        .from('quotes')
        .select('*')
        .eq('user_id', user.id);

      if (quotesError) throw quotesError;

      // Get orders for the current user
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id);

      if (ordersError) throw ordersError;

      // Get customers owned by the current user
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id);

      if (customersError) throw customersError;

      const dashboardStats = {
        totalQuotes: quotes?.length || 0,
        totalSales: orders?.length || 0,
        totalCustomers: customers?.length || 0,
        pendingQuotes: quotes?.filter(q => q.status === 'sent').length || 0,
        acceptedQuotes: quotes?.filter(q => q.status === 'accepted').length || 0,
        declinedQuotes: quotes?.filter(q => q.status === 'declined').length || 0,
        wonSales: orders?.filter(s => s.status === 'delivered').length || 0,
        lostSales: orders?.filter(s => s.status === 'cancelled').length || 0,
        activeSales: orders?.filter(s => !['delivered', 'cancelled'].includes(s.status)).length || 0,
        totalQuoteValue: quotes?.reduce((sum, q) => sum + (parseFloat(q.total) || 0), 0) || 0,
        totalSalesValue: orders?.reduce((sum, s) => sum + (parseFloat(s.total_amount) || 0), 0) || 0,
        recentQuotes: quotes?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5) || [],
        recentSales: orders?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5) || []
      };

      setStats(dashboardStats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const renderProgressBar = (value, total, colorClass) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    );
  };

  const renderRecentActivityItem = (item, Icon, iconColor, type) => (
    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center">
        <Icon className={`h-5 w-5 ${iconColor} mr-3`} />
        <div>
          <p className="font-medium text-sm">{item.title}</p>
          <p className="text-xs text-gray-500">
            ${(type === 'quote' ? item.total : item.total_amount)?.toLocaleString()}
          </p>
        </div>
      </div>
      <div className="flex items-center">
        <span className={`status-badge status-${item.status}`}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </span>
        <Calendar className="h-4 w-4 text-gray-400 ml-3" />
        <span className="text-xs text-gray-500 ml-1">
          {new Date(item.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <Header title="Dashboard" />
      
      <div className="flex-1 p-6 overflow-y-auto">
        {(!stats || (stats.totalQuotes === 0 && stats.totalSales === 0 && stats.totalCustomers === 0)) ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center mb-8">
              <BarChart3 className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to QuoteSales Pro</h1>
              <p className="text-gray-600 max-w-md">
                Your comprehensive solution for managing quotes and sales. Get started by creating your first quote or sale.
              </p>
            </div>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((card) => (
                <motion.div key={card.title} variants={itemVariants}>
                  <Card className="dashboard-card border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">
                        {card.title}
                      </CardTitle>
                      <div className={`${card.color} p-2 rounded-full`}>
                        <card.icon className="h-4 w-4 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {card.formatter(stats[card.statKey] || 0)}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div variants={itemVariants}>
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">Quote Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { label: "Pending", value: stats.pendingQuotes, color: "bg-blue-500" },
                      { label: "Accepted", value: stats.acceptedQuotes, color: "bg-green-500" },
                      { label: "Declined", value: stats.declinedQuotes, color: "bg-red-500" },
                    ].map(status => (
                      <div key={status.label} className="flex items-center">
                        {renderProgressBar(status.value, stats.totalQuotes, status.color)}
                        <span className="ml-4 text-sm font-medium min-w-[80px]">{status.value} {status.label}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">Sales Pipeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { label: "Active", value: stats.activeSales, color: "bg-purple-500" },
                      { label: "Won", value: stats.wonSales, color: "bg-green-500" },
                      { label: "Lost", value: stats.lostSales, color: "bg-red-500" },
                    ].map(status => (
                      <div key={status.label} className="flex items-center">
                         {renderProgressBar(status.value, stats.totalSales, status.color)}
                        <span className="ml-4 text-sm font-medium min-w-[80px]">{status.value} {status.label}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div variants={itemVariants}>
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Quotes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {stats.recentQuotes.length > 0 ? (
                      stats.recentQuotes.map((quote) => renderRecentActivityItem(quote, FileText, "text-blue-500", "quote"))
                    ) : (
                      <p className="text-gray-500 text-sm">No recent quotes</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Sales</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {stats.recentSales.length > 0 ? (
                      stats.recentSales.map((sale) => renderRecentActivityItem(sale, TrendingUp, "text-green-500", "sale"))
                    ) : (
                      <p className="text-gray-500 text-sm">No recent sales</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;