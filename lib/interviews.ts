export type InterviewFormat = "video" | "podcast" | "article";

export interface Interview {
  platform: string;
  description: string;
  url: string;
  format: InterviewFormat;
  date?: string;
}

// Keyed by candidate slug — same algorithm as parser.ts slugify:
// lowercase → NFD → strip combining marks → non-alphanumeric → "-"
const data: Record<string, Interview[]> = {
  "robert-abela": [
    {
      platform: "Times of Malta",
      description: "Construction, traffic, economy and election rumours",
      url: "https://www.youtube.com/watch?v=22S4xDpNWxs",
      format: "video",
      date: "Nov 2025",
    },
    {
      platform: "Robert Abela Official YouTube",
      description: "Speeches, press conferences and campaign content",
      url: "https://www.youtube.com/c/RobertAbelaMT",
      format: "video",
    },
    {
      platform: "MaltaToday",
      description: "Muscat legacy, DCG murder, Steward, abortion, environment",
      url: "https://www.maltatoday.com.mt/news/national/121996/interview_with_prime_minister_robert_abela_out_on_sunday_in_maltatoday",
      format: "article",
      date: "Mar 2023",
    },
  ],

  "alex-borg": [
    {
      platform: "Times Talk",
      description: "PN leadership race — Adrian Delia & Alex Borg (1 h 46 m)",
      url: "https://podcasts.apple.com/mt/podcast/adrian-delia-alex-borg/id1508197205?i=1000716608930",
      format: "podcast",
      date: "Jul 2025",
    },
    {
      platform: "Champions Connect Podcast",
      description: "Opens up on losing his father, doubters, and being a young leader",
      url: "https://lovinmalta.com/news/local/watch-alex-borg-opens-up-on-losing-his-father-facing-doubters-and-being-a-young-party-leader/",
      format: "video",
      date: "May 2026",
    },
    {
      platform: "Lovin Malta",
      description: "Plans new PN podcast if elected leader",
      url: "https://lovinmalta.com/news/watch-alex-borg-plans-new-pn-podcast-if-he-is-elected-leader/",
      format: "article",
      date: "Jul 2025",
    },
  ],

  "adrian-delia": [
    {
      platform: "Times Talk",
      description: "PN leadership race — Adrian Delia & Alex Borg (1 h 46 m)",
      url: "https://podcasts.apple.com/mt/podcast/adrian-delia-alex-borg/id1508197205?i=1000716608930",
      format: "podcast",
      date: "Jul 2025",
    },
    {
      platform: "Times Talk",
      description: "Delia & Attard clash — Vitals/hospitals arbitration (1 h 6 m)",
      url: "https://podcasts.apple.com/mt/podcast/watch-delia-and-attard-clash-in-fiery-times-talk-debate/id1508197205?i=1000736698511",
      format: "podcast",
      date: "Nov 2025",
    },
  ],

  "jonathan-attard": [
    {
      platform: "Times Talk",
      description: "Delia & Attard clash — Vitals/hospitals arbitration (1 h 6 m)",
      url: "https://podcasts.apple.com/mt/podcast/watch-delia-and-attard-clash-in-fiery-times-talk-debate/id1508197205?i=1000736698511",
      format: "podcast",
      date: "Nov 2025",
    },
    {
      platform: "MaltaToday",
      description: "Il-Kandidat — biographical profile interview",
      url: "https://www.maltatoday.com.mt/news/election-2022/115533/ilkandidat_jonathan_attard",
      format: "article",
      date: "Mar 2022",
    },
  ],

  "conrad-borg-manche": [
    {
      platform: "Jon Mallia Podcast",
      description: "\"I told Robert Abela he cannot tie a leash around my neck\"",
      url: "https://lovinmalta.com/news/watch-i-told-robert-abela-he-cannot-tie-a-leash-around-my-neck-conrad-borg-manche/",
      format: "podcast",
      date: "May 2024",
    },
    {
      platform: "Newsbook",
      description: "Former Labour mayor to contest with PN — crossover profile",
      url: "https://newsbook.com.mt/en/former-labour-mayor-conrad-borg-manche-to-contest-election-with-pn/",
      format: "article",
      date: "May 2026",
    },
  ],

  "bernard-grech": [
    {
      platform: "Times Talk",
      description: "PN at a crossroads — panel on Grech's resignation as leader (57 m)",
      url: "https://www.iheart.com/podcast/from-podnews-263315344",
      format: "podcast",
      date: "Jun 2025",
    },
    {
      platform: "MaltaToday",
      description: "A vision for new Malta — campaign interview",
      url: "https://www.maltatoday.com.mt/news/election-2022/13/",
      format: "article",
      date: "Mar 2022",
    },
  ],

  "miriam-dalli": [
    {
      platform: "Lovin Malta",
      description: "Slams PN energy proposals as \"full of basic mistakes\"",
      url: "https://lovinmalta.com/news/general-election-2026/watch-miriam-dalli-slams-pn-energy-proposals-as-full-of-basic-mistakes/",
      format: "video",
      date: "May 2026",
    },
  ],

  "franco-mercieca": [
    {
      platform: "MaltaToday",
      description: "Meet Your Candidate — Franco Mercieca",
      url: "https://www.maltatoday.com.mt/news/election-2026/141783/watch__meet_your_candidate__franco_mercieca",
      format: "video",
      date: "May 2026",
    },
  ],

  "albert-buttigieg": [
    {
      platform: "Lovin Malta",
      description: "Know Before You Vote — written Q&A profile",
      url: "https://lovinmalta.com/news/general-election-2026/know-before-you-vote-meet-albert-buttigieg/",
      format: "article",
      date: "May 2026",
    },
  ],

  "alicia-bugeja-said": [
    {
      platform: "Lovin Malta",
      description: "Know Before You Vote — written Q&A profile",
      url: "https://lovinmalta.com/news/general-election-2026/know-before-you-vote-meet-alicia-bugeja-said/",
      format: "article",
      date: "May 2026",
    },
  ],

  "bernice-bonello": [
    {
      platform: "Lovin Malta",
      description: "Know Before You Vote — written Q&A profile",
      url: "https://lovinmalta.com/news/general-election-2026/know-before-you-vote-meet-bernice-bonello/",
      format: "article",
      date: "May 2026",
    },
  ],
};

export function getCandidateInterviews(candidateId: string): Interview[] {
  const slug = candidateId.replace(/^\d+-/, "");
  return data[slug] ?? [];
}
