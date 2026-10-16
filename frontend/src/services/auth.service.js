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


async function requestPasswordReset(email) {
  return apiRequest("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

async function resetPassword(token, password, confirmPassword) {
  return apiRequest("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password, confirmPassword }),
  });
}

export { login, getCurrentUser, logout, requestPasswordReset, resetPassword };
