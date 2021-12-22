import React, { HTMLAttributes } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { Theme } from "@material-ui/core";
import Title from "../../basic/Title";

const useStyles = makeStyles<Theme>((theme) => ({
  pageHeader: {
    marginBottom: theme.spacing(3),
  },
}));

type PageHeaderProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  children?: React.ReactNode;
  className?: string;
};

function PageHeader(props: PageHeaderProps): JSX.Element {
  const { title, children, className, ...other } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.pageHeader, className)} {...other}>
      <Title text={title} variant="title" ellipsis={true}>
        {children}
      </Title>
    </div>
  );
}

export default PageHeader;
