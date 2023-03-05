import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import { PeopleOutline } from "@mui/icons-material";
import { Grid, MenuItem, Select } from "@mui/material";

import { AdminLayout } from "../../components/layouts";
import useSWR from "swr";
import { IUser } from "../../interfaces";
import { tesloApi } from "../../api";
import { ApiResponse } from "../../interfaces/apiResponse";

const UserPage = () => {
	const { data, error } = useSWR<ApiResponse<IUser[]>>(
		`${process.env.NEXT_PUBLIC_API_URL}/admin/users`
	);
	const [users, setUsers] = useState<IUser[]>([]);

	useEffect(() => {
		if (data) setUsers(data.data);
	}, [data]);

	if (!data && !error) return <></>;

	const onRoleUpdated = async (userId: string, newRole: string) => {
		const previousUsers = users.map((user) => ({ ...user }));
		const updatedUsers = users.map((user) => ({
			...user,
			role: userId === user._id ? newRole : user.role,
		}));

		setUsers(updatedUsers);
		try {
			await tesloApi.put("/admin/users", { userId, role: newRole });
		} catch (error: any) {
			setUsers(previousUsers);
			alert(error.message);
		}
	};

	const columns: GridColDef[] = [
		{ field: "emial", headerName: "Correo", width: 250 },
		{ field: "name", headerName: "Nombre completo", width: 300 },
		{
			field: "role",
			headerName: "Rol",
			width: 300,
			renderCell: ({ row }: GridValueGetterParams) => {
				return (
					<Select
						value={row.role}
						label={"Rol"}
						sx={{ width: "300px" }}
						onChange={(event) => onRoleUpdated(row.id, event.target.value)}
					>
						<MenuItem value='admin'>Admin</MenuItem>
						<MenuItem value='client'>Client</MenuItem>
						<MenuItem value='super-user'>Super User</MenuItem>
						<MenuItem value='SEO'>SEO</MenuItem>
					</Select>
				);
			},
		},
	];

	const rows = users.map((user) => ({
		id: user._id,
		emial: user.email,
		name: user.name,
		role: user.role,
	}));
	return (
		<AdminLayout
			title='Usuarios'
			subtitle='Mantenimiento de usuarios'
			icon={<PeopleOutline />}
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

export default UserPage;
