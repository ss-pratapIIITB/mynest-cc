import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "private",
  description: "private",
  robots: { index: false, follow: false, nocache: true },
};

export default function CeoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
