import { getAllItems, getItemById, addItem, updateItem, deleteItem } from '@/lib/localStorageUtils';
import { v4 as uuidv4 } from 'uuid';

const PRODUCTS_KEY = 'products';

export const getProducts = () => {
  const products = getAllItems(PRODUCTS_KEY);
  if (products.length === 0) {
    seedProducts();
    return getAllItems(PRODUCTS_KEY);
  }
  return products;
};

export const getProductById = (id) => getItemById(PRODUCTS_KEY, id);

export const addProduct = (product) => {
  const defaultTiers = [{ upToQuantity: 10000, price: product.price || 0 }];
  const productToAdd = {
    ...product,
    priceTiers: product.priceTiers && product.priceTiers.length > 0 ? product.priceTiers : defaultTiers,
  };
  delete productToAdd.price; // Remove single price if tiers are used
  return addItem(PRODUCTS_KEY, productToAdd);
};

export const updateProduct = (id, updatedData) => {
  const productToUpdate = { ...updatedData };
  if (productToUpdate.priceTiers && productToUpdate.priceTiers.length > 0) {
    delete productToUpdate.price;
  }
  return updateItem(PRODUCTS_KEY, id, productToUpdate);
};

export const deleteProduct = (id) => deleteItem(PRODUCTS_KEY, id);

export const seedProducts = () => {
  const existingProducts = getAllItems(PRODUCTS_KEY);
  if (existingProducts.length === 0) {
    const sampleProducts = [
      { 
        id: uuidv4(),
        name: "Standard Software License", 
        category: "Software", 
        priceTiers: [
          { upToQuantity: 10, price: 1200.00 }, 
          { upToQuantity: 100, price: 1100.00 }, 
          { upToQuantity: 10000, price: 1000.00 }
        ], 
        description: "A standard license for our flagship software." 
      },
      { 
        id: uuidv4(),
        name: "Premium Support Package", 
        category: "Service", 
        priceTiers: [{ upToQuantity: 10000, price: 500.00 }], 
        description: "1-year premium support with 24/7 access." 
      },
      { 
        id: uuidv4(),
        name: "Consulting Hour", 
        category: "Service", 
        priceTiers: [{ upToQuantity: 10000, price: 150.00 }], 
        description: "One hour of expert consultation." 
      },
      { 
        id: uuidv4(),
        name: "Hardware Component A", 
        category: "Hardware", 
        priceTiers: [{ upToQuantity: 10000, price: 350.00 }], 
        description: "Essential hardware component for system integration." 
      },
      { 
        id: uuidv4(),
        name: "Training Workshop", 
        category: "Training", 
        priceTiers: [{ upToQuantity: 10000, price: 2000.00 }], 
        description: "Full-day training workshop for up to 10 people." 
      },
    ];
    
    // Add each product individually to ensure proper ID generation
    sampleProducts.forEach(product => {
      const existingProduct = getAllItems(PRODUCTS_KEY).find(p => p.name === product.name);
      if (!existingProduct) {
        addItem(PRODUCTS_KEY, product);
      }
    });
  }
};

export const getProductPriceForQuantity = (product, quantity) => {
  if (!product || !product.priceTiers || product.priceTiers.length === 0) {
    return 0; 
  }

  const sortedTiers = [...product.priceTiers].sort((a, b) => a.upToQuantity - b.upToQuantity);

  for (const tier of sortedTiers) {
    if (quantity <= tier.upToQuantity) {
      return tier.price;
    }
  }
  
  return sortedTiers[sortedTiers.length - 1].price; // Default to highest tier price if quantity exceeds all tiers
};