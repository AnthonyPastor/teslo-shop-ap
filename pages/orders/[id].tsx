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
import { useState } from "react";
import { jwt } from "../../utils";
import { ApiResponse } from "../../interfaces/apiResponse";
import Cookies from "js-cookie";

export type OrderResponseBody = {
	id: string;
	status:
		| "COMPLETED"
		| "SAVED"
		| "APPROVED"
		| "VOIDED"
		| "PAYER_ACTION_REQUIRED";
};

interface Props {
	order: IOrder;
}

const OrderPage: NextPage<Props> = ({ order }) => {
	const router = useRouter();
	const { shippingAddress } = order;

	const [isPaying, setIsPaying] = useState(false);

	const onOrderCompleted = async () => {
		setIsPaying(true);

		try {
			const { data } = await tesloApi.post<ApiResponse<string>>(
				`order/pay`,
				{
					orderId: order._id,
				}
				// { headers: { Authorization: `Bearer ${Cookies.get("token")}` } }
			);

			setIsPaying(false);

			if (data.success) router.reload();
			else alert(data.message);
		} catch (error) {
			setIsPaying(false);
			console.log(error);
			alert("error");
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

export const getServerSideProps: GetServerSideProps = async ({
	req,
	query,
}) => {
	const { id = "" } = query;
	const token = req.cookies["token"];

	if (!token) {
		return {
			redirect: {
				destination: `/auth/login?p=/orders/${id}`,
				permanent: false,
			},
		};
	}

	try {
		const { data } = await tesloApi.get(`order/id/${id.toString()}`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		const order = data.data;

		if (!order) {
			return {
				redirect: {
					destination: "/orders/history",
					permanent: false,
				},
			};
		}

		console.log(order.user);

		const { user } = await jwt.isValidToken(token);

		if (!user || order.user !== user._id) {
			return {
				redirect: {
					destination: "/orders/history",
					permanent: false,
				},
			};
		}

		return {
			props: {
				order,
			},
		};
	} catch (error) {
		console.error(error);
		return {
			redirect: {
				destination: `/auth/login?p=/orders/${id}`,
				permanent: false,
			},
		};
	}
};

export default OrderPage;
