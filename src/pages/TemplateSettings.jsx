import React from "react";
import { motion } from "framer-motion";
import { Mail, FileText, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layout/Header";
import TemplateManager from "@/components/templates/TemplateManager";

const TemplateSettings = () => {
  const [activeTab, setActiveTab] = React.useState("email");

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

  return (
    <div className="h-full flex flex-col">
      <Header title="Template Settings" />
      
      <div className="flex-1 p-6 overflow-y-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div variants={itemVariants}>
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Template Management</CardTitle>
                <CardDescription>
                  Customize email templates, PDF layouts, and notification formats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="email" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-6">
                    <TabsTrigger value="email" className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Email Templates
                    </TabsTrigger>
                    <TabsTrigger value="pdf" className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      PDF Templates
                    </TabsTrigger>
                    <TabsTrigger value="notification" className="flex items-center">
                      <Truck className="h-4 w-4 mr-2" />
                      Notification Templates
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="email">
                    <TemplateManager />
                  </TabsContent>
                  
                  <TabsContent value="pdf">
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-700">PDF Template Management</h3>
                      <p className="text-gray-500 max-w-md mx-auto mt-2">
                        PDF template customization is coming soon. This feature will allow you to customize the layout and design of your quote and order PDFs.
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="notification">
                    <div className="text-center py-12">
                      <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-700">Notification Template Management</h3>
                      <p className="text-gray-500 max-w-md mx-auto mt-2">
                        Notification template customization is coming soon. This feature will allow you to customize the content and format of system notifications.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default TemplateSettings;