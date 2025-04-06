import sendRequest from '../utilities/send-request';

const BASE_URL = '/api/projects/'; // Relative path, not full URL

export function saveProject(projectData) {
  return sendRequest(BASE_URL, 'POST', projectData);
}

export function getProjects() {
  return sendRequest(BASE_URL, 'GET');
}

export function getProject(id) {
  return sendRequest(`${BASE_URL}${id}`, 'GET');
}

export function updateProject(id, projectData) {
  return sendRequest(`${BASE_URL}${id}`, 'PUT', projectData);
}

export function deleteProject(id) {
  return sendRequest(`${BASE_URL}${id}`, 'DELETE');
}