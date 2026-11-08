import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function pngSize(path: string) {
  const buf = readFileSync(path);
  expect(buf.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

describe("favicon files", () => {
  it("serves a real 32px PNG icon and a 180px Apple touch icon", () => {
    expect(pngSize("src/app/icon.png")).toEqual({ width: 32, height: 32 });
    expect(pngSize("src/app/apple-icon.png")).toEqual({ width: 180, height: 180 });
  });

  it("serves a real ICO, not a JPEG renamed as an icon", () => {
    const ico = readFileSync("public/favicon.ico");
    expect(ico.subarray(0, 4).toString("hex")).toBe("00000100");
    expect(ico.subarray(0, 3).toString("hex")).not.toBe("ffd8ff");
  });
});
