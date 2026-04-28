const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
export const GOOGLE_AUTH_URL = `${API_BASE_URL}/auth/google`;


const getHeaders = () => {
  const token = localStorage.getItem('codefolio_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth
  sendCode: async (email) => {
    const res = await fetch(`${API_BASE_URL}/auth/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return res.json();
  },

  verifyCode: async (email, code) => {
    const res = await fetch(`${API_BASE_URL}/auth/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('codefolio_token', data.token);
      localStorage.setItem('codefolio_user', JSON.stringify(data.user));
    }
    return data;
  },

  // Projects
  getProjects: async () => {
    const res = await fetch(`${API_BASE_URL}/projects`);
    return res.json();
  },

  getProject: async (slug) => {
    const res = await fetch(`${API_BASE_URL}/projects/${slug}`);
    return res.json();
  },

  saveProject: async (projectData) => {
    const res = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(projectData)
    });
    return res.json();
  },

  deleteProject: async (slug) => {
    const res = await fetch(`${API_BASE_URL}/projects/${slug}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  // Profile
  updateProfile: async (profileData) => {
    const res = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData)
    });
    return res.json();
  },

  updateGeneral: async (generalData) => {
    const res = await fetch(`${API_BASE_URL}/general`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(generalData)
    });
    return res.json();
  },

  // Contributors
  getContributors: async () => {
    const res = await fetch(`${API_BASE_URL}/contributors`);
    return res.json();
  },

  getUser: async (username) => {
    const res = await fetch(`${API_BASE_URL}/users/${username}`);
    return res.json();
  },

  // Uploads
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('codefolio_token');
    
    const res = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: formData
    });
    return res.json();
  },

  uploadMultiple: async (files) => {
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('files', file));
    const token = localStorage.getItem('codefolio_token');

    const res = await fetch(`${API_BASE_URL}/upload-multiple`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: formData
    });
    return res.json();
  },

  // Showcases
  getShowcases: async () => {
    const res = await fetch(`${API_BASE_URL}/showcases`);
    return res.json();
  },

  createShowcase: async (showcaseData) => {
    const res = await fetch(`${API_BASE_URL}/showcases`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(showcaseData)
    });
    return res.json();
  },
  
  deleteShowcase: async (id) => {
    const res = await fetch(`${API_BASE_URL}/showcases/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  }
};
