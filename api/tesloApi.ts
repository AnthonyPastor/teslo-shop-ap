import axios from "axios";
import Cookies from "js-cookie";

const tesloApi = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL,
	...(Cookies.get("token")
		? { headers: { Authorization: `Bearer ${Cookies.get("token")}` } }
		: { headers: {} }),
});

export default tesloApi;
