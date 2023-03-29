import React, { ChangeEvent, FC, useEffect, useRef, useState } from "react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";

import {
	DriveFileRenameOutline,
	SaveOutlined,
	UploadOutlined,
} from "@mui/icons-material";
import {
	Box,
	Button,
	capitalize,
	Card,
	CardActions,
	CardMedia,
	Checkbox,
	Chip,
	Divider,
	FormControl,
	FormControlLabel,
	FormGroup,
	FormLabel,
	Grid,
	Radio,
	RadioGroup,
	TextField,
} from "@mui/material";

import { AdminLayout } from "../../../components/layouts";
import { IProduct } from "../../../interfaces";
import { tesloApi } from "../../../api";
import { Product } from "../../../models";
import { ApiResponse } from "../../../interfaces/apiResponse";
import { FullScreenLoading } from "../../../components/ui/FullScreenLoading";

const validTypes = ["shirts", "pants", "hoodies", "hats"];
const validGender = ["men", "women", "kid", "unisex"];
const validSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

interface FormData {
	_id?: string;
	description: string;
	images: string[];
	inStock: number;
	price: number;
	sizes: string[];
	slug: string;
	tags: string[];
	title: string;
	type: string;
	gender: string;
}

const ProductAdminPage = () => {
	const router = useRouter();
	const { slug } = router.query;

	const fileInputRef = useRef<HTMLInputElement>(null);

	const [newTagValue, setNewTagValue] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	const [product, setProduct] = useState<IProduct>();

	const {
		register,
		handleSubmit,
		formState: { errors },
		getValues,
		setValue,
		watch,
	} = useForm<FormData>({
		defaultValues: product,
	});

	// TODO: Replace with SSR when upgrade to Paid Hosting
	useEffect(() => {
		let product: IProduct | null = null;

		if (slug === "new") {
			const tempProduct = JSON.parse(JSON.stringify(new Product()));

			delete tempProduct._id;

			product = tempProduct;
		} else {
			const getProduct = async () => {
				const { data } = await tesloApi.get<ApiResponse<IProduct>>(
					`/product/slug/${slug?.toString()}`
				);

				if (data.success) {
					product = data.data;
				} else {
					product = null;
				}
			};

			getProduct();
		}

		if (!product) {
			router.push("/admin/products");
		} else {
			setProduct(product);
		}
	}, [slug]);

	useEffect(() => {
		const subscription = watch((value, { name, type }) => {
			if (name === "title") {
				const newSlug =
					value.title
						?.trim()
						.replaceAll(" ", "_")
						.replaceAll("'", "")
						.toLocaleLowerCase() || "";

				setValue("slug", newSlug);
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [watch, setValue]);

	if (!product) return <FullScreenLoading></FullScreenLoading>;

	const onChangeSize = (size: string) => {
		const currentSizes = getValues("sizes");

		if (currentSizes?.includes(size)) {
			setValue(
				"sizes",
				currentSizes.filter((s) => s !== size),
				{ shouldValidate: true }
			);
			return;
		}

		setValue("sizes", [...currentSizes, size], { shouldValidate: true });
	};

	const onNewTag = () => {
		const newTag = newTagValue.trim().toLowerCase();
		setNewTagValue("");

		const currentTags = getValues("tags");

		if (!currentTags?.includes(newTag)) {
			currentTags.push(newTag);
		}

		return;
	};
	const onDeleteTag = (tag: string) => {
		const updatedTags = getValues("tags").filter((t) => t !== tag);

		setValue("tags", updatedTags, { shouldValidate: true });
	};

	const onDeleteImage = (image: string) => {
		const updatedImages = getValues("images").filter((img) => img !== image);

		setValue("images", updatedImages, { shouldValidate: true });
	};

	const onFileSelected = async ({ target }: ChangeEvent<HTMLInputElement>) => {
		if (!target.files || target.files.length === 0) return;

		try {
			for (const file of target.files) {
				const formData = new FormData();

				formData.append("file", file);

				const { data } = await tesloApi.post<ApiResponse<string>>(
					`/admin/upload`,
					formData
				);

				setValue("images", [...getValues("images"), data.data], {
					shouldValidate: true,
				});
			}
		} catch (error) {
			console.error(error);
		}
	};

	const onSubmit = async (formData: FormData) => {
		if (formData.images.length < 2) return alert("Mínimo 2 imágenes");

		setIsSaving(true);

		try {
			const resp = await tesloApi("/admin/products", {
				data: formData,
				method: formData._id ? "PUT" : "POST",
			});

			if (!resp.data.success) {
				setIsSaving(false);
				alert(resp.data.message);
				return;
			}

			if (!formData._id) {
				// TODO: recargar el navegador

				router.replace(`/admin/products/${resp.data.slug}`);
			} else {
				setIsSaving(false);
			}
		} catch (error) {
			console.error(error);
			setIsSaving(false);
		}
	};

	return (
		<AdminLayout
			title={"Producto"}
			subtitle={`Editando: ${product?.title}`}
			icon={<DriveFileRenameOutline />}
		>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Box display='flex' justifyContent='end' sx={{ mb: 1 }}>
					<Button
						color='secondary'
						startIcon={<SaveOutlined />}
						sx={{ width: "150px" }}
						type='submit'
						disabled={isSaving}
					>
						Guardar
					</Button>
				</Box>

				<Grid container spacing={2}>
					{/* Data */}
					<Grid item xs={12} sm={6}>
						<TextField
							label='Título'
							variant='filled'
							fullWidth
							sx={{ mb: 1 }}
							{...register("title", {
								required: "Este campo es requerido",
								minLength: { value: 2, message: "Mínimo 2 caracteres" },
							})}
							error={!!errors.title}
							helperText={errors.title?.message}
						/>

						<TextField
							label='Descripción'
							variant='filled'
							fullWidth
							multiline
							sx={{ mb: 1 }}
							{...register("description", {
								required: "Este campo es requerido",
								minLength: { value: 2, message: "Mínimo 2 caracteres" },
							})}
							error={!!errors.description}
							helperText={errors.description?.message}
						/>

						<TextField
							label='Inventario'
							type='number'
							variant='filled'
							fullWidth
							sx={{ mb: 1 }}
							{...register("inStock", {
								required: "Este campo es requerido",
								min: { value: 0, message: "Mínimo de valor 0" },
							})}
							error={!!errors.inStock}
							helperText={errors.inStock?.message}
						/>

						<TextField
							label='Precio'
							type='number'
							variant='filled'
							fullWidth
							sx={{ mb: 1 }}
							{...register("price", {
								required: "Este campo es requerido",
								min: { value: 0, message: "Mínimo de valor 0" },
							})}
							error={!!errors.price}
							helperText={errors.price?.message}
						/>

						<Divider sx={{ my: 1 }} />

						<FormControl sx={{ mb: 1 }}>
							<FormLabel>Tipo</FormLabel>
							<RadioGroup
								row
								value={getValues("type")}
								onChange={(event) =>
									setValue("type", event.target.value, { shouldValidate: true })
								}
							>
								{validTypes?.map((option) => (
									<FormControlLabel
										key={option}
										value={option}
										control={<Radio color='secondary' />}
										label={capitalize(option)}
									/>
								))}
							</RadioGroup>
						</FormControl>

						<FormControl sx={{ mb: 1 }}>
							<FormLabel>Género</FormLabel>
							<RadioGroup
								row
								value={getValues("gender")}
								onChange={(event) =>
									setValue("gender", event.target.value, {
										shouldValidate: true,
									})
								}
							>
								{validGender?.map((option) => (
									<FormControlLabel
										key={option}
										value={option}
										control={<Radio color='secondary' />}
										label={capitalize(option)}
									/>
								))}
							</RadioGroup>
						</FormControl>

						<FormGroup>
							<FormLabel>Tallas</FormLabel>
							{validSizes?.map((size) => (
								<FormControlLabel
									key={size}
									control={
										<Checkbox checked={getValues("sizes")?.includes(size)} />
									}
									onChange={() => onChangeSize(size)}
									label={size}
								/>
							))}
						</FormGroup>
					</Grid>

					{/* Tags e imagenes */}
					<Grid item xs={12} sm={6}>
						<TextField
							label='Slug - URL'
							variant='filled'
							fullWidth
							sx={{ mb: 1 }}
							{...register("slug", {
								required: "Este campo es requerido",
								minLength: { value: 2, message: "Mínimo 2 caracteres" },
								validate: (val) =>
									val.trim()?.includes(" ")
										? "No puede tener espacios en blanco"
										: undefined,
							})}
							error={!!errors.slug}
							helperText={errors.slug?.message}
						/>

						<TextField
							label='Etiquetas'
							variant='filled'
							fullWidth
							sx={{ mb: 1 }}
							value={newTagValue}
							onChange={(e) => setNewTagValue(e.target.value)}
							helperText='Presiona [spacebar] para agregar'
							onKeyUp={({ code }) =>
								code === "Space" ? onNewTag() : undefined
							}
						/>

						<Box
							sx={{
								display: "flex",
								flexWrap: "wrap",
								listStyle: "none",
								p: 0,
								m: 0,
							}}
							component='ul'
						>
							{getValues("tags")?.map((tag) => {
								return (
									<Chip
										key={tag}
										label={tag}
										onDelete={() => onDeleteTag(tag)}
										color='primary'
										size='small'
										sx={{ ml: 1, mt: 1 }}
									/>
								);
							})}
						</Box>

						<Divider sx={{ my: 2 }} />

						<Box display='flex' flexDirection='column'>
							<FormLabel sx={{ mb: 1 }}>Imágenes</FormLabel>
							<Button
								color='secondary'
								fullWidth
								startIcon={<UploadOutlined />}
								sx={{ mb: 3 }}
								onClick={() => fileInputRef.current?.click()}
							>
								Cargar imagen
							</Button>

							<input
								placeholder='choose file'
								ref={fileInputRef}
								type='file'
								multiple
								accept='image/png, image/gif, image/jpeg'
								style={{ display: "none" }}
								onChange={onFileSelected}
							/>
							{getValues("images").length < 2 ? (
								<Chip
									label='Es necesario al 2 imagenes'
									color='error'
									variant='outlined'
									sx={{ mb: 2 }}
								/>
							) : null}

							<Grid container spacing={2}>
								{getValues("images")?.map((img) => (
									<Grid item xs={4} sm={3} key={img}>
										<Card>
											<CardMedia
												component='img'
												className='fadeIn'
												image={img}
												alt={img}
											/>
											<CardActions>
												<Button
													fullWidth
													color='error'
													onClick={() => onDeleteImage(img)}
												>
													Borrar
												</Button>
											</CardActions>
										</Card>
									</Grid>
								))}
							</Grid>
						</Box>
					</Grid>
				</Grid>
			</form>
		</AdminLayout>
	);
};

// You should use getServerSideProps when:
// - Only if you need to pre-render a page whose data must be fetched at request time

// export const getServerSideProps: GetServerSideProps = async ({ query }) => {
// 	const { slug = "" } = query;

// 	let product: IProduct | null;

// 	if (slug === "new") {
// 		const tempProduct = JSON.parse(JSON.stringify(new Product()));

// 		delete tempProduct._id;

// 		product = tempProduct;
// 	} else {
// 		const { data } = await tesloApi.get<ApiResponse<IProduct>>(
// 			`/product/slug/${slug.toString()}`
// 		);

// 		if (data.success) {
// 			product = data.data;
// 		} else {
// 			product = null;
// 		}
// 	}

// 	if (!product) {
// 		return {
// 			redirect: {
// 				destination: "/admin/products",
// 				permanent: false,
// 			},
// 		};
// 	}

// 	return {
// 		props: {
// 			product,
// 		},
// 	};
// };

export default ProductAdminPage;
