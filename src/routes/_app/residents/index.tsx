import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/residents/")({
  component: ResidentsPage,
});

function ResidentsPage() {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Residents</h2>
        <Button size="sm" variant="secondary">
          Register Resident
        </Button>
      </div>
    </section>
  );
}
