export const getUser = () => {
  if (typeof window === "undefined") return null;
  return JSON.parse(localStorage.getItem("user"));
};

export const setUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const logout = () => {
  localStorage.removeItem("user");
};