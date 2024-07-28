"use client";

import Sidebar from "./Sidebar";
import Swap from "./Swap";
import { useContentPanel } from "~~/hooks/useContentPanel";

export default function Dashboard() {
  const { toggleContentPanel } = useContentPanel();

  return (
    <>
      {/* TODO <TopBar /> */}
      <div onClick={toggleContentPanel} className="content-panel-toggler">
        <i className="os-icon os-icon-grid-squares-22"></i>
        <span>Sidebar</span>
      </div>
      <div className="content-i">
        <div className="content-box" style={{ minHeight: "95vh" }}>
          <div className="row">
            <Swap />
          </div>
        </div>

        <Sidebar />
      </div>
    </>
  );
}
