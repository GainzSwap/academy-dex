import PortfolioValue from "./PortfolioValue";
import LoggedUserInfo from "~~/components/LoggedUserInfo";

export default function TopBar() {
  return (
    <div className="top-bar color-scheme-transparent">
      <PortfolioValue />

      <div className="top-menu-controls">
        <LoggedUserInfo location="topbar" />
      </div>
    </div>
  );
}
