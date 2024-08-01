import { useEffect, useState } from "react";
import { RefIdData } from "../utils";
import useRawCallsInfo from "./useRawCallsInfo";
import useSWR from "swr";
import { getItem, setItem } from "~~/storage/session";

export default function useInitGlobalData() {
  const { client, router } = useRawCallsInfo();
  // REF ID Stuff ---
  const [refID, setRefID] = useState<string | null | undefined>();
  const { data: refData, error } = useSWR(
    client && router && refID ? { key: "getReferrerData", refID, client, router } : null,
    async ({ refID, client, router }) => {
      const id = RefIdData.getID(refID);
      const address = await client.readContract({
        abi: router.abi,
        address: router.address,
        functionName: "userIdToAddress",
        args: [BigInt(id)],
      });

      return new RefIdData(address, id);
    },
  );

  useEffect(() => {
    const url = window.location.toString().split("?")[1];
    const searchParams = new URLSearchParams(url);

    setRefID(searchParams.get("refID") || getItem("userRefBy"));
  }, []);
  useEffect(() => {
    if (refData?.refID) {
      typeof refData?.refID !== "undefined" && setItem({ key: "userRefBy", data: refData.refID }, 60 * 60 * 24 * 360);
    }
  }, [refData, error]);
}
