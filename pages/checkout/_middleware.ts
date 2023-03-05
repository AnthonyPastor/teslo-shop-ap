import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { jwt } from "../../utils";

export async function middleware(req: NextRequest | any, ev: NextFetchEvent) {
	const { token = "" } = req.cookies;
	const isValidToken = (await jwt.isValidToken(token)).user !== undefined;

	if (isValidToken) return NextResponse.next();

	const requestedPage = req.page.name;
	return NextResponse.redirect(`/auth/login?p=${requestedPage}`);
}
