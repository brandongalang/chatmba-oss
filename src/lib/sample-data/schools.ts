export interface SampleSchool {
  id: string;
  name: string;
  program: string;
  location: string;
  roundDeadline: string;
  notes: string;
}

export const sampleSchools: SampleSchool[] = [
  {
    id: "sample-northlake",
    name: "Northlake School of Management",
    program: "Full-time MBA",
    location: "Chicago, IL",
    roundDeadline: "2026-09-15",
    notes: "Sample school record for local demos. Replace with your own sourced school data."
  },
  {
    id: "sample-redwood",
    name: "Redwood Graduate School",
    program: "MBA",
    location: "Palo Alto, CA",
    roundDeadline: "2026-10-01",
    notes: "Includes a leadership essay and goals essay in the sample prompts."
  },
  {
    id: "sample-atlantic",
    name: "Atlantic Business Institute",
    program: "MBA",
    location: "Boston, MA",
    roundDeadline: "2027-01-05",
    notes: "Good for testing multi-school tracking and recommender planning."
  }
];

export const samplePrompts = [
  "What professional experience best explains why you are pursuing an MBA now?",
  "Describe a leadership moment that changed how you work with other people.",
  "What are your short-term and long-term goals, and how would this program help?"
];
