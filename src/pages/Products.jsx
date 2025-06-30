import React, { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Header from "@/components/layout/Header";
import { useToast } from "@/components/ui/use-toast";
import ProductFormDialog from "@/components/products/ProductFormDialog";
import ProductTable from "@/components/products/ProductTable";
import { getProducts, addProduct, updateProduct, deleteProduct, seedProducts } from "@/lib/productData";

const Products = () => {
  const [products, setProductsState] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      seedProducts();
      const productsData = await getProducts();
      setProductsState(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      console.error('Error loading products:', error);
      setProductsState([]);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetCurrentProductState = () => {
    setSelectedProduct(null);
  };

  const handleFormSubmit = async (productData) => {
    try {
      if (selectedProduct) {
        await updateProduct(selectedProduct.id, productData);
        toast({ title: "Product updated", description: "The product has been successfully updated." });
      } else {
        await addProduct(productData);
        toast({ title: "Product added", description: "The product has been successfully added." });
      }
      
      // Reload products to show updated data
      await loadProducts();
      setIsFormDialogOpen(false);
      resetCurrentProductState();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (product) => {
    setSelectedProduct(product);
    setIsFormDialogOpen(true);
  };

  const openDeleteDialog = (product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (selectedProduct) {
      try {
        await deleteProduct(selectedProduct.id);
        await loadProducts();
        setIsDeleteDialogOpen(false);
        setSelectedProduct(null);
        toast({ title: "Product deleted", description: "The product has been successfully deleted.", variant: "destructive" });
      } catch (error) {
        console.error('Error deleting product:', error);
        toast({
          title: "Error",
          description: "Failed to delete product. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsFormDialogOpen(true);
  };

  const filteredProducts = Array.isArray(products) ? products.filter(product => 
    (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  return (
    <div className="h-full flex flex-col">
      <Header title="Product Management" />
      
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <Dialog open={isFormDialogOpen} onOpenChange={(isOpen) => {
              setIsFormDialogOpen(isOpen);
              if (!isOpen) resetCurrentProductState();
            }}>
              <DialogTrigger asChild>
                <Button onClick={handleAddProduct} className="bg-teal-600 hover:bg-teal-700">
                  <Plus className="h-4 w-4 mr-2" /> Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <ProductFormDialog 
                  onOpenChange={setIsFormDialogOpen}
                  product={selectedProduct}
                  onSubmit={handleFormSubmit}
                  resetForm={resetCurrentProductState}
                />
              </DialogContent>
            </Dialog>
            
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                className="pl-10 w-full sm:w-64" 
                placeholder="Search products..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <ProductTable 
            products={filteredProducts} 
            onEdit={openEditDialog} 
            onDelete={openDeleteDialog}
            loading={loading}
            onAddProduct={handleAddProduct}
          />
        </div>
      </div>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>Are you sure you want to delete this product? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;