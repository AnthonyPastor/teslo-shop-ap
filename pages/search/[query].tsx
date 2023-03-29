import type { NextPage, GetServerSideProps } from "next";
import { Typography, Box } from "@mui/material";

import { ShopLayout } from "../../components/layouts";

import { ProductList } from "../../components/products";

import { IProduct } from "../../interfaces";
import { tesloApi } from "../../api";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const SearchPage = () => {
	const router = useRouter();

	const { query = "" } = router.query;

	const [products, setProducts] = useState<IProduct[]>([]);
	const [foundProducts, setFoundProducts] = useState(false);

	useEffect(() => {
		if (query.length === 0) {
			router.replace("/");
		} else {
			// y no hay productos

			const getProducts = async () => {
				let { data } = await tesloApi.get(`/product/search/${query}`);
				let products = data?.data || [];
				const foundProducts = products.length > 0;

				// TODO: retornar otros productos
				if (!foundProducts) {
					// products = await dbProducts.getAllProducts();
					products = (await tesloApi.get(`/product/search/shirt`)).data.data;
				}

				setProducts(products);
				setFoundProducts(foundProducts);
			};

			getProducts();
		}
	}, [router, query]);

	return (
		<ShopLayout
			title={"Teslo-Shop - Search"}
			pageDescription={"Encuentra los mejores productos de Teslo aquí"}
		>
			<Typography variant='h1' component='h1'>
				Buscar productos
			</Typography>

			{foundProducts ? (
				<Typography variant='h2' sx={{ mb: 1 }} textTransform='capitalize'>
					Término: {query}
				</Typography>
			) : (
				<Box display='flex'>
					<Typography variant='h2' sx={{ mb: 1 }}>
						No encontramos ningún produto
					</Typography>
					<Typography
						variant='h2'
						sx={{ ml: 1 }}
						color='secondary'
						textTransform='capitalize'
					>
						{query}
					</Typography>
				</Box>
			)}

			<ProductList products={products} />
		</ShopLayout>
	);
};

// You should use getServerSideProps when:
// - Only if you need to pre-render a page whose data must be fetched at request time
// export const getServerSideProps: GetServerSideProps = async ({ params }) => {
// 	const { query = "" } = params as { query: string };

// 	if (query.length === 0) {
// 		return {
// 			redirect: {
// 				destination: "/",
// 				permanent: true,
// 			},
// 		};
// 	}

// 	// y no hay productos
// 	let { data } = await tesloApi.get(`/product/search/${query}`);
// 	let products = data?.data || [];
// 	const foundProducts = products.length > 0;

// 	// TODO: retornar otros productos
// 	if (!foundProducts) {
// 		// products = await dbProducts.getAllProducts();
// 		products = (await tesloApi.get(`/product/search/shirt`)).data.data;
// 	}

// 	return {
// 		props: {
// 			products,
// 			foundProducts,
// 			query,
// 		},
// 	};
// };

export default SearchPage;
