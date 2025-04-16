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

//dead for now
async function getCurrentUser() {
  const token = localStorage.getItem('authToken');
  if (!token) return null;
  
  try {
    const response = await fetch(`${this.baseUrl}/users/token`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error('Not authenticated');
    
    return await response.json();
  } catch (error) {
    localStorage.removeItem('authToken');
    return null;
  }
}

export {getRestaurants, getByDay, getByWeek, registerUser, loginUser, getCurrentUser};
