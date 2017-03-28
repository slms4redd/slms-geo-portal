// See https://auth0.com/blog/build-an-app-with-vuejs/

import httpRequest from '../httpRequest';

const API_URL = 'http://localhost:3001/';
const LOGIN_URL = API_URL + 'sessions/create/';
// const SIGNUP_URL = API_URL + 'users/';

export default {
  // User object will let us check authentication status
  user: { authenticated: false },

  login(creds, redirect) {
    return httpRequest('POST', LOGIN_URL, JSON.stringify(creds), [['Content-Type', 'application/json']])
    .then(res => {
      const data = JSON.parse(res);
      localStorage.setItem('id_token', data.id_token);
      this.user.authenticated = true;
      return Promise.resolve(this.user);
    }).catch(err => Promise.reject(err));
  },

  // To log out, we just need to remove the token
  logout() {
    localStorage.removeItem('id_token');
    this.user.authenticated = false;
  },

  checkAuth() {
    const jwt = localStorage.getItem('id_token');
    this.user.authenticated = !!jwt;
  },

  // The object to be passed as a header for authenticated requests
  getAuthHeader() {
    return { 'Authorization': `Bearer ${localStorage.getItem('id_token')}` };
  }
};
