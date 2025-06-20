import React from "react";
import { motion } from "framer-motion";
import { Package, DollarSign, Tag, Trash2, Edit, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { getProductPriceForQuantity } from "@/lib/productData";

const ProductTable = ({ products, onEdit, onDelete, loading = false, onAddProduct }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };
  
  const getDefaultPrice = (product) => {
    if (product.priceTiers && product.priceTiers.length > 0) {
      return getProductPriceForQuantity(product, 1);
    }
    return product.price || 0;
  };

  if (loading) {
    return (
      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <TableSkeleton rows={5} columns={4} />
        </CardContent>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <EmptyState
            icon={Package}
            title="No products found"
            description="Get started by adding your first product. You can define pricing tiers and manage your product catalog here."
            action={!!onAddProduct}
            actionLabel="Add Product"
            onAction={onAddProduct}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <motion.tr
                  key={product.id}
                  variants={itemVariants}
                  className="border-b transition-colors hover:bg-gray-50"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Package className="h-4 w-4 text-teal-500 mr-2" />
                      {product.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 text-gray-400 mr-2" />
                      {product.category}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                      {getDefaultPrice(product).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onEdit(product)}
                        title="Edit Product"
                      >
                        <Edit className="h-4 w-4 text-amber-500" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onDelete(product)}
                        title="Delete Product"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProductTable;