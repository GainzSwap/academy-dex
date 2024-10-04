import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const axiosInstance = axios.create({
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  baseURL: "/api",
});

async function _tryCatchRequest<T>(
  params:
    | {
        method: "POST";
        url: string;
        data: any;
      }
    | {
        method: "GET";
        url: string;
      },
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<T>> {
  try {
    switch (params.method) {
      case "POST":
        return await axiosInstance.post(params.url, params.data, config);
      case "GET":
        return await axiosInstance.get(params.url, config);
      default:
        throw "Method not set yet";
    }
  } catch (error: any) {
    throw error;
  }
}

const axiosProvider = {
  async post<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return _tryCatchRequest<T>(
      {
        method: "POST",
        data,
        url,
      },
      config,
    );
  },

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return _tryCatchRequest<T>(
      {
        method: "GET",
        url,
      },
      config,
    );
  },
};

export default axiosProvider;
