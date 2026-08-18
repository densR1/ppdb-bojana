import axios from "axios";
import { API_ENDPOINT } from "@/config";
import { clearToken, getToken } from "@/utils/session";

const client = axios.create({ baseURL: API_ENDPOINT });

client.interceptors.request.use((config) => {
  config.headers.Accept = "application/json";

  const token = getToken();
  if (token) {
    config.headers["X-Access-Token"] = token;
  }

  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expired or no longer matches a registration — drop it so the
    // parent lands back on the lookup screen instead of a broken page.
    const status = error.response?.status;

    if ((status === 401 || status === 404) && getToken()) {
      clearToken();
    }

    return Promise.reject(error);
  }
);

export const request = (options) => client(options);

export const errorMessage = (error, fallback = "Something went wrong, please try again") =>
  error?.response?.data?.info ?? fallback;
