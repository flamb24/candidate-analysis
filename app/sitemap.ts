import type { MetadataRoute } from "next";
import { getAllDistricts } from "@/lib/data";

const BASE = "https://distrett.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const districts = getAllDistricts();

  const static_routes: MetadataRoute.Sitemap = [
    { url: BASE,                        priority: 1.0, changeFrequency: "weekly" },
    { url: `${BASE}/districts`,         priority: 0.9, changeFrequency: "weekly" },
    { url: `${BASE}/districts/all`,     priority: 0.8, changeFrequency: "weekly" },
    { url: `${BASE}/mt`,                priority: 0.9, changeFrequency: "weekly" },
    { url: `${BASE}/mt/districts`,      priority: 0.8, changeFrequency: "weekly" },
    { url: `${BASE}/mt/districts/all`,  priority: 0.7, changeFrequency: "weekly" },
  ];

  const district_routes: MetadataRoute.Sitemap = districts.flatMap((d) => [
    {
      url: `${BASE}/district/${d.number}`,
      priority: 0.8,
      changeFrequency: "monthly" as const,
    },
    {
      url: `${BASE}/mt/district/${d.number}`,
      priority: 0.7,
      changeFrequency: "monthly" as const,
    },
  ]);

  const candidate_routes: MetadataRoute.Sitemap = districts.flatMap((d) =>
    d.candidates.flatMap((c) => {
      const slug = c.id.replace(/^\d+-/, "");
      return [
        {
          url: `${BASE}/district/${d.number}/${slug}`,
          priority: 0.7,
          changeFrequency: "monthly" as const,
        },
        {
          url: `${BASE}/mt/district/${d.number}/${slug}`,
          priority: 0.6,
          changeFrequency: "monthly" as const,
        },
      ];
    })
  );

  return [...static_routes, ...district_routes, ...candidate_routes];
}
