import { apiRequest } from "./api";

async function login(email, password) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

async function getCurrentUser() {
  return apiRequest("/auth/me");
}

async function logout() {
  return apiRequest("/auth/logout", {
    method: "POST",
  });
}

export { login, getCurrentUser, logout };
