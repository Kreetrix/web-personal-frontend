const API = `https://media2.edu.metropolia.fi/restaurant/api/v1`;

//TODO: Move auth related requests to a different file

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

async function getRestaurants() {
  try {
    const response = await fetch(
      `${API}/restaurants`,
      {method: 'GET'},
      {headers}
    );
    return await response.json();
  } catch (e) {
    console.log(`Error -> ${e}`);
  }
}

async function getByDay(id) {
  try {
    const response = await fetch(
      `${API}/restaurants/daily/${id}/fi`,
      {method: 'GET'},
      {headers}
    );
    return await response.json();
  } catch (e) {
    console.log(`Error -> ${e}`);
  }
}

async function getByWeek(id) {
    try {
      const response = await fetch(
        `${API}/restaurants/weekly/${id}/fi`,
        {method: 'GET'},
        {headers}
      );
      return await response.json();
    } catch (e) {
      console.log(`Error -> ${e}`);
    }
  }

async function registerUser(userData) {
  const response = await fetch(`${API}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Registration failed');
  }
  
  return await response.json();
}

async function loginUser(credentials) {
  const response = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }
  
  return await response.json();
}

async function fetchUsername(username) {
  try {
    const response = await fetch(`${API}/users/available/${username}`);
    return await response.json();
  } catch (e) {
    console.log(`Error -> ${e}`);
  }
}

async function fetchUserData() {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Not authenticated');
  
  const response = await fetch(`${API}/users/token`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch profile data');
  }
  
  return await response.json();
}

async function uploadAvatar(file) {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Not authenticated');
  
  const formData = new FormData();
  formData.append('avatar', file);
  
  const response = await fetch(`${API}/users/avatar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Upload failed');
  }
  
  return await response.json();
}

export {getRestaurants, getByDay, getByWeek, registerUser, loginUser, fetchUserData, uploadAvatar, fetchUsername};
