import NextLink from "next/link";
import { GetServerSideProps, NextPage } from "next";

import { Typography, Grid, Chip, Link } from "@mui/material";
import { DataGrid, GridColDef, GridValueGetterParams } from "@mui/x-data-grid";

import { ShopLayout } from "../../components/layouts";
import { IOrder } from "../../interfaces";
import { tesloApi } from "../../api";
import { jwt } from "../../utils";
import { ApiResponse } from "../../interfaces/apiResponse";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { FullScreenLoading } from "../../components/ui/FullScreenLoading";

const columns: GridColDef[] = [
	{ field: "id", headerName: "ID", width: 100 },
	{ field: "fullname", headerName: "Nombre Completo", width: 300 },

	{
		field: "paid",
		headerName: "Pagada",
		description: "Muestra información si está pagada la orden o no",
		width: 200,
		renderCell: (params: GridValueGetterParams) => {
			return params.row.paid ? (
				<Chip color='success' label='Pagada' variant='outlined' />
			) : (
				<Chip color='error' label='No pagada' variant='outlined' />
			);
		},
	},
	{
		field: "orden",
		headerName: "Ver orden",
		width: 200,
		sortable: false,
		renderCell: (params: GridValueGetterParams) => {
			return (
				<NextLink href={`/orders/${params.row.orderId}`} passHref>
					<Link underline='always'>Ver orden</Link>
				</NextLink>
			);
		},
	},
];

const HistoryPage = () => {
	const router = useRouter();
	const [orders, setOrders] = useState<IOrder[]>();

	useEffect(() => {
		const token = Cookies.get("token");

		if (!token) {
			router.push("/auth/login?p=/orders/history");
		} else {
			const getOrders = async () => {
				const { user } = await jwt.isValidToken(token);

				if (!user) router.push("/auth/login?p=/orders/history");
				else {
					const { data } = await tesloApi.get<ApiResponse<IOrder[]>>(
						`order/user/${user._id}`,
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					);

					setOrders(data.data);
				}
			};

			getOrders();
		}
	}, [router]);

	if (!orders) return <FullScreenLoading />;

	const rows = orders.map((order, idx) => ({
		id: idx + 1,
		paid: order.isPaid,
		fullname: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
		orderId: order._id,
	}));

	return (
		<ShopLayout
			title={"Historial de ordenes"}
			pageDescription={"Historial de ordenes del cliente"}
		>
			<Typography variant='h1' component='h1'>
				Historial de ordenes
			</Typography>

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
		</ShopLayout>
	);
};

// You should use getServerSideProps when:
// - Only if you need to pre-render a page whose data must be fetched at request time

// export const getServerSideProps: GetServerSideProps = async ({ req }) => {
// 	const token = req.cookies["token"];

// 	if (!token) {
// 		return {
// 			redirect: {
// 				destination: "/auth/login?p=/orders/history",
// 				permanent: false,
// 			},
// 		};
// 	}

// 	const { user } = await jwt.isValidToken(token);

// 	if (!user)
// 		return {
// 			redirect: {
// 				destination: "/auth/login?p=/orders/history",
// 				permanent: false,
// 			},
// 		};
// 	const { data } = await tesloApi.get<ApiResponse<IOrder[]>>(
// 		`order/user/${user._id}`,
// 		{
// 			headers: { Authorization: `Bearer ${token}` },
// 		}
// 	);

// 	return {
// 		props: {
// 			orders: data.data,
// 		},
// 	};
// };

export default HistoryPage;
