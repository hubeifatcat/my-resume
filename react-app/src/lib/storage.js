export function getToken() {
  return localStorage.getItem("ma_token");
}

export function setToken(token) {
  localStorage.setItem("ma_token", token);
}

export function clearToken() {
  localStorage.removeItem("ma_token");
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("ma_user"));
  } catch (e) {
    return null;
  }
}

export function setUser(user) {
  localStorage.setItem("ma_user", JSON.stringify(user));
}

export function clearUser() {
  localStorage.removeItem("ma_user");
}
