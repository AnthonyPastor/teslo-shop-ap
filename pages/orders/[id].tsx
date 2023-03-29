import { GetServerSideProps, NextPage } from "next";
import { PayPalButtons } from "@paypal/react-paypal-js";

import {
	Box,
	Card,
	CardContent,
	Divider,
	Grid,
	Typography,
	Chip,
	CircularProgress,
	Button,
} from "@mui/material";
import {
	CreditCardOffOutlined,
	CreditScoreOutlined,
} from "@mui/icons-material";

import { ShopLayout } from "../../components/layouts/ShopLayout";
import { CartList, OrderSummary } from "../../components/cart";
import { IOrder } from "../../interfaces";
import { tesloApi } from "../../api";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { jwt } from "../../utils";
import { ApiResponse } from "../../interfaces/apiResponse";
import Cookies from "js-cookie";
import { FullScreenLoading } from "../../components/ui/FullScreenLoading";

export type OrderResponseBody = {
	id: string;
	status:
		| "COMPLETED"
		| "SAVED"
		| "APPROVED"
		| "VOIDED"
		| "PAYER_ACTION_REQUIRED";
};

const OrderPage = () => {
	const router = useRouter();
	const { id } = router.query;

	const [isPaying, setIsPaying] = useState(false);

	const [order, setOrder] = useState<IOrder>();

	// TODO: Replace with SSR when upgrade to Paid Hosting
	useEffect(() => {
		if (!Cookies.get("token")) {
			router.push(`/auth/login?p=/orders/${id}`);
		} else {
			const getOrder = async () => {
				const { data } = await tesloApi.get(`order/id/${id?.toString()}`, {
					headers: { Authorization: `Bearer ${Cookies.get("token")}` },
				});

				const order = data.data;

				if (!order) {
					router.push("/orders/history");
				} else {
					const { user } = await jwt.isValidToken(Cookies.get("token") || "");

					if (!user || order.user !== user._id) {
						router.push("/orders/history");
					} else {
						setOrder(order);
					}
				}
			};

			getOrder();
		}
	}, [id]);

	if (!order) return <FullScreenLoading />;

	const { shippingAddress } = order;

	const onOrderCompleted = async () => {
		setIsPaying(true);

		try {
			const { data } = await tesloApi.post<ApiResponse<string>>(
				`order/pay`,
				{
					orderId: order._id,
				},
				{ headers: { Authorization: `Bearer ${Cookies.get("token")}` } }
			);

			setIsPaying(false);

			if (data.success) router.reload();
			else alert(data.message);
		} catch (error) {
			setIsPaying(false);
		}
	};

	return (
		<ShopLayout
			title='Resumen de la orden'
			pageDescription={"Resumen de la orden"}
		>
			<Typography variant='h1' component='h1'>
				Orden: {order._id}
			</Typography>

			{order.isPaid ? (
				<Chip
					sx={{ my: 2 }}
					label='Orden ya fue pagada'
					variant='outlined'
					color='success'
					icon={<CreditScoreOutlined />}
				/>
			) : (
				<Chip
					sx={{ my: 2 }}
					label='Pendiente de pago'
					variant='outlined'
					color='error'
					icon={<CreditCardOffOutlined />}
				/>
			)}

			<Grid container className='fadeIn'>
				<Grid item xs={12} sm={7}>
					<CartList products={order.orderItems} />
				</Grid>
				<Grid item xs={12} sm={5}>
					<Card className='summary-card'>
						<CardContent>
							<Typography variant='h2'>
								Resumen ({order.numberOfItems}{" "}
								{order.numberOfItems > 1 ? "productos" : "producto"})
							</Typography>
							<Divider sx={{ my: 1 }} />

							<Box display='flex' justifyContent='space-between'>
								<Typography variant='subtitle1'>
									Dirección de entrega
								</Typography>
							</Box>

							<Typography>
								{shippingAddress.firstName} {shippingAddress.lastName}
							</Typography>
							<Typography>
								{shippingAddress.address}{" "}
								{shippingAddress.address2
									? `, ${shippingAddress.address2}`
									: ""}
							</Typography>
							<Typography>
								{shippingAddress.city}, {shippingAddress.zip}
							</Typography>
							<Typography>{shippingAddress.country}</Typography>
							<Typography>{shippingAddress.phone}</Typography>

							<Divider sx={{ my: 1 }} />

							<OrderSummary
								orderValues={{
									numberOfItems: order.numberOfItems,
									subTotal: order.subTotal,
									total: order.total,
									tax: order.tax,
								}}
							/>

							<Box sx={{ mt: 3 }} display='flex' flexDirection='column'>
								<Box
									justifyContent='center'
									className='fadeIn'
									sx={{ display: isPaying ? "flex" : "none" }}
								>
									<CircularProgress />
								</Box>

								<Box
									justifyContent='center'
									className='fadeIn'
									flexDirection='column'
									sx={{ display: isPaying ? "none" : "flex", flex: 1 }}
								>
									{order.isPaid ? (
										<Chip
											sx={{ my: 2 }}
											label='Orden ya fue pagada'
											variant='outlined'
											color='success'
											icon={<CreditScoreOutlined />}
										/>
									) : (
										<Button onClick={onOrderCompleted}>Fake Pay</Button>
									)}
								</Box>
							</Box>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</ShopLayout>
	);
};

// You should use getServerSideProps when:
// - Only if you need to pre-render a page whose data must be fetched at request time

// export const getServerSideProps: GetServerSideProps = async ({
// 	req,
// 	query,
// }) => {
// 	const { id = "" } = query;
// 	const token = req.cookies["token"];

// 	if (!token) {
// 		return {
// 			redirect: {
// 				destination: `/auth/login?p=/orders/${id}`,
// 				permanent: false,
// 			},
// 		};
// 	}

// 	try {
// 		const { data } = await tesloApi.get(`order/id/${id.toString()}`, {
// 			headers: { Authorization: `Bearer ${token}` },
// 		});

// 		const order = data.data;

// 		if (!order) {
// 			return {
// 				redirect: {
// 					destination: "/orders/history",
// 					permanent: false,
// 				},
// 			};
// 		}

// 		const { user } = await jwt.isValidToken(token);

// 		if (!user || order.user !== user._id) {
// 			return {
// 				redirect: {
// 					destination: "/orders/history",
// 					permanent: false,
// 				},
// 			};
// 		}

// 		return {
// 			props: {
// 				order,
// 			},
// 		};
// 	} catch (error) {
// 		return {
// 			redirect: {
// 				destination: `/auth/login?p=/orders/${id}`,
// 				permanent: false,
// 			},
// 		};
// 	}
// };

export default OrderPage;
