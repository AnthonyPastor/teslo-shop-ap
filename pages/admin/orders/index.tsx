import React from "react";
import useSWR from "swr";
import { DataGrid, GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import { ConfirmationNumberOutlined } from "@mui/icons-material";

import { Chip, Grid } from "@mui/material";
import { AdminLayout } from "../../../components/layouts";
import { IOrder, IUser } from "../../../interfaces";
import { ApiResponse } from "../../../interfaces/apiResponse";

const OrdersPage = () => {
	const { data, error } = useSWR<ApiResponse<IOrder[]>>(
		`${process.env.NEXT_PUBLIC_API_URL}/admin/orders`
	);

	if (!data && !error) return <></>;

	const columns: GridColDef[] = [
		{ field: "id", headerName: "Order ID", width: 250 },
		{ field: "emial", headerName: "Correo", width: 250 },
		{ field: "name", headerName: "Nombre completo", width: 300 },
		{ field: "total", headerName: "Monto total", width: 300 },
		{
			field: "isPaid",
			headerName: "Pagada",
			width: 300,
			renderCell: ({ row }: GridValueGetterParams) => {
				return row.isPaid ? (
					<Chip variant='outlined' label='Pagada' color='success' />
				) : (
					<Chip variant='outlined' label='Pendiente' color='error' />
				);
			},
		},
		{ field: "noProducts", headerName: "No. Productos", align: "center" },
		{
			field: "check",
			headerName: "Ver orden",
			width: 300,
			renderCell: ({ row }: GridValueGetterParams) => {
				return (
					<a href={`/admin/orders/${row.id}`} target='_blank' rel='noreferrer'>
						Ver orden
					</a>
				);
			},
		},
		{ field: "createdAt", headerName: "Creada en" },
	];

	const rows = data!.data.map((order) => ({
		id: order._id,
		emial: (order.user as IUser).email,
		name: (order.user as IUser).name,
		noProducts: order.numberOfItems,
		total: order.total,
		isPaid: order.isPaid,
		createdAt: order.createdAt,
	}));

	return (
		<AdminLayout
			title='Ordenes'
			subtitle='Mantenimiento de órdenes'
			icon={<ConfirmationNumberOutlined />}
		>
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

export default OrdersPage;
