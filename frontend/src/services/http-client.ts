// HTTP client with interceptors for authentication and error handling

import { ApiError, ApiResponse } from "./types";
import { tokenStorage, clearAuthData, getAuthHeaders } from "./storage";
import {
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
  createDefaultInterceptors,
} from "./interceptors";

// API base URL from environment
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Custom HTTP client class
class HttpClient {
  private baseURL: string;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.setupDefaultInterceptors();
  }

  // Setup default interceptors
  private setupDefaultInterceptors(): void {
    const defaultInterceptors = createDefaultInterceptors();

    // Add default request interceptors
    defaultInterceptors.request.forEach((interceptor) => {
      this.addRequestInterceptor(interceptor);
    });

    // Add default response interceptors
    defaultInterceptors.response.forEach((interceptor) => {
      this.addResponseInterceptor(interceptor);
    });

    // Add default error interceptors
    defaultInterceptors.error.forEach((interceptor) => {
      this.addErrorInterceptor(interceptor);
    });
  }

  // Add request interceptor
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  // Add response interceptor
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  // Add error interceptor
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  // Execute request interceptors
  private async executeRequestInterceptors(
    config: RequestInit
  ): Promise<RequestInit> {
    let currentConfig = config;

    for (const interceptor of this.requestInterceptors) {
      currentConfig = await interceptor(currentConfig);
    }

    return currentConfig;
  }

  // Execute response interceptors
  private async executeResponseInterceptors(
    response: Response
  ): Promise<Response> {
    let currentResponse = response;

    for (const interceptor of this.responseInterceptors) {
      currentResponse = await interceptor(currentResponse);
    }

    return currentResponse;
  }

  // Execute error interceptors
  private async executeErrorInterceptors(error: ApiError): Promise<ApiError> {
    let currentError = error;

    for (const interceptor of this.errorInterceptors) {
      currentError = await interceptor(currentError);
    }

    return currentError;
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    // Default headers
    const headers = new Headers({
      "Content-Type": "application/json",
      ...options.headers,
    });

    // Remove Content-Type for FormData
    if (options.body instanceof FormData) {
      headers.delete("Content-Type");
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: "include", // Include cookies for CORS
    };

    try {
      // Execute request interceptors
      const interceptedConfig = await this.executeRequestInterceptors(config);

      const response = await fetch(url, interceptedConfig);

      // Execute response interceptors
      const interceptedResponse = await this.executeResponseInterceptors(
        response
      );

      // Handle different response types
      let data: any;
      const contentType = interceptedResponse.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await interceptedResponse.json();
      } else {
        data = await interceptedResponse.text();
      }

      // Handle HTTP errors
      if (!interceptedResponse.ok) {
        const error: ApiError = {
          type: this.getErrorType(interceptedResponse.status),
          message:
            data?.message ||
            `HTTP ${interceptedResponse.status}: ${interceptedResponse.statusText}`,
          details: data?.error?.details || data?.message,
          status: interceptedResponse.status,
        };

        // Execute error interceptors
        const interceptedError = await this.executeErrorInterceptors(error);
        throw interceptedError;
      }

      return data;
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        const networkError: ApiError = {
          type: "NETWORK_ERROR",
          message: "Network error: Unable to connect to the server",
          details: "Please check your internet connection and try again.",
        };

        // Execute error interceptors for network errors
        const interceptedError = await this.executeErrorInterceptors(
          networkError
        );
        throw interceptedError;
      }

      // Re-throw API errors (already processed by error interceptors)
      if (error && typeof error === "object" && "type" in error) {
        throw error;
      }

      // Handle unexpected errors
      const unexpectedError: ApiError = {
        type: "SERVER_ERROR",
        message: "An unexpected error occurred",
        details: error instanceof Error ? error.message : "Unknown error",
      };

      // Execute error interceptors for unexpected errors
      const interceptedError = await this.executeErrorInterceptors(
        unexpectedError
      );
      throw interceptedError;
    }
  }

  // Helper method to determine error type
  private getErrorType(status: number): ApiError["type"] {
    if (status === 401) return "AUTH_ERROR";
    if (status === 403) return "CORS_ERROR";
    if (status === 422) return "VALIDATION_ERROR";
    if (status >= 500) return "SERVER_ERROR";
    return "SERVER_ERROR";
  }

  // GET request
  async get<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const url = params ? this.buildUrlWithParams(endpoint, params) : endpoint;
    return this.request<T>(url, { method: "GET" });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  // Helper method to build URL with query parameters
  private buildUrlWithParams(
    endpoint: string,
    params: Record<string, any>
  ): string {
    const url = new URL(endpoint, this.baseURL);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item) => url.searchParams.append(key, String(item)));
        } else {
          url.searchParams.append(key, String(value));
        }
      }
    });

    return url.pathname + url.search;
  }

  // Upload file method
  async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append("file", file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    return this.request<T>(endpoint, {
      method: "POST",
      body: formData,
    });
  }

  // Download file method
  async downloadFile(endpoint: string, filename?: string): Promise<void> {
    const config: RequestInit = {
      headers: new Headers(),
      credentials: "include",
    };

    // Execute request interceptors for download
    const interceptedConfig = await this.executeRequestInterceptors(config);

    const response = await fetch(
      `${this.baseURL}${endpoint}`,
      interceptedConfig
    );

    // Execute response interceptors
    const interceptedResponse = await this.executeResponseInterceptors(
      response
    );

    if (!interceptedResponse.ok) {
      const error: ApiError = {
        type: "SERVER_ERROR",
        message: `Download failed: ${interceptedResponse.statusText}`,
        status: interceptedResponse.status,
      };

      const interceptedError = await this.executeErrorInterceptors(error);
      throw new Error(interceptedError.message);
    }

    const blob = await interceptedResponse.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "download";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

// Create and export HTTP client instance
export const httpClient = new HttpClient(API_BASE_URL);

// Export the class for testing purposes
export { HttpClient };
