import { ReactNode } from "react";
import classnames from "classnames";

type Props = {
  children: ReactNode;
  selected: boolean;
  onClick: () => void;
};

export const Link = ({ children, selected, onClick }: Props) => {
  return (
    <a
      className={classnames({ selected })}
      style={{ cursor: "pointer" }}
      onClick={() => onClick()}
    >
      {children}
    </a>
  );
};
