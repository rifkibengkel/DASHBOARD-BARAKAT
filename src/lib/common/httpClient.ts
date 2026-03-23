import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

interface CreateHttpClientOptions {
    baseURL?: string;
    token?: string;
    headers?: Record<string, string>;
    timeout?: number;
}

/**
 * Create a new HTTP client with optional token, headers, and timeout.
 * You can reuse it for any external API
 */
export function createHttpClient(options: CreateHttpClientOptions = {}): AxiosInstance {
    const { baseURL, token, headers, timeout = 8000 } = options;

    const client = axios.create({
        baseURL,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: token } : {}),
            ...headers,
        },
        timeout,
    });

    client.interceptors.response.use(
        (response) => response,
        (error) => {
            const status = error.response?.status || 500;
            const message =
                status === 401
                    ? 'Unauthorized'
                    : status === 403
                    ? 'Forbidden'
                    : status === 404
                    ? 'Resource not found'
                    : status === 400
                    ? 'Bad Request'
                    : 'Network or server error';
            return Promise.reject({
                status,
                message: error.response?.data?.message ? error.response.data.message : message,
            });
        }
    );

    return client;
}

/**
 * Shorthand for one-off GET requests.
 * Ideal when you want to provide full URL and headers directly.
 */
export async function httpGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const { data }: AxiosResponse<T> = await axios.get(url, config);
    return data;
}

/**
 * Shorthand for one-off POST requests.
 */
export async function httpPost<T>(url: string, payload: unknown, config?: AxiosRequestConfig): Promise<T> {
    const { data }: AxiosResponse<T> = await axios.post(url, payload, config);
    return data;
}
