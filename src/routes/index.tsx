import { createFileRoute } from "@tanstack/react-router";
import { CabinApp } from "@/components/cabin/cabin-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <CabinApp />;
}
