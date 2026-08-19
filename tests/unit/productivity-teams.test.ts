import { describe, it, expect } from "vitest";
import { splitIntoTeams } from "@/lib/productivity/teams";

describe("splitIntoTeams", () => {
  it("splits names into the requested number of teams", () => {
    const teams = splitIntoTeams(["a", "b", "c", "d", "e", "f"], 2);
    expect(teams).toHaveLength(2);
    expect(teams.flat().sort()).toEqual(["a", "b", "c", "d", "e", "f"]);
  });

  it("distributes as evenly as possible when not divisible", () => {
    const teams = splitIntoTeams(["a", "b", "c", "d", "e"], 2);
    const sizes = teams.map((t) => t.length).sort();
    expect(sizes).toEqual([2, 3]);
  });

  it("clamps team count to at least 1", () => {
    const teams = splitIntoTeams(["a", "b"], 0);
    expect(teams).toHaveLength(1);
  });

  it("clamps team count to the number of names", () => {
    const teams = splitIntoTeams(["a", "b"], 10);
    expect(teams).toHaveLength(2);
  });
});
