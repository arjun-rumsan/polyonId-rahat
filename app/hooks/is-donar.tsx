import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

export const useIsDonarPage = () => {
  const pathname = usePathname();
  const [isDonarPage, setDonarPage] = useState(false);

  useMemo(() => {
    setDonarPage(pathname === "/donate");
  }, [pathname]);

  return { pathname, setDonarPage, isDonarPage };
};
