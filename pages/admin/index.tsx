import React, { useEffect, useState } from "react";
import useSWR from "swr";
import {
	AccessTimeOutlined,
	AttachMoneyOutlined,
	CancelPresentationOutlined,
	CategoryOutlined,
	CreditCardOffOutlined,
	CreditCardOutlined,
	DashboardOutlined,
	GroupOutlined,
	ProductionQuantityLimitsOutlined,
} from "@mui/icons-material";

import { AdminLayout } from "../../components/layouts";
import { Grid, Typography } from "@mui/material";
import { SummaryTitle } from "../../components/admin";
import { DashboardSummaryResponse } from "../../interfaces";
import { ApiResponse } from "../../interfaces/apiResponse";

const DashboardPage = () => {
	const { data, error } = useSWR<ApiResponse<DashboardSummaryResponse>>(
		`${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard`,
		{
			refreshInterval: 30 * 1000,
		}
	);

	const [refreshIn, setRefreshIn] = useState(30);

	useEffect(() => {
		const interval = setInterval(() => {
			setRefreshIn((refreshIn) => (refreshIn > 0 ? refreshIn - 1 : 30));
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	if (!error && !data) {
		return <></>;
	}

	if (error) {
		return <Typography>Error al cargar la información</Typography>;
	}

	const {
		numberOfOrder,
		paidOrders,
		notPaidOrders,
		numberOfClients,
		numberOfProducts,
		productsWithNoInventory,
		productsWithLowInventory,
	} = data!.data;

	return (
		<AdminLayout
			title='Dashboard'
			subtitle='Estadisticas generales'
			icon={<DashboardOutlined />}
		>
			<Grid container spacing={2}>
				<SummaryTitle
					title={numberOfOrder}
					subtitle='Órdenes totales'
					icon={
						<CreditCardOutlined
							color='secondary'
							sx={{ fontSize: 40 }}
						></CreditCardOutlined>
					}
				/>
				<SummaryTitle
					title={paidOrders}
					subtitle='Órdenes pagadas'
					icon={
						<AttachMoneyOutlined
							color='secondary'
							sx={{ fontSize: 40 }}
						></AttachMoneyOutlined>
					}
				/>
				<SummaryTitle
					title={notPaidOrders}
					subtitle='Órdenes pendientes'
					icon={
						<CreditCardOffOutlined
							color='secondary'
							sx={{ fontSize: 40 }}
						></CreditCardOffOutlined>
					}
				/>
				<SummaryTitle
					title={numberOfClients}
					subtitle='Clientes'
					icon={
						<GroupOutlined
							color='secondary'
							sx={{ fontSize: 40 }}
						></GroupOutlined>
					}
				/>
				<SummaryTitle
					title={numberOfProducts}
					subtitle='Productos'
					icon={
						<CategoryOutlined
							color='warning'
							sx={{ fontSize: 40 }}
						></CategoryOutlined>
					}
				/>
				<SummaryTitle
					title={productsWithNoInventory}
					subtitle='Sin Existencias'
					icon={
						<CancelPresentationOutlined
							color='error'
							sx={{ fontSize: 40 }}
						></CancelPresentationOutlined>
					}
				/>
				<SummaryTitle
					title={productsWithLowInventory}
					subtitle='Bajo inventario'
					icon={
						<ProductionQuantityLimitsOutlined
							color='warning'
							sx={{ fontSize: 40 }}
						></ProductionQuantityLimitsOutlined>
					}
				/>
				<SummaryTitle
					title={refreshIn}
					subtitle='Actualización en:'
					icon={
						<AccessTimeOutlined
							color='secondary'
							sx={{ fontSize: 40 }}
						></AccessTimeOutlined>
					}
				/>
			</Grid>
		</AdminLayout>
	);
};

export default DashboardPage;
