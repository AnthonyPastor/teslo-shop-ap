import React from "react";
import NextLink from "next/link";
import useSWR from "swr";
import { DataGrid, GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import { AddOutlined, ConfirmationNumberOutlined } from "@mui/icons-material";

import { Button, CardMedia, Grid, Link } from "@mui/material";
import { IProduct } from "../../../interfaces";
import { AdminLayout } from "../../../components/layouts";
import { Box } from "@mui/system";
import { ApiResponse } from "../../../interfaces/apiResponse";

const columns: GridColDef[] = [
	{
		field: "img",
		headerName: "Foto",
		renderCell: ({ row }: GridValueGetterParams) => {
			return (
				<a
					href={`/product/${row.slug}`}
					target='_blank'
					rel='noreferrer'
					title={row.slug}
				>
					<CardMedia
						component='img'
						className='fadeIn'
						image={row.img}
						alt={row.title}
					/>
				</a>
			);
		},
	},
	{
		field: "title",
		headerName: "Title",
		width: 250,
		renderCell: ({ row }: GridValueGetterParams) => {
			return (
				<NextLink href={`/admin/products/${row.slug}`} passHref>
					<Link underline='always'>{row.title}</Link>
				</NextLink>
			);
		},
	},
	{ field: "gender", headerName: "Género" },
	{ field: "type", headerName: "Tipo" },
	{ field: "inStock", headerName: "Inventario" },
	{ field: "price", headerName: "Precio" },
	{ field: "sizes", headerName: "Tallas", width: 250 },
];

const ProductsPage = () => {
	const { data, error } = useSWR<ApiResponse<IProduct[]>>(
		`${process.env.NEXT_PUBLIC_API_URL}/admin/products`
	);

	if (!data && !error) return <></>;

	const rows = data!.data.map((product) => ({
		id: product._id,
		img: product.images[0],
		title: product.title,
		gender: product.gender,
		type: product.type,
		inStock: product.inStock,
		price: product.price,
		sizes: product.sizes.join(", "),
		slug: product.slug,
	}));

	return (
		<AdminLayout
			title={`Productos (${data?.data.length} )`}
			subtitle='Mantenimiento de productos'
			icon={<ConfirmationNumberOutlined />}
		>
			<Box display='flex' justifyContent='end' sx={{ mb: 2 }}>
				<Button
					startIcon={<AddOutlined />}
					color='secondary'
					href='/admin/products/new'
				>
					Crear producto
				</Button>
			</Box>
			<Grid container className='fadeIn'>
				<Grid item xs={12} sx={{ height: 650, width: "100%" }}>
					<DataGrid
						rows={rows}
						columns={columns}
						pageSize={10}
						rowsPerPageOptions={[10]}
					/>
				</Grid>
			</Grid>
		</AdminLayout>
	);
};

export default ProductsPage;
