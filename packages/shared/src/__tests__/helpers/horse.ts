export type Horse = {
  id: number;
  name: string;
  slug: string;
};

export class FetchHorsesError extends Error {
  override cause?: unknown;
  constructor(message: string) {
    super(message);
    this.name = "FetchHorsesError";
  }
}

export const horses = [
  { id: 1, name: "Unicorn", slug: "🦄" },
  { id: 2, name: "Pegasus", slug: "🐴" },
  { id: 3, name: "Centaur", slug: "🐐" },
];
export async function fetchHorses(
  { error } = { error: false },
): Promise<Horse[]> {
  if (error) throw new FetchHorsesError("Failed to fetch horses");

  return horses;
}
