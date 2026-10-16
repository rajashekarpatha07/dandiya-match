"use client";

import dynamic from "next/dynamic";
import { PageSpinner } from "@/components/Spinner";
import type { VenueWithStats } from "@/lib/types";

const VenueMap = dynamic(() => import("@/components/VenueMap"), {
  ssr: false,
  loading: () => <PageSpinner />,
});

export function VenueMapLoader({ venues }: { venues: VenueWithStats[] }) {
  return <VenueMap venues={venues} />;
}
