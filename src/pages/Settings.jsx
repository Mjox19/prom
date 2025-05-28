import React from "react";
import { motion } from "framer-motion";
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Lock, 
  CreditCard, 
  HelpCircle, 
  LogOut,
  Save,
  Palette,
  BellRing,
  ShieldCheck,
  DollarSign,
  Headphones
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/layout/Header";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const settingsSections = [
  { id: "profile", label: "Profile", icon: User, description: "Update your personal information." },
  { id: "notifications", label: "Notifications", icon: BellRing, description: "Manage your notification preferences." },
  { id: "security", label: "Security", icon: ShieldCheck, description: "Change password and manage security settings." },
  { id: "billing", label: "Billing", icon: DollarSign, description: "View payment history and manage subscriptions." },
  { id: "appearance", label: "Appearance", icon: Palette, description: "Customize the look and feel of the application." },
  { id: "help", label: "Help & Support", icon: Headphones, description: "Get help and support." }
];

const Settings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = React.useState("profile");
  const [loading, setLoading] = React.useState(false);
  const [notificationPrefs, setNotificationPrefs] = React.useState({
    email_news: true,
    email_quotes: true,
    email_sales: true,
    push_enabled: false
  });
  
  // Get display name from email
  const displayName = user?.email 
    ? user.email
        .split('@')[0]
        .split('.')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    : '';

  const [formData, setFormData] = React.useState({
    firstName: displayName.split(' ')[0] || '',
    lastName: displayName.split(' ')[1] || '',
    email: user?.email || '',
    bio: "Dedicated sales professional managing quotes and deals."
  });

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        if (profileData) {
          const names = profileData.full_name ? profileData.full_name.split(' ') : [formData.firstName, formData.lastName];
          setFormData({
            firstName: names[0] || '',
            lastName: names.slice(1).join(' ') || '',
            email: user.email,
            bio: profileData.bio || formData.bio
          });
        }

        // First try to get existing preferences
        const { data: prefData, error: prefError } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (prefError) throw prefError;

        if (prefData) {
          // If preferences exist, use them
          setNotificationPrefs(prefData);
        } else {
          // If no preferences exist, create default ones
          const defaultPrefs = {
            user_id: user.id,
            email_news: true,
            email_quotes: true,
            email_sales: true,
            push_enabled: false
          };

          const { error: insertError } = await supabase
            .from('notification_preferences')
            .insert([defaultPrefs]);

          if (insertError) throw insertError;

          setNotificationPrefs(defaultPrefs);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load settings. Please try again.",
          variant: "destructive"
        });
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleSave = async (sectionName) => {
    setLoading(true);
    try {
      if (sectionName === "Profile") {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: `${formData.firstName} ${formData.lastName}`.trim(),
            bio: formData.bio,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;

        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
      } else if (sectionName === "Notifications") {
        const { error } = await supabase
          .from('notification_preferences')
          .upsert({
            user_id: user.id,
            ...notificationPrefs,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;

        if ('Notification' in window && notificationPrefs.push_enabled) {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            toast({
              title: "Push Notifications Enabled",
              description: "You will now receive push notifications.",
            });
          } else {
            setNotificationPrefs(prev => ({ ...prev, push_enabled: false }));
            toast({
              title: "Push Notifications Disabled",
              description: "Please enable notifications in your browser settings.",
              variant: "destructive"
            });
          }
        }

        toast({
          title: "Notification Settings Saved",
          description: "Your notification preferences have been updated.",
        });
      } else {
        toast({
          title: "Settings Saved",
          description: `Your ${sectionName} settings have been successfully saved.`,
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (key, value) => {
    setNotificationPrefs(prev => ({ ...prev, [key]: value }));
  };

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
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 120 }
    }
  };

  const renderSectionContent = () => {
    switch(activeSection) {
      case "profile":
        return (
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Profile Information</CardTitle>
              <CardDescription>Update your account's profile information and email address.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email}
                  disabled
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="bio">Bio</Label>
                <Textarea 
                  id="bio" 
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Tell us a little about yourself" 
                />
              </div>
              <Button 
                onClick={() => handleSave("Profile")} 
                className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⌛</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        );
      case "notifications":
        return (
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Notification Settings</CardTitle>
              <CardDescription>Choose how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-base font-medium">Email Notifications</Label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="emailNews" 
                    checked={notificationPrefs.email_news}
                    onChange={(e) => handleNotificationChange('email_news', e.target.checked)}
                    className="form-checkbox h-5 w-5 text-indigo-600" 
                  />
                  <Label htmlFor="emailNews" className="font-normal">News and Updates</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="emailQuotes" 
                    checked={notificationPrefs.email_quotes}
                    onChange={(e) => handleNotificationChange('email_quotes', e.target.checked)}
                    className="form-checkbox h-5 w-5 text-indigo-600" 
                  />
                  <Label htmlFor="emailQuotes" className="font-normal">Quote Status Changes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="emailSales" 
                    checked={notificationPrefs.email_sales}
                    onChange={(e) => handleNotificationChange('email_sales', e.target.checked)}
                    className="form-checkbox h-5 w-5 text-indigo-600" 
                  />
                  <Label htmlFor="emailSales" className="font-normal">Sale Milestones</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-base font-medium">Push Notifications</Label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="pushAll" 
                    checked={notificationPrefs.push_enabled}
                    onChange={(e) => handleNotificationChange('push_enabled', e.target.checked)}
                    className="form-checkbox h-5 w-5 text-indigo-600" 
                  />
                  <Label htmlFor="pushAll" className="font-normal">Enable Push Notifications</Label>
                </div>
              </div>
              <Button 
                onClick={() => handleSave("Notifications")} 
                className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⌛</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Notification Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        );
      case "security":
        return (
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Security Settings</CardTitle>
              <CardDescription>Manage your password and account security.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>
              <div className="pt-2">
                <Label className="font-medium">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account.
                </p>
                <Button variant="outline" className="mt-2">Enable 2FA</Button>
              </div>
              <Button onClick={() => handleSave("Security")} className="mt-4 bg-indigo-600 hover:bg-indigo-700">
                <Save className="h-4 w-4 mr-2" />
                Update Security Settings
              </Button>
            </CardContent>
          </Card>
        );
      default:
        return (
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">{settingsSections.find(s => s.id === activeSection)?.label || "Settings"}</CardTitle>
              <CardDescription>{settingsSections.find(s => s.id === activeSection)?.description || "Manage your settings."}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Content for {settingsSections.find(s => s.id === activeSection)?.label || "this section"} coming soon.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Header title="Settings" />
      
      <div className="flex-1 p-6 overflow-y-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-12 gap-6"
        >
          <motion.div variants={itemVariants} className="col-span-12 md:col-span-3">
            <Card className="border-none shadow-sm bg-white">
              <CardContent className="p-2">
                <nav className="flex flex-col space-y-1">
                  {settingsSections.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`flex items-center px-3 py-2.5 rounded-md text-sm transition-all duration-150 ease-in-out
                          ${isActive 
                            ? "bg-indigo-100 text-indigo-700 font-semibold" 
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          }`
                        }
                      >
                        <Icon className={`h-5 w-5 mr-3 ${isActive ? "text-indigo-600" : "text-gray-400"}`} />
                        <span>{section.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div 
            key={activeSection} 
            variants={itemVariants} 
            className="col-span-12 md:col-span-9"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderSectionContent()}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;