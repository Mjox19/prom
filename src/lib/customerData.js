import { getAllItems, getItemById, addItem, updateItem, deleteItem } from '@/lib/localStorageUtils';

const CUSTOMERS_KEY = 'customers';

// Basic CRUD operations for customers
export const getCustomers = () => getAllItems(CUSTOMERS_KEY);
export const getCustomerById = (id) => getItemById(CUSTOMERS_KEY, id);
export const addCustomer = (customer) => addItem(CUSTOMERS_KEY, customer);
export const updateCustomer = (id, updatedData) => updateItem(CUSTOMERS_KEY, id, updatedData);
export const deleteCustomer = (id) => deleteItem(CUSTOMERS_KEY, id);