import { formatCurrency } from "#/utils/currency";
import { describe, expect, it } from "bun:test";

describe("💰 Currency", () => {
  it("💵 Should format currency correctly with default options", () => {
    const formatted = formatCurrency(1234.56, "km-KH");
    expect(formatted).toBe("1.234,56៛");
  });

  it("💶 Should format currency correctly with custom locale and currency", () => {
    const formatted = formatCurrency(1234.56, "en-US", { currency: "USD" });
    expect(formatted).toBe("$1,234.56");
  });
});
