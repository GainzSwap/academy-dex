import { PropsWithChildren } from "react";

export default function ElementWrapper({ children, title }: PropsWithChildren<{ title: string }>) {
  return (
    <div className="element-wrapper compact">
      <h6 className="element-header">{title}</h6>
      <div className="element-box-tp">{children}</div>
    </div>
  );
}
