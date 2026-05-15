import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

// ========== Actor API (Public) ==========
export const getActors = async (page = 1, limit = 12, tags = '') => {
  const params = { page, limit };
  if (tags) params.tags = tags;
  const response = await axios.get(`${API_URL}/actors`, { params });
  return response.data;
};

export const getActorById = async (id) => {
  const response = await axios.get(`${API_URL}/actors/${id}`);
  return response.data;
};
// ========== Random API ==========
export const getRandomActor = async (tags = '', excludeIds = []) => {
  const params = {};
  if (tags) params.tags = tags;
  if (excludeIds.length > 0) params.exclude = excludeIds.join(',');
  const response = await axios.get(`${API_URL}/actors/random`, { params });
  return response.data;
};
// ========== Auth API ==========
export const loginAdmin = async (username, password) => {
  const response = await axios.post(`${API_URL}/auth/login`, { username, password });
  return response.data;
};

export const getMe = async (token) => {
  const response = await axios.get(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// ========== Actor Admin API (Protected) ==========
const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return {
    headers: { Authorization: `Bearer ${user?.token}` },
  };
};

export const createActor = async (actorData) => {
  const response = await axios.post(`${API_URL}/actors`, actorData, getAuthHeaders());
  return response.data;
};

export const updateActor = async (id, actorData) => {
  const response = await axios.put(`${API_URL}/actors/${id}`, actorData, getAuthHeaders());
  return response.data;
};

export const deleteActor = async (id) => {
  const response = await axios.delete(`${API_URL}/actors/${id}`, getAuthHeaders());
  return response.data;
};


// ========== Upload API ==========
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const user = JSON.parse(localStorage.getItem('user'));
  const response = await axios.post(`${API_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${user?.token}`,
    },
  });
  return response.data;
};
