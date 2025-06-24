import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, Shield, UserPlus, Edit, Trash2, Search, Filter, Crown, 
  UserCheck, AlertTriangle, Settings, Mail, Calendar, ArrowUpDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import Header from "@/components/layout/Header";
import { useToast } from "@/components/ui/use-toast";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const UserManagementDialog = ({ open, onOpenChange, user, onSubmit }) => {
  const [selectedRole, setSelectedRole] = useState(user?.role || 'user');

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    } else {
      setSelectedRole('user');
    }
  }, [user, open]);

  const handleSubmit = () => {
    onSubmit(user.id, selectedRole);
  };

  const roles = [
    { value: 'user', label: 'User', description: 'Basic access to own data' },
    { value: 'admin', label: 'Admin', description: 'Manage products and view all data' },
    { value: 'super_admin', label: 'Super Admin', description: 'Full system access and user management' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage User Role</DialogTitle>
          <DialogDescription>
            Change the role for {user?.full_name || user?.email}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Current Role</Label>
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="flex items-center">
                <Shield className="h-4 w-4 text-gray-500 mr-2" />
                <span className="font-medium">{user?.role?.replace('_', ' ').toUpperCase()}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>New Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select new role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{role.label}</span>
                      <span className="text-xs text-gray-500">{role.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedRole === 'super_admin' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-start">
                <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800">Warning</p>
                  <p className="text-amber-700">Super admins have full system access including user management.</p>
                </div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={selectedRole === user?.role}
          >
            Update Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user: currentUser, userProfile, isSuperAdmin } = useAuth();

  useEffect(() => {
    if (currentUser && isSuperAdmin()) {
      loadUsers();
    } else {
      setLoading(false);
    }
  }, [currentUser, userProfile]);

  const loadUsers = async () => {
    try {
      setLoading(true);

      if (!isSupabaseConfigured) {
        // Demo data
        setUsers([
          {
            id: '1',
            email: 'admin@promocups.com',
            full_name: 'Admin User',
            role: 'admin',
            created_at: new Date().toISOString(),
            last_sign_in_at: new Date().toISOString()
          },
          {
            id: '2',
            email: 'user@promocups.com',
            full_name: 'Regular User',
            role: 'user',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            last_sign_in_at: new Date(Date.now() - 3600000).toISOString()
          }
        ]);
        setLoading(false);
        return;
      }

      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(profilesData || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      if (!isSupabaseConfigured) {
        // Demo mode
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ));
        setIsManageDialogOpen(false);
        setSelectedUser(null);
        toast({
          title: "Role Updated (Demo Mode)",
          description: `User role changed to ${newRole} in demo data.`
        });
        return;
      }

      const { data, error } = await supabase.rpc('change_user_role', {
        target_user_id: userId,
        new_role: newRole
      });

      if (error) throw error;

      // Refresh users list
      await loadUsers();
      
      setIsManageDialogOpen(false);
      setSelectedUser(null);
      
      toast({
        title: "Role Updated",
        description: `User role successfully changed to ${newRole}.`
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user role.",
        variant: "destructive"
      });
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return <ArrowUpDown className={`h-4 w-4 ${sortDirection === "asc" ? "text-orange-500" : "text-orange-500 rotate-180"}`} />;
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'super_admin':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'user':
        return <UserCheck className="h-4 w-4 text-green-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'super_admin':
        return 'bg-yellow-100 text-yellow-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter and sort users
  const filteredAndSortedUsers = users
    .filter(user => {
      const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter ? user.role === roleFilter : true;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      let aValue = a[sortField] || '';
      let bValue = b[sortField] || '';
      
      if (sortDirection === "asc") {
        return String(aValue).localeCompare(String(bValue));
      } else {
        return String(bValue).localeCompare(String(aValue));
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredAndSortedUsers.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 }}
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 }}
  };

  // Check if user has permission to access this page
  if (!isSuperAdmin()) {
    return (
      <div className="h-full flex flex-col">
        <Header title="Admin Panel" />
        <div className="flex-1 p-6 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-gray-600">You don't have permission to access the admin panel.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <Header title="Admin Panel" />
        <div className="flex-1 p-6">
          <Card className="border-none shadow-sm">
            <CardContent className="p-0">
              <TableSkeleton rows={5} columns={5} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Header title="Admin Panel" />
      
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto bg-gray-50">
        <div className="flex flex-col space-y-6">
          {/* Stats Cards */}
          <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <motion.div variants={itemVariants}>
              <Card className="bg-white border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Card className="bg-white border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Crown className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Super Admins</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {users.filter(u => u.role === 'super_admin').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Card className="bg-white border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Shield className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Admins</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {users.filter(u => u.role === 'admin').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 gap-4">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  className="pl-10 w-full sm:w-64 bg-white"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <Select value={roleFilter} onValueChange={(value) => {
                setRoleFilter(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-full sm:w-40 bg-white">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2 text-gray-400" />
                    <SelectValue placeholder="All Roles" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Roles</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Users Table */}
          {filteredAndSortedUsers.length === 0 ? (
            <Card className="border-none shadow-sm bg-white">
              <CardContent className="p-0">
                <EmptyState
                  icon={Users}
                  title="No users found"
                  description={searchTerm || roleFilter ? 
                    "No users match your current filters. Try adjusting your search criteria." :
                    "No users found in the system."
                  }
                />
              </CardContent>
            </Card>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <Card className="border-none shadow-sm bg-white">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50 select-none"
                            onClick={() => handleSort("full_name")}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Name</span>
                              {getSortIcon("full_name")}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50 select-none"
                            onClick={() => handleSort("email")}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Email</span>
                              {getSortIcon("email")}
                            </div>
                          </TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50 select-none hidden md:table-cell"
                            onClick={() => handleSort("created_at")}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Joined</span>
                              {getSortIcon("created_at")}
                            </div>
                          </TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentUsers.map((user) => (
                          <motion.tr
                            key={user.id}
                            variants={itemVariants}
                            className="border-b hover:bg-gray-50"
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-sm font-medium text-orange-700">
                                    {(user.full_name || user.email).charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <span className="truncate">{user.full_name || user.email.split('@')[0]}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                <span className="truncate">{user.email}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {getRoleIcon(user.role)}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                  {user.role.replace('_', ' ').toUpperCase()}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex items-center text-gray-500">
                                <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                                <span className="truncate">{new Date(user.created_at).toLocaleDateString()}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-1">
                                {user.id !== currentUser.id && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setIsManageDialogOpen(true);
                                    }}
                                    title="Manage User Role"
                                  >
                                    <Settings className="h-4 w-4 text-orange-500" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {totalPages > 1 && (
                    <div className="border-t p-4">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        itemsPerPage={itemsPerPage}
                        totalItems={filteredAndSortedUsers.length}
                        onItemsPerPageChange={handleItemsPerPageChange}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      <UserManagementDialog
        open={isManageDialogOpen}
        onOpenChange={setIsManageDialogOpen}
        user={selectedUser}
        onSubmit={handleRoleChange}
      />
    </div>
  );
};

export default Admin;