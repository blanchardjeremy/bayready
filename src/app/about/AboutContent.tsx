"use client";

import { OAKLAND_CORE } from "@/data/counties";
import { useDocumentTitle } from "@/components/useDocumentTitle";
import { useT } from "@/i18n/useLang";
import type { Messages } from "@/i18n/messages";

type About = Messages["pages"]["about"];

/** Sources by group: [id for the description, name as its publisher wrote it, link]. */
const SOURCES: { group: keyof About["groups"]; links: [keyof About["sources"], string, string][] }[] = [
  {
    group: "bayArea",
    links: [
      ["readysf", "ReadySF: Stay Box and Go Bag", "https://www.sf.gov/readysf"],
      ["ebmud", "EBMUD emergency preparedness", "https://www.ebmud.com/waterstorage"],
      ["sfpuc", "SFPUC emergency water", "https://www.sfpuc.gov/learning/emergency-preparedness"],
      [
        "haywired",
        "USGS HayWired scenario",
        "https://www.usgs.gov/programs/science-application-for-risk-reduction/science/haywired-scenario",
      ],
      ["genasys", "Genasys Protect evacuation zones", "https://protect.genasys.com"],
      ["tsunamiMaps", "California tsunami hazard maps", "https://www.conservation.ca.gov/cgs/tsunami/maps"],
    ],
  },
  {
    group: "state",
    links: [
      ["readyKit", "Ready.gov: Build a Kit", "https://www.ready.gov/kit"],
      ["listos", "Listos California", "https://www.listoscalifornia.org"],
      [
        "cdcWater",
        "CDC: Water for emergencies",
        "https://www.cdc.gov/water-emergency/about/how-to-create-and-store-an-emergency-water-supply.html",
      ],
      ["airnow", "AirNow: wildfire smoke", "https://www.airnow.gov/wildfires/"],
      ["eca", "Earthquake Country Alliance", "https://www.earthquakecountry.org"],
      ["braceBolt", "Earthquake Brace + Bolt", "https://www.earthquakebracebolt.com"],
    ],
  },
  {
    group: "community",
    links: [
      ["nert", "SF NERT", "https://sf-fire.org/nert"],
      ["core", "Oakland CORE", OAKLAND_CORE.url],
      ["mapYourNeighborhood", "Map Your Neighborhood", "https://sf-fire.org/nert/map-your-neighborhood"],
      [
        "cert",
        "FEMA: CERT",
        "https://www.fema.gov/emergency-managers/individuals-communities/preparedness-activities-webinars/community-emergency-response-team",
      ],
      ["blockParty", "Listos California block party", "https://www.listoscalifornia.org/blockparty/"],
      ["klinenberg", "Klinenberg on the 1995 Chicago heat wave", "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9255631/"],
      ["resilientPeeps", "Resilient Peeps: Products I Recommend", "https://resilientpeeps.com/products-i-recommend"],
    ],
  },
  {
    group: "power",
    links: [
      ["pgeAlerts", "PG&E outage alerts", "https://www.pge.com/addressalert"],
      [
        "medicalBaseline",
        "PG&E Medical Baseline",
        "https://www.pge.com/en/account/billing-and-assistance/financial-assistance/medical-baseline-program.html",
      ],
      ["ddar", "PG&E DDAR program", "https://www.pge.com/ddar"],
      ["readyDisability", "Ready.gov: People with disabilities", "https://www.ready.gov/disability"],
      ["readyPets", "Ready.gov: Pets", "https://www.ready.gov/pets"],
    ],
  },
];

/** The Sources page, in the visitor's language. Source names and links stay as published. */
export function AboutContent() {
  const t = useT().pages.about;
  useDocumentTitle(t.title);
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-6 sm:px-6">
      <h1 className="text-[2.2rem] font-extrabold leading-tight tracking-[-0.025em]">{t.heading}</h1>
      <div className="mt-4 max-w-[64ch] space-y-4 text-lg text-ink-soft">
        <p>{t.intro}</p>
        <p>
          <span className="font-semibold text-ink">{t.neighborsLead}</span> {t.neighbors}
        </p>
        <p>{t.privacy}</p>
        {t.sourcesLanguage && <p>{t.sourcesLanguage}</p>}
      </div>
      {SOURCES.map((s) => (
        <section key={s.group} className="mt-12">
          <h2 className="border-b-2 border-ink pb-1 text-xl font-extrabold tracking-tight">{t.groups[s.group]}</h2>
          <ul className="divide-y divide-line">
            {s.links.map(([id, name, url]) => (
              <li key={url} className="py-3">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  lang="en"
                  className="font-semibold underline underline-offset-2"
                >
                  {name}
                </a>
                <p className="mt-0.5 text-ink-soft">{t.sources[id]}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
