import { NextRequest, NextResponse } from "next/server";
import { ChainID } from "../../bot/service";
import * as faucet from "../service";

export async function GET(req: NextRequest, { params: { address } }: { params: { address: string } }) {
  const searchParams = req.nextUrl.searchParams;

  const claim = (searchParams.get("claim") ?? "false") === "true";
  const chainId: ChainID | null = searchParams.get("chainId") as any;

  if (!chainId || !address) {
    return NextResponse.error().json();
  }

  return Response.json(await faucet.valueFor({ address, claim, chainId }));
}
