import { useState } from "react";
import { useSelector } from "react-redux";
import { API_BASE_URL } from "../config/serviceApiConfig";

/**
 * A custom hook to handle all API requests.
 * It automatically manages loading/error states and adds the auth token.
 * @returns {{isLoading: boolean, error: string|null, request: function}}
 */
export const useApi = () => {
  // 1. Automatically gets the token from Redux
  const token = useSelector((state) => state.auth.token);

  // 2. Manages loading and error state internally
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * The main function to make an API request.
   * @param {string} endpoint - The API endpoint (e.g., "/task/createTask")
   * @param {string} [method="GET"] - The HTTP method (e.g., "POST", "GET")
   * @param {object|null} [body=null] - The JSON body for POST/PUT requests
   * @returns {Promise<any>} - A promise that resolves with the JSON data
   */
  const request = async (endpoint, method = "GET", body = null) => {
    setIsLoading(true);
    setError(null);

    try {
      // 3. Automatically builds headers
      const headers = { Authorization: `Bearer ${token}` };
      const options = { method, headers };

      // 4. Automatically handles JSON body
      if (body) {
        headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      const data = await response.json();

      // 5. Centralized error handling
      if (!response.ok) {
        throw new Error(data.message || "An unexpected error occurred");
      }
      
      return data; // On success, just return the data

    } catch (err) {
      setError(err.message);
      throw err; // Re-throw so the component can also catch it
    } finally {
      setIsLoading(false); // 6. Always stop loading
    }
  };

  // 7. Expose the tools to the component
  return { isLoading, error, request };
};