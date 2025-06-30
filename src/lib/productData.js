import { getAllItems, getItemById, addItem, updateItem, deleteItem } from '@/lib/localStorageUtils';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

const PRODUCTS_KEY = 'products';

export const getProducts = async () => {
  if (!isSupabaseConfigured) {
    // Use local storage in demo mode
    const products = getAllItems(PRODUCTS_KEY);
    if (products.length === 0) {
      seedProducts();
      return getAllItems(PRODUCTS_KEY);
    }
    return products;
  }

  try {
    // Fetch from Supabase
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });
      
    if (error) throw error;
    
    // Transform price_tiers to priceTiers for compatibility
    const transformedData = data?.map(product => ({
      ...product,
      priceTiers: product.price_tiers || []
    })) || [];
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching products from Supabase:', error);
    // Fallback to local storage
    const products = getAllItems(PRODUCTS_KEY);
    if (products.length === 0) {
      seedProducts();
      return getAllItems(PRODUCTS_KEY);
    }
    return products;
  }
};

export const getProductById = async (id) => {
  if (!isSupabaseConfigured) {
    return getItemById(PRODUCTS_KEY, id);
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    
    // Transform price_tiers to priceTiers for compatibility
    return {
      ...data,
      priceTiers: data.price_tiers || []
    };
  } catch (error) {
    console.error('Error fetching product from Supabase:', error);
    return getItemById(PRODUCTS_KEY, id);
  }
};

export const addProduct = async (product) => {
  const defaultTiers = [{ upToQuantity: 10000, price: product.price || 0 }];
  const productToAdd = {
    ...product,
    priceTiers: product.priceTiers && product.priceTiers.length > 0 ? product.priceTiers : defaultTiers,
  };
  delete productToAdd.price; // Remove single price if tiers are used

  if (!isSupabaseConfigured) {
    return addItem(PRODUCTS_KEY, productToAdd);
  }

  try {
    // Transform priceTiers to price_tiers for Supabase
    const supabaseProduct = {
      ...productToAdd,
      price_tiers: productToAdd.priceTiers
    };
    delete supabaseProduct.priceTiers;

    const { data, error } = await supabase
      .from('products')
      .insert([supabaseProduct])
      .select()
      .single();
      
    if (error) throw error;
    
    // Transform back for return
    return {
      ...data,
      priceTiers: data.price_tiers || []
    };
  } catch (error) {
    console.error('Error adding product to Supabase:', error);
    return addItem(PRODUCTS_KEY, productToAdd);
  }
};

export const updateProduct = async (id, updatedData) => {
  const productToUpdate = { ...updatedData };
  if (productToUpdate.priceTiers && productToUpdate.priceTiers.length > 0) {
    delete productToUpdate.price;
  }

  if (!isSupabaseConfigured) {
    return updateItem(PRODUCTS_KEY, id, productToUpdate);
  }

  try {
    // Transform priceTiers to price_tiers for Supabase
    const supabaseProduct = {
      ...productToUpdate,
      price_tiers: productToUpdate.priceTiers,
      updated_at: new Date().toISOString()
    };
    delete supabaseProduct.priceTiers;

    const { data, error } = await supabase
      .from('products')
      .update(supabaseProduct)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    // Transform back for return
    return {
      ...data,
      priceTiers: data.price_tiers || []
    };
  } catch (error) {
    console.error('Error updating product in Supabase:', error);
    return updateItem(PRODUCTS_KEY, id, productToUpdate);
  }
};

export const deleteProduct = async (id) => {
  if (!isSupabaseConfigured) {
    return deleteItem(PRODUCTS_KEY, id);
  }

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting product from Supabase:', error);
    return deleteItem(PRODUCTS_KEY, id);
  }
};

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