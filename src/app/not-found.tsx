import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#09090b] p-6">
      <Surface className="max-w-sm p-8 text-center">
        <p className="font-mono text-4xl font-bold text-[#e09040]">404</p>
        <h1 className="mt-3 text-lg font-semibold text-white">Page not found</h1>
        <p className="mt-2 text-sm text-white/50">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button asChild className="mt-6" href="/" size="sm">
          Go home
        </Button>
      </Surface>
    </main>
  );
}
