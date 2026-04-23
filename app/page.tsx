import { Suspense } from "react";
import Header from "./components/layout/Header";
import Hero from "./components/sections/Hero";
import Skills from "./components/sections/Skills";
import OceanPath from "./components/sections/OceanPath";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Suspense>
          <Skills />
        </Suspense>
        <OceanPath />
      </main>
    </>
  );
}
