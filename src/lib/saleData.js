import { getAllItems, getItemById, addItem, updateItem, deleteItem } from '@/lib/localStorageUtils';

const SALES_KEY = 'sales';

export const getSales = () => getAllItems(SALES_KEY);
export const getSaleById = (id) => getItemById(SALES_KEY, id);
export const addSale = (sale) => addItem(SALES_KEY, { ...sale, status: 'lead' });
export const updateSale = (id, updatedData) => updateItem(SALES_KEY, id, updatedData);
export const deleteSale = (id) => deleteItem(SALES_KEY, id);