import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TopNav, MobileTabBar } from "@/components/likha/nav";
import { Hero } from "@/components/likha/hero";
import { Rail } from "@/components/likha/rail";
import { CollectionBanner } from "@/components/likha/collection-banner";
import { FilmDetail } from "@/components/likha/film-detail";
import { Footer } from "@/components/likha/footer";
import { awardWinners, classics, continueWatching, curatedCollection, luzon, newReleases, popular, shortsAndDocs, } from "@/data/films";
import type { Film } from "@/data/films";
import { cinemalaya2026FullLength, cinemalaya2026Shorts } from "@/data/films-cinemalaya-2026";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Likha Flix — Stream Filipino Independent Cinema" },
      { name: "description", content: "Rent Filipino independent films in HD from ₱49. Festival winners, regional voices from Luzon, Visayas and Mindanao, documentaries, shorts and restored classics." },
      { property: "og:title", content: "Likha Flix — Stream Filipino Independent Cinema" },
      { property: "og:description", content: "Festival winners, regional voices, documentaries and shorts. 7-day access · 1080p · EN & FIL subtitles." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "" }],
  }),
  component: Home,
});

function Home() {
  const [selected, setSelected] = useState<Film | null>(null);
  const open = (film: Film) => setSelected(film);

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <TopNav />
      <main>
        <Hero onOpen={open} />
        <Rail title="Cinemalaya 2026 Official Selection" subtitle="Real festival finalists, straight from cinemalaya.org" films={cinemalaya2026FullLength} onOpen={open} />
        <Rail title="Cinemalaya 2026 Shorts" subtitle="Shorts A & B — real festival finalists" films={cinemalaya2026Shorts} onOpen={open} />
        <Rail title="Continue Watching" films={continueWatching} onOpen={open} />
        <Rail title="Popular in the Philippines" subtitle="What the country is renting this week" films={popular} onOpen={open} />
        <Rail title="New Releases" subtitle="Premieres and fresh festival runs" films={newReleases} onOpen={open} />
        <Rail title="From Luzon, Visayas & Mindanao" subtitle="Regional cinema in its own languages" films={luzon} onOpen={open} />
        <CollectionBanner />
        <Rail title="Curated Collection" subtitle="The Provincial New Wave — twelve films" films={curatedCollection} variant="portrait" onOpen={open} />
        <Rail title="Award Winners" subtitle="Cinemalaya, QCinema, Gawad Urian and beyond" films={awardWinners} variant="portrait" onOpen={open} />
        <Rail title="Shorts & Documentaries" subtitle="Free to ₱29" films={shortsAndDocs} onOpen={open} />
        <Rail title="Filipino Classics" subtitle="Restored and remastered" films={classics} onOpen={open} />
      </main>
      <Footer />
      <MobileTabBar />
      <FilmDetail film={selected} onClose={() => setSelected(null)} />
    </div>
  );
}