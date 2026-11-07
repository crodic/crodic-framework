import { describe, expect, it } from "vitest";
import { parseInitialQuery, serializeQueryTokens } from "./tag-tokens";

describe("Pixiv Boolean Tag Search Tokenizer", () => {
  it("parses AND, OR, and NOT (-exclude) tokens accurately", () => {
    const parsed = parseInitialQuery(
      "Landscape 葬送のフリーレン OR Cyberpunk -AI-Generated"
    );

    expect(parsed).toEqual([
      { mode: "and", value: "Landscape" },
      { mode: "or", value: "葬送のフリーレン" },
      { mode: "or", value: "Cyberpunk" },
      { mode: "not", value: "AI-Generated" },
    ]);
  });

  it("serializes structured tokens back into Pixiv boolean query syntax", () => {
    const serialized = serializeQueryTokens([
      { mode: "and", value: "Original" },
      { mode: "or", value: "Fantasy" },
      { mode: "or", value: "Sci-Fi" },
      { mode: "not", value: "AI-Generated" },
    ]);

    expect(serialized).toBe("Original Fantasy OR Sci-Fi -AI-Generated");
  });
});
