import { NextRequest, NextResponse } from "next/server";
import { ChainID } from "../../bot/service";
import * as faucet from "../service";
import { errorMsg } from "~~/components/TransactionWaitingIcon/helpers";

export async function GET(req: NextRequest, { params: { address } }: { params: { address: string } }) {
  const searchParams = req.nextUrl.searchParams;

  const claim = (searchParams.get("claim") ?? "false") === "true";
  const chainId: ChainID | null = searchParams.get("chainId") as any;

  if (!chainId || !address) {
    return NextResponse.error().json();
  }

  try {
    const value = await faucet.valueFor({ address, claim, chainId });
    return Response.json(value);
  } catch (error: any) {
    console.log({ error });
    return Response.json({ message: errorMsg(error.toString()) }, { status: 500 });
  }
}
