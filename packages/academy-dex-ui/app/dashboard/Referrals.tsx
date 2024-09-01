import { useAccount } from "wagmi";
import BlockiesImage from "~~/components/BlockiesImage";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { truncateFromInside } from "~~/utils";

export default function Referrals() {
  const { address } = useAccount();
  const { data: referrals } = useScaffoldReadContract({
    contractName: "Router",
    functionName: "getReferrals",
    args: [address],
  });

  if (!referrals?.length) {
    return null;
  }

  return (
    <div className="element-wrapper compact pt-4">
      <h6 className="element-header">Your Referrals</h6>
      <div className="element-box-tp">
        <div className="inline-profile-tiles">
          <div className="row">
            <div className="col-4 col-sm-3 col-xxl-2">
              {referrals.map(({ id, referralAddress }) => (
                <div key={id + referralAddress} className="profile-tile profile-tile-inlined">
                  <a className="profile-tile-box" href="">
                    <div className="pt-avatar-w">
                      <BlockiesImage seed={referralAddress} />
                    </div>
                    <div className="pt-user-name">{truncateFromInside(referralAddress, 9)}</div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
