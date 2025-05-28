import { v4 as uuidv4 } from 'uuid';

export const initializeStorageKey = (key, defaultValue = []) => {
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
  }
};

export const getAllItems = (key) => {
  initializeStorageKey(key);
  return JSON.parse(localStorage.getItem(key));
};

export const getItemById = (key, id) => {
  const items = getAllItems(key);
  return items.find(item => item.id === id);
};

export const addItem = (key, itemData) => {
  const items = getAllItems(key);
  const newItem = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    ...itemData,
  };
  localStorage.setItem(key, JSON.stringify([...items, newItem]));
  return newItem;
};

export const updateItem = (key, id, updatedData) => {
  const items = getAllItems(key);
  const updatedItems = items.map(item =>
    item.id === id ? { ...item, ...updatedData, updatedAt: new Date().toISOString() } : item
  );
  localStorage.setItem(key, JSON.stringify(updatedItems));
  return updatedItems.find(item => item.id === id);
};

export const deleteItem = (key, id) => {
  const items = getAllItems(key);
  const filteredItems = items.filter(item => item.id !== id);
  localStorage.setItem(key, JSON.stringify(filteredItems));
};