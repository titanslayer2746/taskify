// Examples and usage patterns for HTTP interceptors

import { httpClient } from "./http-client";
import {
  authRequestInterceptor,
  loggingRequestInterceptor,
  errorNotificationInterceptor,
  createDefaultInterceptors,
  isTokenExpired,
} from "./interceptors";

// Example 1: Adding custom interceptors to the HTTP client
export const setupCustomInterceptors = () => {
  // Add custom request interceptor for analytics
  httpClient.addRequestInterceptor((config) => {
    // Add analytics tracking
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "api_request", {
        method: config.method || "GET",
        url: config.url || "Unknown",
      });
    }
    return config;
  });

  // Add custom response interceptor for caching
  httpClient.addResponseInterceptor(async (response) => {
    if (
      response.ok &&
      response.headers.get("cache-control")?.includes("public")
    ) {
      const url = response.url;
      const data = await response.clone().json();

      // Cache successful responses
      if (typeof window !== "undefined" && window.caches) {
        const cache = await window.caches.open("api-cache");
        await cache.put(url, new Response(JSON.stringify(data)));
      }
    }
    return response;
  });

  // Add custom error interceptor for retry logic
  httpClient.addErrorInterceptor(async (error) => {
    if (error.type === "NETWORK_ERROR") {
      // Implement exponential backoff retry
      console.log("Retrying request due to network error...");
      // You can implement retry logic here
    }
    return error;
  });
};

// Example 2: Token refresh interceptor
export const setupTokenRefreshInterceptor = () => {
  httpClient.addRequestInterceptor(async (config) => {
    const token = localStorage.getItem("habitty_token");

    if (token && isTokenExpired(token)) {
      try {
        // Attempt to refresh the token
        const refreshToken = localStorage.getItem("habitty_refresh_token");
        if (refreshToken) {
          const response = await fetch("/api/users/refresh-token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
          });

          if (response.ok) {
            const { token: newToken } = await response.json();
            localStorage.setItem("habitty_token", newToken);

            // Update the request with the new token
            const headers = new Headers(config.headers);
            headers.set("Authorization", `Bearer ${newToken}`);

            return {
              ...config,
              headers,
            };
          }
        }
      } catch (error) {
        console.error("Token refresh failed:", error);
        // Clear auth data and redirect to login
        localStorage.clear();
        window.location.href = "/signin";
      }
    }

    return config;
  });
};

// Example 3: Request/Response timing interceptor
export const setupTimingInterceptor = () => {
  const requestTimings = new Map<string, number>();

  httpClient.addRequestInterceptor((config) => {
    const requestId = `${config.method}-${config.url}-${Date.now()}`;
    requestTimings.set(requestId, Date.now());

    // Add request ID to headers for tracking
    const headers = new Headers(config.headers);
    headers.set("X-Request-ID", requestId);

    return {
      ...config,
      headers,
    };
  });

  httpClient.addResponseInterceptor((response) => {
    const requestId = response.headers.get("X-Request-ID");
    if (requestId && requestTimings.has(requestId)) {
      const startTime = requestTimings.get(requestId)!;
      const duration = Date.now() - startTime;

      console.log(`Request ${requestId} took ${duration}ms`);
      requestTimings.delete(requestId);

      // Log slow requests
      if (duration > 5000) {
        console.warn(`Slow request detected: ${duration}ms`);
      }
    }

    return response;
  });
};

// Example 4: Offline support interceptor
export const setupOfflineInterceptor = () => {
  const offlineQueue: Array<{
    config: RequestInit;
    url: string;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  httpClient.addRequestInterceptor(async (config) => {
    if (!navigator.onLine) {
      // Store request for later execution
      return new Promise((resolve, reject) => {
        offlineQueue.push({
          config,
          url: config.url as string,
          resolve,
          reject,
        });
      });
    }

    return config;
  });

  // Process offline queue when back online
  window.addEventListener("online", async () => {
    console.log("Processing offline queue...");

    while (offlineQueue.length > 0) {
      const request = offlineQueue.shift()!;
      try {
        const response = await fetch(request.url, request.config);
        request.resolve(response);
      } catch (error) {
        request.reject(error);
      }
    }
  });
};

// Example 5: Custom authentication interceptor
export const setupCustomAuthInterceptor = () => {
  httpClient.addRequestInterceptor((config) => {
    // Add custom auth headers
    const headers = new Headers(config.headers);

    // Add API key for external services
    if (config.url?.includes("external-api")) {
      headers.set("X-API-Key", import.meta.env.VITE_EXTERNAL_API_KEY || "");
    }

    // Add user agent
    headers.set("User-Agent", "Habitty-Web-App/1.0.0");

    // Add request timestamp
    headers.set("X-Request-Timestamp", Date.now().toString());

    return {
      ...config,
      headers,
    };
  });
};

// Example 6: Response transformation interceptor
export const setupResponseTransformInterceptor = () => {
  httpClient.addResponseInterceptor(async (response) => {
    // Transform response data
    if (response.ok) {
      const contentType = response.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        const data = await response.clone().json();

        // Transform dates to local timezone
        const transformedData = transformDates(data);

        // Create new response with transformed data
        return new Response(JSON.stringify(transformedData), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      }
    }

    return response;
  });
};

// Helper function to transform dates
const transformDates = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === "string") {
    // Check if it's a date string
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
    if (dateRegex.test(obj)) {
      return new Date(obj).toLocaleString();
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(transformDates);
  }

  if (typeof obj === "object") {
    const transformed: any = {};
    for (const [key, value] of Object.entries(obj)) {
      transformed[key] = transformDates(value);
    }
    return transformed;
  }

  return obj;
};

// Example 7: Error categorization interceptor
export const setupErrorCategorizationInterceptor = () => {
  httpClient.addErrorInterceptor((error) => {
    // Categorize errors for better handling
    let category = "unknown";

    switch (error.type) {
      case "NETWORK_ERROR":
        category = "connectivity";
        break;
      case "AUTH_ERROR":
        category = "authentication";
        break;
      case "VALIDATION_ERROR":
        category = "input";
        break;
      case "SERVER_ERROR":
        category = "server";
        break;
      case "CORS_ERROR":
        category = "permission";
        break;
    }

    // Add category to error object
    return {
      ...error,
      category,
      timestamp: new Date().toISOString(),
    };
  });
};

// Example 8: Request deduplication interceptor
export const setupRequestDeduplicationInterceptor = () => {
  const pendingRequests = new Map<string, Promise<any>>();

  httpClient.addRequestInterceptor((config) => {
    const requestKey = `${config.method}-${config.url}-${JSON.stringify(
      config.body
    )}`;

    // Check if same request is already pending
    if (pendingRequests.has(requestKey)) {
      console.log("Deduplicating request:", requestKey);
      return pendingRequests.get(requestKey)!;
    }

    // Store the request promise
    const requestPromise = fetch(config.url as string, config);
    pendingRequests.set(requestKey, requestPromise);

    // Clean up when request completes
    requestPromise.finally(() => {
      pendingRequests.delete(requestKey);
    });

    return config;
  });
};
