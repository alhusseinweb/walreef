export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const isAdmin = () => {
  const userType = localStorage.getItem('userType');
  const role = localStorage.getItem('userRole');
  return userType === 'admin' && role === 'admin';
};

export const isStaff = () => {
  const userType = localStorage.getItem('userType');
  const role = localStorage.getItem('userRole');
  return userType === 'staff' || role === 'staff';
};

export const isCustomer = () => {
  return localStorage.getItem('userType') === 'customer';
};

export const getUserRole = () => {
  return localStorage.getItem('userRole') || 'admin';
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userType');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userName');
  window.location.href = '/';
};

export const setAuthToken = (token, userType, role = 'admin', name = '') => {
  localStorage.setItem('token', token);
  localStorage.setItem('userType', userType);
  localStorage.setItem('userRole', role);
  localStorage.setItem('userName', name);
};