import { redirect } from "next/navigation";

export default function LegacyInvoiceRedirectPage() {
  redirect("/software/invoice-generator");
}
