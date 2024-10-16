import axiosProvider from "~~/services/axiosProvider";

export const swrFetcher = <T>(url: string) => axiosProvider.get<T>(url).then(res => res.data);

