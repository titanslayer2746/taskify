// Authentication interceptors and utility functions

import { ApiError } from "./types";
import { tokenStorage, clearAuthData, getAuthHeaders } from "./storage";

// Request interceptor types
export interface RequestInterceptor {
  (config: RequestInit): RequestInit | Promise<RequestInit>;
}

export interface ResponseInterceptor {
  (response: Response): Response | Promise<Response>;
}

export interface ErrorInterceptor {
  (error: ApiError): ApiError | Promise<ApiError>;
}

// Authentication request interceptor
const authRequestInterceptor: RequestInterceptor = (config) => {
  const authHeaders = getAuthHeaders();
  const headers = new Headers(config.headers);

  // Add authentication headers
  Object.entries(authHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return {
    ...config,
    headers,
  };
};

// Token refresh request interceptor
const tokenRefreshInterceptor: RequestInterceptor = async (config) => {
  // Check if token is about to expire (you can implement token expiration check here)
  const token = tokenStorage.getToken();

  if (token) {
    // You can add token refresh logic here
    // For example, check if token is expired and refresh it
    // const isExpired = checkTokenExpiration(token);
    // if (isExpired) {
    //   await refreshToken();
    // }
  }

  return config;
};

// Logging request interceptor
const loggingRequestInterceptor: RequestInterceptor = (config) => {
  if (import.meta.env.DEV) {
    console.log("🚀 API Request:", {
      method: config.method || "GET",
      url: config.url || "Unknown",
      headers: config.headers,
      body: config.body,
    });
  }
  return config;
};

// Authentication response interceptor
const authResponseInterceptor: ResponseInterceptor = (response) => {
  // Handle 401 Unauthorized responses
  if (response.status === 401) {
    // Don't automatically clear auth data on 401 - let the auth context handle it
    console.warn("🔐 Authentication expired. Let auth context handle logout.");

    // You can add redirect logic here
    // window.location.href = '/signin';
  }

  // Handle 403 Forbidden responses
  if (response.status === 403) {
    console.warn("🚫 Access forbidden. Insufficient permissions.");
  }

  return response;
};

// Logging response interceptor
const loggingResponseInterceptor: ResponseInterceptor = async (
  response
) => {
  if (import.meta.env.DEV) {
    const clonedResponse = response.clone();
    let responseData;

    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        responseData = await clonedResponse.json();
      } else {
        responseData = await clonedResponse.text();
      }
    } catch (error) {
      responseData = "Unable to parse response";
    }

    console.log("📥 API Response:", {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: responseData,
    });
  }

  return response;
};

// Rate limiting response interceptor
const rateLimitResponseInterceptor: ResponseInterceptor = (response) => {
  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After");
    console.warn(`⏰ Rate limited. Retry after: ${retryAfter} seconds`);

    // You can implement retry logic here
    // setTimeout(() => retryRequest(), parseInt(retryAfter || '60') * 1000);
  }

  return response;
};

// Error logging interceptor
const errorLoggingInterceptor: ErrorInterceptor = (error) => {
  console.error("❌ API Error:", {
    type: error.type,
    message: error.message,
    details: error.details,
    status: error.status,
    timestamp: new Date().toISOString(),
  });

  return error;
};

// Error notification interceptor
const errorNotificationInterceptor: ErrorInterceptor = (error) => {
  // You can integrate with a notification system here
  // For example, show toast notifications for certain error types

  switch (error.type) {
    case "NETWORK_ERROR":
      // Show network error notification
      console.warn("🌐 Network error detected");
      break;
    case "AUTH_ERROR":
      // Show authentication error notification
      console.warn("🔐 Authentication error detected");
      break;
    case "VALIDATION_ERROR":
      // Show validation error notification
      console.warn("📝 Validation error detected");
      break;
    case "SERVER_ERROR":
      // Show server error notification
      console.warn("🖥️ Server error detected");
      break;
    case "CORS_ERROR":
      // Show CORS error notification
      console.warn("🌍 CORS error detected");
      break;
  }

  return error;
};

// Retry interceptor for network errors
const retryErrorInterceptor: ErrorInterceptor = async (error) => {
  if (error.type === "NETWORK_ERROR") {
    // You can implement retry logic here
    console.log("🔄 Attempting to retry request...");

    // Example retry logic:
    // const maxRetries = 3;
    // const retryDelay = 1000;
    //
    // for (let attempt = 1; attempt <= maxRetries; attempt++) {
    //   try {
    //     await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
    //     // Retry the original request
    //     return await retryOriginalRequest();
    //   } catch (retryError) {
    //     if (attempt === maxRetries) {
    //       throw retryError;
    //     }
    //   }
    // }
  }

  return error;
};

// Default interceptors factory
export const createDefaultInterceptors = () => ({
  request: [
    loggingRequestInterceptor,
    tokenRefreshInterceptor,
    authRequestInterceptor,
  ],
  response: [
    authResponseInterceptor,
    rateLimitResponseInterceptor,
    loggingResponseInterceptor,
  ],
  error: [
    errorLoggingInterceptor,
    errorNotificationInterceptor,
    retryErrorInterceptor,
  ],
});
