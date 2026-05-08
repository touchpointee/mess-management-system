import { redirect } from "next/navigation";

/** Customer home is hidden; send users to My Mess. */
export default function CustomerRootPage() {
  redirect("/my-mess");
}
