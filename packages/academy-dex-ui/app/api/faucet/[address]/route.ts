import { NextRequest, NextResponse } from "next/server";
import * as faucet from "../service";
import { errorMsg } from "~~/components/TransactionWaitingIcon/helpers";
import { ChainID } from "../../helpers";

export async function GET(req: NextRequest, { params: { address } }: { params: { address: string } }) {
  const searchParams = req.nextUrl.searchParams;

  const claim = (searchParams.get("claim") ?? "false") === "true";
  const chainId: ChainID | null = searchParams.get("chainId") as any;
  const ipAddress = req.ip || req.headers.get("X-Forwarded-For");

  if (!chainId || !address || !ipAddress) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }

  try {
    const value = await faucet.valueFor({ address, claim, chainId, ipAddress });
    return Response.json(value);
  } catch (error: any) {
    return Response.json({ message: errorMsg(error.toString()) }, { status: 500 });
  }
}
