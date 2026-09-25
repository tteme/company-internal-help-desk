import { apiRequest } from "./api";

async function getKeywordsByCategory(categoryId) {
  return apiRequest(`/categories/${categoryId}/keywords`);
}

async function getKeywordById(keywordId) {
  return apiRequest(`/category-keywords/${keywordId}`);
}

async function createKeyword(categoryId, keyword, weight) {
  return apiRequest(`/categories/${categoryId}/keywords`, {
    method: "POST",
    body: JSON.stringify({
      keyword,
      weight,
    }),
  });
}

async function updateKeyword(keywordId, keywordData) {
  return apiRequest(`/category-keywords/${keywordId}`, {
    method: "PATCH",
    body: JSON.stringify(keywordData),
  });
}

async function deactivateKeyword(keywordId) {
  return apiRequest(`/category-keywords/${keywordId}`, {
    method: "DELETE",
  });
}

export {
  getKeywordsByCategory,
  getKeywordById,
  createKeyword,
  updateKeyword,
  deactivateKeyword,
};
