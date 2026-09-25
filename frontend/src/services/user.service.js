import { apiRequest } from "./api";

// Get all users
async function getUsers() {
  return apiRequest("/users");
}

// Get a single user
async function getUserById(userId) {
  return apiRequest(`/users/${userId}`);
}

// Create a user
async function createUser(userData) {
  return apiRequest("/users", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

// Update a user
async function updateUser(userId, userData) {
  return apiRequest(`/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(userData),
  });
}

// Deactivate a user
async function deactivateUser(userId) {
  return apiRequest(`/users/${userId}/deactivate`, {
    method: "PATCH",
  });
}

// Reactivate a user
async function reactivateUser(userId) {
  return apiRequest(`/users/${userId}/reactivate`, {
    method: "PATCH",
  });
}

// Update user availability
async function updateUserAvailability(userId, availability) {
  return apiRequest(`/users/${userId}/availability`, {
    method: "PATCH",
    body: JSON.stringify({
      availability,
    }),
  });
}

export {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
  reactivateUser,
  updateUserAvailability,
};
