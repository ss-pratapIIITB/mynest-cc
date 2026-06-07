import Nav from "@/components/nav";
import Hero from "@/components/hero";
import DinoRunner from "@/components/dino-runner";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Nav />
      <Hero />
      <DinoRunner />
    </main>
  );
}
