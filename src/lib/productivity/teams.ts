import { shuffle } from "@/lib/productivity/raffle";

/** Randomly splits a list of names into `teamCount` teams, distributed as evenly as possible. */
export function splitIntoTeams(names: string[], teamCount: number): string[][] {
  const count = Math.max(1, Math.min(teamCount, names.length || 1));
  const shuffled = shuffle(names);
  const teams: string[][] = Array.from({ length: count }, () => []);
  shuffled.forEach((name, i) => {
    teams[i % count].push(name);
  });
  return teams;
}
