import axios from 'axios';

export async function downloadEvents(repositoryUrl) {
  const response = await axios.post('http://localhost:3000/download-events', {
    repositoryUrl
  });
  return response.data;
} 