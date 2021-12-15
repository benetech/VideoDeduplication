import React, { HTMLAttributes } from "react";

type SidebarContentProps = HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode;
  className?: string;
};

function SidebarContent(props: SidebarContentProps): JSX.Element {
  const { children, className, ...other } = props;
  return (
    <div className={className} {...other}>
      {children}
    </div>
  );
}

export default SidebarContent;
