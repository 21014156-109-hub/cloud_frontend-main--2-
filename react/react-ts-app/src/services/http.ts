import axios from 'axios';
import { BASE_LOGIN_URL } from './config';

const http = axios.create({
  baseURL: BASE_LOGIN_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default http;
