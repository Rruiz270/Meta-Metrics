import { checkTokenStatus } from "@/lib/meta-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const metaToken = await checkTokenStatus();

    const igTokenSet = !!process.env.INSTAGRAM_ACCESS_TOKEN;
    const metaTokenSet = !!process.env.META_ACCESS_TOKEN;

    return Response.json({
      status: metaToken.isValid ? "healthy" : "degraded",
      meta: {
        tokenSet: metaTokenSet,
        ...metaToken,
      },
      instagram: {
        tokenSet: igTokenSet,
      },
      env: {
        adAccountId: !!process.env.AD_ACCOUNT_ID,
        facebookPageId: !!process.env.FACEBOOK_PAGE_ID,
        igBusinessAccountId: !!process.env.IG_BUSINESS_ACCOUNT_ID,
        instagramAccountId: !!process.env.INSTAGRAM_ACCOUNT_ID,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      { status: "error", error: message },
      { status: 500 }
    );
  }
}
