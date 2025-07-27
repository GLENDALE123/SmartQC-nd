import { useIsMobile } from "@/hooks/use-mobile";
import ExcelImportDesktop from "./ExcelImportSettings/ExcelImportDesktop";
import ExcelImportMobile from "./ExcelImportSettings/ExcelImportMobile";

export default function ExcelImportSettings() {
  const isMobile = useIsMobile();

  return isMobile ? <ExcelImportMobile /> : <ExcelImportDesktop />;
}