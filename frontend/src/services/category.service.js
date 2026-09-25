import { apiRequest } from "./api";

async function getCategories() {
  return apiRequest("/categories");
}

async function getCategoryById(categoryId) {
  return apiRequest(`/categories/${categoryId}`);
}

async function createCategory(categoryData) {
  return apiRequest("/categories", {
    method: "POST",
    body: JSON.stringify(categoryData),
  });
}

async function updateCategory(categoryId, categoryData) {
  return apiRequest(`/categories/${categoryId}`, {
    method: "PATCH",
    body: JSON.stringify(categoryData),
  });
}

async function deactivateCategory(categoryId) {
  return apiRequest(`/categories/${categoryId}`, {
    method: "DELETE",
  });
}

export {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deactivateCategory,
};
