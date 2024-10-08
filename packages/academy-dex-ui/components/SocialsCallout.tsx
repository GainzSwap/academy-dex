import Link from "next/link";
import { useModalToShow } from "./Modals";
import { useReferralInfo } from "./ReferralCard/hooks";
import { SocialsTxButtonClickCountType, getItem, setItem } from "~~/storage/session";

const initialCheckPoints = [2, 3, 5];
const getData = () =>
  getItem<SocialsTxButtonClickCountType>("socialsTxButtonClickCount") || {
    clickCount: 0,
    checkPoints: [],
    lastSocialCallout: "tg",
  };

/**
 * Alternantes bool based on fib sequence
 * @returns
 */
export const checkShouldShowSocialsCallout = () => {
  let { clickCount, checkPoints, lastSocialCallout } = getData();
  clickCount++;

  let shouldCallout = false;
  if (checkPoints.length <= 1) {
    checkPoints = initialCheckPoints;
  }
  const [lastCheckPoint, nextCheckPoint, checkPointCache] = checkPoints;
  if (clickCount > lastCheckPoint) {
    console.log({ clickCount, lastCheckPoint });
    shouldCallout = true;

    // Update checkpoints
    switch (lastSocialCallout) {
      case "x":
        lastSocialCallout = "tg";
        break;
      case "tg":
        lastSocialCallout = "x";
        break;
    }

    checkPoints.splice(0, 1);
    if (clickCount >= 15) {
      checkPoints = initialCheckPoints;
      clickCount = 1;
    } else {
      checkPoints = [nextCheckPoint, checkPointCache, nextCheckPoint + checkPointCache];
    }
  }
  setItem({ key: "socialsTxButtonClickCount", data: { clickCount, lastSocialCallout, checkPoints } });

  return shouldCallout;
};

export default function SocialsCalloutModal() {
  const { botStart } = useReferralInfo();
  const { closeModal } = useModalToShow();
  const { lastSocialCallout } = getData();

  const [calloutText, calloutLink] =
    lastSocialCallout == "x" ? ["follow us on X", "https://x.com/academy_dex_edu"] : ["join us on Telegram", botStart];

  return (
    <div className="modal-content text-center">
      <button aria-label="Close" className="close" onClick={closeModal} type="button">
        <span className="close-label">Close</span>
        <span className="os-icon os-icon-close"></span>
      </button>
      <div className="onboarding-media">
        <img alt="" src="img/bigicon2.png" width="200px" />
      </div>
      <div className="onboarding-content with-gradient">
        <h4 className="onboarding-title">Stay Connected with Academy-DEX!</h4>
        <div className="onboarding-text" style={{ color: "white" }}>
          Don&apos;t miss out on updates, new features, and exciting announcements. Click below to {calloutText} and be
          part of the Academy-DEX community!
          {calloutLink && (
            <Link
              target="_blank"
              href={calloutLink}
              className={`btn btn-${lastSocialCallout == "x" ? "primary" : "success"} w-100 btn-lg`}
              style={{ color: "white" }}
            >
              {calloutText}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
