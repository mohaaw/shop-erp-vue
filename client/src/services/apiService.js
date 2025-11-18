// src/services/apiService.js
import { useUserStore } from '@/stores/userStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(endpoint, method = 'GET', data = null, customHeaders = {}) {
  const config = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json', // Good practice to specify what client accepts
      ...customHeaders,
    },
  };

  try {
    // Dynamically get userStore instance. This should work if Pinia is initialized.
    const userStore = useUserStore();
    if (userStore && userStore.token) {
      config.headers['Authorization'] = `Bearer ${userStore.token}`;
    }
  } catch (e) {
    console.warn("apiService: Could not access userStore for token (Pinia might not be ready or this is called outside setup context). Token not set for this request if it was expected.");
  }

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(data);
  }

  const fullUrl = `${API_BASE_URL}${endpoint}`;
  console.log(`API Request: ${method} ${fullUrl}`, data ? `Data (preview): ${JSON.stringify(data).substring(0,100)}...` : '');

  let response;
  try {
    response = await fetch(fullUrl, config);

    // Handle 204 No Content explicitly
    if (response.status === 204) {
      console.log(`API Response: 204 No Content for ${method} ${fullUrl}`);
      return { success: true, data: null, status: response.status };
    }

    const contentType = response.headers.get("content-type");
    let responseData;

    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      const responseText = await response.text();
      console.warn(`API Response for ${method} ${fullUrl} was NOT JSON. Status: ${response.status}. Body Preview: ${responseText.substring(0, 200)}...`);
      if (!response.ok) { // If status is not 2xx
        // Construct an error object similar to what a JSON error might look like
        throw new Error(responseText || `Server responded with status ${response.status} and non-JSON content.`);
      }
      // If response.ok but not JSON (e.g. plain text success message)
      responseData = { message: responseText, _raw: responseText };
    }

    // console.log(`API Response: ${response.status} ${response.statusText} for ${method} ${fullUrl}`, `Data (preview): ${JSON.stringify(responseData).substring(0,100)}...`);

    if (!response.ok) {
      // Error message from JSON body or a generic one
      const serverErrorMessage = responseData.message || responseData.error || (typeof responseData === 'string' ? responseData : `Request failed with status ${response.status}`);
      console.error(`API Error (parsed) ${response.status} on ${method} ${fullUrl}:`, serverErrorMessage, responseData);
      throw new Error(serverErrorMessage); // This will be caught by the outer catch
    }
    return { success: true, data: responseData, status: response.status };

  } catch (error) { // Catches network errors (Failed to fetch) OR errors thrown from response handling
    console.error(`API Request/Processing Error on ${method} ${fullUrl}:`, error.message);
    const errorMessage = error.message || 'Failed to fetch. Check network or if the server is running correctly.';
    // Try to get status from the response object if it exists (for HTTP errors not caught by response.ok logic)
    const status = response ? response.status : (error.name === 'TypeError' && error.message.toLowerCase().includes('failed to fetch') ? 503 : 500);
    return { success: false, error: errorMessage, details: error.details || null, status: status };
  }
}

export default {
  get: (endpoint, customHeaders = {}) => request(endpoint, 'GET', null, customHeaders),
  post: (endpoint, data, customHeaders = {}) => request(endpoint, 'POST', data, customHeaders),
  put: (endpoint, data, customHeaders = {}) => request(endpoint, 'PUT', data, customHeaders),
  delete: (endpoint, customHeaders = {}) => request(endpoint, 'DELETE', null, customHeaders),
  patch: (endpoint, data, customHeaders = {}) => request(endpoint, 'PATCH', data, customHeaders),
};

