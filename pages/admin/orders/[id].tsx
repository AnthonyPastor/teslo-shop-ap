import { GetServerSideProps, NextPage } from "next";
import {
	Box,
	Card,
	CardContent,
	Divider,
	Grid,
	Typography,
	Chip,
} from "@mui/material";
import {
	AirplaneTicketOutlined,
	CreditCardOffOutlined,
	CreditScoreOutlined,
} from "@mui/icons-material";

import { IOrder } from "../../../interfaces";
import { AdminLayout } from "../../../components/layouts";
import { CartList, OrderSummary } from "../../../components/cart";
import { tesloApi } from "../../../api";
import { jwt } from "../../../utils";

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
	const { shippingAddress } = order;

	return (
		<AdminLayout
			title='Resumen de la orden'
			subtitle={`OrdenId: ${order._id}`}
			icon={<AirplaneTicketOutlined />}
		>
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
									flexDirection='column'
									sx={{ display: "flex", flex: 1 }}
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
										<Chip
											sx={{ my: 2 }}
											label='Pendiente de pago'
											variant='outlined'
											color='error'
											icon={<CreditCardOffOutlined />}
										/>
									)}
								</Box>
							</Box>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</AdminLayout>
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
		const order = (await tesloApi.get(`order/${id.toString()}`)).data.data;

		if (!order) {
			return {
				redirect: {
					destination: "/admin/orders",
					permanent: false,
				},
			};
		}
		const { user } = await jwt.isValidToken(token);

		if (!user || order.user._id !== user._id) {
			return {
				redirect: {
					destination: "/admin/orders",
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
		return {
			redirect: {
				destination: "/admin/orders",
				permanent: false,
			},
		};
	}
};

export default OrderPage;
