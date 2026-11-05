import { describe, expect, it } from "vitest";
import {
  KOREAN_PARTICLE_NAMES,
  KOREAN_PARTICLES,
  formatKoreanParticle,
  koreanParticle,
  localeParticle,
} from "../app/korean-particle.js";
import { I18nextAdapter } from "../i18next-adapter.js";
import { KOREAN_PARTICLE_VECTORS } from "./korean-particle.vectors.js";

const pairOf = (name: string) => {
  const pair = Object.values(KOREAN_PARTICLES).find(([a, b]) => `${a}/${b}` === name);
  if (pair === undefined) throw new Error(`no particle ${name}`);
  return pair;
};

describe("koreanParticle", () => {
  it.each(KOREAN_PARTICLE_VECTORS)("%s takes %s as %s", (word, name, expected) => {
    expect(word + koreanParticle(word, pairOf(name))).toBe(expected);
  });

  it("reads a number as its digits", () => {
    expect(koreanParticle(12, KOREAN_PARTICLES.object)).toBe("를");
    expect(koreanParticle(10, KOREAN_PARTICLES.toward)).toBe("으로");
  });

  it("takes the vowel form for a missing word", () => {
    expect(koreanParticle(null, KOREAN_PARTICLES.subject)).toBe("가");
    expect(koreanParticle(undefined, KOREAN_PARTICLES.toward)).toBe("로");
  });

  it("names every registered pair", () => {
    expect(KOREAN_PARTICLE_NAMES).toEqual(["이/가", "은/는", "을/를", "과/와", "으로/로", "이나/나", "이라고/라고"]);
  });
});

describe("localeParticle", () => {
  it("writes the particle in Korean and nothing elsewhere", () => {
    expect(localeParticle("ko", "Team", KOREAN_PARTICLES.with)).toBe("과");
    expect(localeParticle("ko-KR", "Pro", KOREAN_PARTICLES.with)).toBe("와");
    expect(localeParticle("en", "Pro", KOREAN_PARTICLES.with)).toBe("");
    expect(localeParticle(undefined, "Pro", KOREAN_PARTICLES.with)).toBe("");
  });
});

describe("formatKoreanParticle", () => {
  it.each(KOREAN_PARTICLE_VECTORS)("formats %s with %s as %s", (word, name, expected) => {
    expect(formatKoreanParticle(word, "ko", { [name]: Number.NaN })).toBe(expected);
  });

  it("returns the value alone outside Korean", () => {
    expect(formatKoreanParticle("Pro", "en", { "을/를": Number.NaN })).toBe("Pro");
  });

  it("refuses a format that names no registered particle, or more than one", () => {
    expect(() => formatKoreanParticle("Pro", "ko", { plan: "Pro" })).toThrow(/named none/);
    expect(() => formatKoreanParticle("Pro", "ko", { "를/을": Number.NaN })).toThrow(/named none/);
    expect(() => formatKoreanParticle("Pro", "ko", { "을/를": Number.NaN, "은/는": Number.NaN })).toThrow(/을\/를, 은\/는/);
  });

  it("keeps the particle when the call passes a value named like an option", () => {
    expect(formatKoreanParticle("Pro", "ko", { "을/를": Number.NaN, particle: "x", plan: "Pro" })).toBe("Pro를");
  });
});

describe("the josa format in a catalogue", () => {
  const adapter = () =>
    new I18nextAdapter({
      defaultLocale: "ko",
      fallbackLocale: "en",
      locales: [
        { code: "ko", name: "한국어", englishName: "Korean" },
        { code: "en", name: "English", englishName: "English" },
      ],
      resources: {
        ko: {
          account: {
            kept: "{{plan, josa(을/를)}} 계속 씁니다",
            switched: "오늘부터 {{plan, josa(으로/로)}} 바뀝니다. {{amount}}를 결제합니다.",
            pastDue: "그동안 {{plan, josa(은/는)}} 그대로 씁니다",
          },
        },
        en: { account: { kept: "You stay on {{plan}}" } },
      },
    });

  it("renders the value with the particle its last sound calls for", async () => {
    const i18n = adapter();
    await i18n.initialize();
    expect(i18n.tn("account", "kept", { plan: "Pro" })).toBe("Pro를 계속 씁니다");
    expect(i18n.tn("account", "kept", { plan: "Team" })).toBe("Team을 계속 씁니다");
    expect(i18n.tn("account", "switched", { plan: "Pro+", amount: "$12" })).toBe("오늘부터 Pro+로 바뀝니다. $12를 결제합니다.");
    expect(i18n.tn("account", "switched", { plan: "팀", amount: "$12" })).toBe("오늘부터 팀으로 바뀝니다. $12를 결제합니다.");
    expect(i18n.tn("account", "pastDue", { plan: "Pro", particle: "x" })).toBe("그동안 Pro는 그대로 씁니다");
  });

  it("leaves an English sentence as written", async () => {
    const i18n = adapter();
    await i18n.initialize();
    await i18n.setLocale("en");
    expect(i18n.tn("account", "kept", { plan: "Pro" })).toBe("You stay on Pro");
  });
});
