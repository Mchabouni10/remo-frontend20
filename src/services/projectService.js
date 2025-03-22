// src/services/projectService.js
import sendRequest from '../utilities/send-request';

const BASE_URL = '/api/projects/';

// Create a new project
export function saveProject(projectData) {
  return sendRequest(BASE_URL, 'POST', projectData);
}

// Get all projects for the authenticated user
export function getProjects() {
  return sendRequest(BASE_URL, 'GET');
}

// Get a specific project by ID
export function getProject(id) {
  return sendRequest(`${BASE_URL}${id}`, 'GET');
}

// Update an existing project
export function updateProject(id, projectData) {
  return sendRequest(`${BASE_URL}${id}`, 'PUT', projectData);
}

// Delete a project
export function deleteProject(id) {
  return sendRequest(`${BASE_URL}${id}`, 'DELETE');
}