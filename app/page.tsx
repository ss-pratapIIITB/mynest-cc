import Nav from "@/components/nav";
import Hero from "@/components/hero";
import PracticeStrip from "@/components/practice-strip";
import BlogStrip from "@/components/blog-strip";
import DinoRunner from "@/components/dino-runner";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Nav />
      <Hero />
      <PracticeStrip />
      <BlogStrip />
      <DinoRunner />
    </main>
  );
}
