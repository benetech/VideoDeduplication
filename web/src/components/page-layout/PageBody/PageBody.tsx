import React, { HTMLAttributes } from "react";

type PageBodyProps = HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode;
  className?: string;
};

function PageBody(props: PageBodyProps): JSX.Element {
  const { children, className, ...other } = props;
  return (
    <div className={className} {...other}>
      {children}
    </div>
  );
}

export default PageBody;
