// src/auth/auth.js

export const UI_ROLES = [
  "Clinical Manager",
  "Chief Nursing Officer",
  "System Administrator",
];

export const UI_ROLE_TO_CODE = {
  "Clinical Manager": "MANAGER",
  "Chief Nursing Officer": "CNO",
  "System Administrator": "SYSADMIN",
};

export const ROLE_TO_ROUTE = {
  MANAGER: "/manager",
  CNO: "/cno",
  SYSADMIN: "/sysadmin",
};

export function saveAuth({ access, refresh, role }) {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
  localStorage.setItem("user_role", role);
}


export function getAccess() {
  return localStorage.getItem("access_token");
}

export function getAccessToken() {
  return localStorage.getItem("access_token");
}

export function getRole() {
  return localStorage.getItem("user_role");
}

export function isAuthed() {
  return !!getAccess();
}

export function clearAuth() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user_role");
}
