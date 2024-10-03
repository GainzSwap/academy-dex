import { NextRequest, NextResponse } from "next/server";
import { ChainID, TgDappLinkage } from "../../bot/service";
import { TgUser } from "~~/drizzle/schema/models/TgUser";
import { User } from "~~/drizzle/schema/models/User";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  const tgLinkage = searchParams.get("tgLinkage");
  const address = searchParams.get("address");
  const chainId: ChainID | null = searchParams.get("chainId") as any;

  if (!address || !tgLinkage || !chainId) {
    return NextResponse.error();
  }

  const { tgID, referrerID_tg } = TgDappLinkage.fromString(tgLinkage);

  // try creating user
  await User.create(address, chainId, tgID);

  const referrerID = (await TgUser.findOneBy({ refID: referrerID_tg }))?.user?.refID;

  // Return referrer ID on contract if any
  return Response.json(referrerID);
}
