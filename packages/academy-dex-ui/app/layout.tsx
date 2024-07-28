"use client";

import { Suspense, useCallback } from "react";
import "../styles/bs/global.scss";
import AppProvider from "./provider";
import "@rainbow-me/rainbowkit/styles.css";
import "rc-slider/assets/index.css";
import MainMenu from "~~/components/MainMenu";
import MobileMenu from "~~/components/MobileMenu";
import { useContentPanel } from "~~/hooks/useContentPanel";
import { useWindowWidthChange } from "~~/hooks/useWindowResize";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { contentPanelActive, showContentPanel, hideContentPanel, toggleContentPanel } = useContentPanel();

  useWindowWidthChange(
    useCallback(() => {
      !contentPanelActive && window.innerWidth >= 1150 && showContentPanel();
      contentPanelActive && window.innerWidth < 1150 && hideContentPanel();
    }, [contentPanelActive]),
  );

  return (
    <html lang="en">
      <body className="menu-position-side menu-side-left full-screen color-scheme-dark with-content-panel">
        <Suspense>
          <AppProvider>
            <div
              className={`all-wrapper with-side-panel solid-bg-all${contentPanelActive ? " content-panel-active" : ""}`}
            >
              <div className="layout-w">
                <MainMenu />
                <MobileMenu />

                <div className="content-w" style={{ minHeight: "95vh" }}>
                  {children}
                </div>
              </div>
            </div>
          </AppProvider>
        </Suspense>
      </body>
    </html>
  );
}
