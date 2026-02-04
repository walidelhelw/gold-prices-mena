import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, locales } from "@/lib/i18n/routing";
import { extractCountryFromHeaders, getDefaultCountry, normalizeCountry } from "@/lib/utils/geo";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always"
});

export default function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);
  const hasLocale = locales.includes(segments[0] as (typeof locales)[number]);

  if (!hasLocale) {
    return intlMiddleware(request);
  }

  const locale = segments[0];
  const overrideCountry = normalizeCountry(searchParams.get("country"));

  if (overrideCountry) {
    const url = request.nextUrl.clone();
    url.searchParams.delete("country");
    url.pathname = `/${locale}/${overrideCountry}`;
    const response = NextResponse.redirect(url);
    response.cookies.set("country", overrideCountry, {
      path: "/",
      maxAge: 60 * 60 * 24 * 120
    });
    return response;
  }

  if (segments.length === 1) {
    const cookieCountry = normalizeCountry(request.cookies.get("country")?.value ?? null);
    const headerCountry = extractCountryFromHeaders(request.headers);
    const country = cookieCountry ?? headerCountry ?? getDefaultCountry();
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/${country}`;
    const response = NextResponse.redirect(url);
    if (!cookieCountry) {
      response.cookies.set("country", country, {
        path: "/",
        maxAge: 60 * 60 * 24 * 120
      });
    }
    return response;
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|robots.txt|sitemap.xml).*)"]
};
