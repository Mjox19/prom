import { getAllItems, getItemById, addItem, updateItem, deleteItem } from '@/lib/localStorageUtils';

const QUOTES_KEY = 'quotes';

export const getQuotes = () => getAllItems(QUOTES_KEY);
export const getQuoteById = (id) => getItemById(QUOTES_KEY, id);
export const addQuote = (quote) => addItem(QUOTES_KEY, { ...quote, status: 'draft' });
export const updateQuote = (id, updatedData) => updateItem(QUOTES_KEY, id, updatedData);
export const deleteQuote = (id) => deleteItem(QUOTES_KEY, id);