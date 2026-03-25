import { redirect } from "next/navigation";

/** Customer “home” is hidden; send users to Overview. */
export default function CustomerRootPage() {
  redirect("/overview");
}
