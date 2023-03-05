export interface DashboardSummaryResponse {
	numberOfOrder: number;
	paidOrders: number;
	notPaidOrders: number;
	numberOfClients: number;
	numberOfProducts: number;
	productsWithNoInventory: number;
	productsWithLowInventory: number;
}
