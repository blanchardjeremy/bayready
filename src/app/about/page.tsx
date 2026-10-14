import type { Metadata } from "next";
import { OAKLAND_CORE } from "@/data/counties";

export const metadata: Metadata = { title: "Sources – Bay Ready" };

const SOURCES: { group: string; links: [string, string, string][] }[] = [
  {
    group: "Bay Area guidance",
    links: [
      ["ReadySF: Stay Box and Go Bag", "https://www.sf.gov/readysf", "San Francisco's official kit lists. About a week of supplies at home."],
      ["EBMUD emergency preparedness", "https://www.ebmud.com/waterstorage", "Recommends 2 gallons per person per day for at least 7 days, plus bleach doses for treating water."],
      ["SFPUC emergency water", "https://www.sfpuc.gov/learning/emergency-preparedness", "1 gallon per person per day, and how to treat water."],
      ["USGS HayWired scenario", "https://www.usgs.gov/programs/science-application-for-risk-reduction/science/haywired-scenario", "A modeled M7.0 Hayward Fault quake, with East Bay water outages averaging about 6 weeks."],
      ["Genasys Protect evacuation zones", "https://protect.genasys.com", "Look up your evacuation zone."],
      ["California tsunami hazard maps", "https://www.conservation.ca.gov/cgs/tsunami/maps", "Check whether your home, work, or school is in a tsunami zone."],
    ],
  },
  {
    group: "State and national",
    links: [
      ["Ready.gov: Build a Kit", "https://www.ready.gov/kit", "FEMA's basic disaster supplies list."],
      ["Listos California", "https://www.listoscalifornia.org", "Cal OES preparedness guides in many languages."],
      ["CDC: Water for emergencies", "https://www.cdc.gov/water-emergency/about/how-to-create-and-store-an-emergency-water-supply.html", "Storing and treating water."],
      ["AirNow: wildfire smoke", "https://www.airnow.gov/wildfires/", "Clean-air rooms, N95s, and DIY air cleaners."],
      ["Earthquake Country Alliance", "https://www.earthquakecountry.org", "The Seven Steps to Earthquake Safety and bedside kits."],
      ["Earthquake Brace + Bolt", "https://www.earthquakebracebolt.com", "Retrofit grants for older houses."],
    ],
  },
  {
    group: "Neighbors and community",
    links: [
      ["SF NERT", "https://sf-fire.org/nert", "San Francisco's free neighborhood emergency response training."],
      ["Oakland CORE", OAKLAND_CORE.url, "Oakland's free emergency preparedness and response classes."],
      ["Map Your Neighborhood", "https://sf-fire.org/nert/map-your-neighborhood", "A short guide to getting your block ready together."],
      ["FEMA: CERT", "https://www.fema.gov/emergency-managers/individuals-communities/preparedness-activities-webinars/community-emergency-response-team", "Free community emergency response training, offered across the Bay Area."],
      ["Listos California block party", "https://www.listoscalifornia.org/blockparty/", "A kit for getting to know your neighbors and planning together."],
      ["Klinenberg on the 1995 Chicago heat wave", "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9255631/", "Neighborhoods where people knew each other had far fewer deaths."],
    ],
  },
  {
    group: "Power and access needs",
    links: [
      ["PG&E outage alerts", "https://www.pge.com/addressalert", "Get warnings before planned shutoffs. No PG&E account needed."],
      ["PG&E Medical Baseline", "https://www.pge.com/en/account/billing-and-assistance/financial-assistance/medical-baseline-program.html", "For people who rely on powered medical devices."],
      ["PG&E DDAR program", "https://www.pge.com/ddar", "Backup batteries and support for people with disabilities during shutoffs."],
      ["Ready.gov: People with disabilities", "https://www.ready.gov/disability", "Planning for access and functional needs."],
      ["Ready.gov: Pets", "https://www.ready.gov/pets", "Kits and plans for animals."],
    ],
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-6 sm:px-6">
      <h1 className="text-[2.2rem] font-extrabold leading-tight tracking-[-0.025em]">Where this comes from</h1>
      <div className="mt-4 max-w-[64ch] space-y-4 text-lg text-ink-soft">
        <p>
          The lists here are built from public guidance by Bay Area counties, water utilities, the State of
          California, FEMA, and the CDC. When agencies disagree, we say so and pick the more careful number. For
          example, Bay Area agencies recommend about a week of water at home, while FEMA says at least 3 days. We
          use a week.
        </p>
        <p>
          <span className="font-semibold text-ink">Why neighbors are on the list.</span> After the 1995 Kobe
          earthquake, most people pulled from the rubble were saved by family and neighbors, not rescue crews. In
          Chicago&apos;s 1995 heat wave, neighborhoods where people knew each other had far fewer deaths. Supplies
          matter. So do the people around you.
        </p>
        <p>
          Prices are rough estimates to help you plan, not quotes. Nothing you enter leaves your browser. Your
          answers are saved on this device, and share links carry them in the link itself.
        </p>
      </div>
      {SOURCES.map((s) => (
        <section key={s.group} className="mt-12">
          <h2 className="border-b-2 border-ink pb-1 text-xl font-extrabold tracking-tight">{s.group}</h2>
          <ul className="divide-y divide-line">
            {s.links.map(([name, url, desc]) => (
              <li key={url} className="py-3">
                <a href={url} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2">
                  {name}
                </a>
                <p className="mt-0.5 text-ink-soft">{desc}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
