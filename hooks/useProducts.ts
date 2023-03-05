import useSWR, { SWRConfiguration } from "swr";
import { IProduct } from "../interfaces";

// const fetcher = (...args: [key: string]) => fetch(...args).then(res => res.json());

export const useProducts = (url: string, config: SWRConfiguration = {}) => {
	// const { data, error } = useSWR<IProduct[]>(`/api${ url }`, fetcher, config );

	const { data, error } = useSWR<{ success: boolean; data: IProduct[] }>(
		`${process.env.NEXT_PUBLIC_API_URL}${url}`,
		config
	);

	return {
		products: data?.data || [],
		isLoading: !error && !data,
		isError: error,
	};
};
