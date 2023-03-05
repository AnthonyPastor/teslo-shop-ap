import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { jwt } from "../../utils";

export async function middleware(req: NextRequest | any, ev: NextFetchEvent) {
	const { token = "" } = req.cookies;
	try {
		const { user } = await jwt.isValidToken(token);

		const validRoles = ["admin", "super-user", "SEO"];
		if (!user || !validRoles.includes(user.role)) {
			return NextResponse.redirect("/");
		}
		return NextResponse.next();
	} catch (error) {
		console.error(error);
		const requestedPage = req.page.name;
		return NextResponse.redirect(`/auth/login?p=${requestedPage}`);
	}
}
