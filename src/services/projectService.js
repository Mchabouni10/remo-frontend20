//src/services/projectService.js
import sendRequest from '../utilities/send-request';

const BASE_URL = '/api/projects/'; // Relative path, not full URL

export async function saveProject(projectData) {
  console.log('saveProject called with data:', JSON.stringify(projectData, null, 2));
  try {
    const response = await sendRequest(BASE_URL, 'POST', projectData);
    console.log('saveProject response:', JSON.stringify(response, null, 2));
    return response;
  } catch (err) {
    console.error('saveProject error:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
    });
    throw err;
  }
}

export async function getProjects() {
  console.log('getProjects called');
  try {
    const response = await sendRequest(BASE_URL, 'GET');
    console.log('getProjects response:', response.length, 'projects');
    return response;
  } catch (err) {
    console.error('getProjects error:', err.message);
    throw err;
  }
}

export async function getProject(id) {
  console.log('getProject called with id:', id);
  try {
    const response = await sendRequest(`${BASE_URL}${id}`, 'GET');
    console.log('getProject response:', JSON.stringify(response, null, 2));
    return response;
  } catch (err) {
    console.error('getProject error:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
    });
    throw err;
  }
}

export async function updateProject(id, projectData) {
  console.log('updateProject called with id:', id, 'data:', JSON.stringify(projectData, null, 2));
  try {
    const response = await sendRequest(`${BASE_URL}${id}`, 'PUT', projectData);
    console.log('updateProject response:', JSON.stringify(response, null, 2));
    return response;
  } catch (err) {
    console.error('updateProject error:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
    });
    throw err;
  }
}

export async function deleteProject(id) {
  console.log('deleteProject called with id:', id);
  try {
    const response = await sendRequest(`${BASE_URL}${id}`, 'DELETE');
    console.log('deleteProject response:', response);
    return response;
  } catch (err) {
    console.error('deleteProject error:', err.message);
    throw err;
  }
}