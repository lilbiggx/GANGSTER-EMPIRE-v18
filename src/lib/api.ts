import { useGame } from "../store/game";
import { RIVALS, DISTRICTS } from "../data/gameData";
import { genCrew, moveCash } from "../engine/gameEngine";

export const API = "/api";
let getter: (() => Promise<string | null>) | null = null;
export const setTokenGetter = (g: any) => {
  getter = g;
};

// Generates local mock PvP rivals in the player's power band
export function getLocalPvPOpponents(playerPower: number) {
  const minPow = Math.max(10, Math.floor(playerPower * 0.85));
  const maxPow = Math.floor(playerPower * 1.15);
  const names = ["Shatta Waleed", "Kpakpa Red", "Iron Kwame", "Mama Gold", "Ghost Fiifi", "Blade Selasi"];
  return names.map((name, i) => ({
    user_id: `pvp_opp_${i}`,
    name,
    district: DISTRICTS[i % DISTRICTS.length].id,
    power: Math.floor(minPow + Math.random() * (maxPow - minPow + 5)),
    bounty: Math.floor(5000 + Math.random() * 20000),
    level: Math.max(1, Math.floor(playerPower / 8)),
  }));
}

// Generates local mock mercenaries for hire
export function getLocalMercenaries() {
  const mercs = [genCrew("enforcer", 5), genCrew("hacker", 6), genCrew("driver", 4), genCrew("infiltrator", 5)];
  return mercs.map((m) => ({
    id: `merc_${m.id}`,
    crew: m,
    rent_clean: 1200 + m.lvl * 300,
    dur_h: 6,
    owner_name: "Street Syndicate",
  }));
}

// In-memory mock market state for rental persistence during test session
let localMarketListings = [
  {
    id: "m_merc_1",
    crew: { name: "Kofi Wire", arch: "hacker", lvl: 4, owner_name: "Tema Syndicate" },
    price: 1500,
    hours: 4,
  },
  {
    id: "m_merc_2",
    crew: { name: "Selasi Speed", arch: "driver", lvl: 5, owner_name: "Osu Boys" },
    price: 2200,
    hours: 6,
  },
  {
    id: "m_merc_3",
    crew: { name: "Big Hammer", arch: "enforcer", lvl: 6, owner_name: "Nima Cartel" },
    price: 3400,
    hours: 8,
  },
  {
    id: "m_merc_4",
    crew: { name: "Shadow Akua", arch: "infiltrator", lvl: 5, owner_name: "Cantonments Shadow" },
    price: 2800,
    hours: 4,
  },
];

let playerMarketListings: Array<{
  id: string;
  crew_id: string;
  crew: { name: string; arch: string; lvl: number; owner_name: string };
  price: number;
  hours: number;
  status: "open" | "rented";
  end: number;
}> = [];

// Local mock API client that resolves offline requests seamlessly
export const api = {
  get: async (url: string, config?: any) => {
    const game = useGame.getState();
    if (url === "/config") {
      return { data: game.config };
    }
    if (url === "/state") {
      return {
        data: {
          player: game.player,
          derived: game.derived,
          news: game.news,
          server_time: Date.now() / 1000,
          welcome: null,
        },
      };
    }
    if (url.includes("/market")) {
      const p = game.player;
      const myListings = (p?.rentals || []).map((r) => ({
        id: r.id,
        crew_id: r.crew_id,
        crew: { name: r.crew_name, arch: r.arch, lvl: r.lvl, owner_name: p?.name || "You" },
        price: r.price,
        hours: r.hours,
        status: r.status,
        end: r.end,
      }));
      return {
        data: {
          listings: localMarketListings,
          mine: myListings,
        },
      };
    }
    if (url.includes("/season")) {
      const ends = Math.floor(Date.now() / 1000) + 86400 * 20;
      const turf = DISTRICTS.map((d, i) => {
        const bosses = ["Alhaji Simba", "Madam Silk", "Nii Kpakpa", "Iron Kwame", "Shatta Waleed", "Mama Gold"];
        return {
          id: d.id,
          name: d.name,
          boss: bosses[i % bosses.length],
          share: Math.floor(100 / DISTRICTS.length),
        };
      });
      return {
        data: {
          season: "2026-11",
          ends,
          turf,
        },
      };
    }
    if (url.includes("/pvp/targets") || url.includes("/pvp")) {
      const pow = game.derived?.power || 50;
      const targets = getLocalPvPOpponents(pow);
      return {
        data: {
          targets,
          my_power: pow,
          cooldown_until: game.player?.pvp_cd || 0,
        },
      };
    }
    if (url.includes("/leaderboard")) {
      const p = game.player;
      const myDistrict = p?.district || "osu";
      const myNw = Number(p?.clean || 0) + Number(p?.dirty || 0) + (p?.level || 1) * 2000;
      const myRank = 3;

      const rows = [
        { rank: 1, name: "Alhaji Simba (Zongo Lions)", level: 25, district: "zongo", prestige: { count: 3 }, nw_score: 1850000, season: { points: 9400 }, me: false },
        { rank: 2, name: "Madam Silk (Osu Syndicate)", level: 22, district: "osu", prestige: { count: 2 }, nw_score: 1420000, season: { points: 7600 }, me: false },
        { rank: 3, name: p?.name || "You", level: p?.level || 1, district: myDistrict, prestige: p?.prestige || { count: 0 }, nw_score: myNw, season: p?.season || { points: 400 }, me: true },
        { rank: 4, name: "Nii Kpakpa (Dockside Crew)", level: 18, district: "dockside", prestige: { count: 1 }, nw_score: 890000, season: { points: 5100 }, me: false },
        { rank: 5, name: "Iron Kwame (Circle Kings)", level: 15, district: "circle", prestige: { count: 1 }, nw_score: 640000, season: { points: 3800 }, me: false },
        { rank: 6, name: "Ghost Fiifi (Cantonments Shadow)", level: 12, district: "cantonments", prestige: { count: 0 }, nw_score: 410000, season: { points: 2900 }, me: false },
        { rank: 7, name: "Mama Gold (Airport Connect)", level: 10, district: "airport", prestige: { count: 0 }, nw_score: 280000, season: { points: 1950 }, me: false },
      ];

      return {
        data: {
          rows,
        },
      };
    }
    if (url.includes("/analytics/retention")) {
      return {
        data: {
          players: 12480,
          d1: { pct: 68 },
          d7: { pct: 44 },
          d30: { pct: 28 },
        },
      };
    }
    return { data: {} };
  },

  post: async (url: string, body?: any) => {
    const game = useGame.getState();
    const now = Math.floor(Date.now() / 1000);

    if (url === "/player") {
      game.createOfflineBoss(body.name, body.district, "newbie");
      return { data: { ok: true, player: useGame.getState().player } };
    }

    if (url === "/market/list") {
      const { crew_id, price, hours } = body;
      const p = game.player;
      if (p) {
        const c = p.crew.find((x) => x.id === crew_id);
        if (c) {
          if (!p.rentals) p.rentals = [];
          c.assign = "listed";
          const listing = {
            id: `my_listing_${Date.now()}`,
            crew_id: c.id,
            crew_name: c.name,
            arch: c.arch,
            lvl: c.lvl,
            price: Number(price),
            hours: Number(hours),
            start: now,
            end: now + Number(hours) * 3600,
            status: "open" as const,
          };
          p.rentals.push(listing);
          p.log.unshift({
            t: now,
            msg: `Listed ${c.name} on the Mercenary Market for GH₵${Number(price).toLocaleString()} (${hours}h contract).`,
            kind: "info",
          });
          game.save();
        }
      }
      return {
        data: {
          ok: true,
          patch: useGame.getState().player,
          derived: useGame.getState().derived,
        },
      };
    }

    if (url === "/market/rent") {
      const { listing_id } = body;
      const idx = localMarketListings.findIndex((x) => x.id === listing_id);
      if (idx !== -1) {
        const l = localMarketListings[idx];
        const p = game.player;
        if (p) {
          if (BigInt(p.dirty) < BigInt(l.price)) {
            return { data: { ok: false, error: "Not enough dirty cedis to rent mercenary" } };
          }
          moveCash(p, now, "dirty", -Number(l.price), "Crew & wages", `Rented mercenary ${l.crew.name}`);
          const hiredMerc = genCrew(l.crew.arch as any, l.crew.lvl);
          hiredMerc.name = l.crew.name;
          hiredMerc.merc = true;
          hiredMerc.merc_until = now + l.hours * 3600;
          p.crew.push(hiredMerc);
          localMarketListings.splice(idx, 1);
          p.log.unshift({
            t: now,
            msg: `Hired mercenary ${hiredMerc.name} (${hiredMerc.arch.toUpperCase()}, Lv ${hiredMerc.lvl}) for ${l.hours} hours!`,
            kind: "good",
          });
          game.save();
        }
      }
      return {
        data: {
          ok: true,
          patch: useGame.getState().player,
          derived: useGame.getState().derived,
        },
      };
    }

    if (url === "/market/cancel") {
      const { listing_id } = body;
      const p = game.player;
      if (p && p.rentals) {
        const idx = p.rentals.findIndex((x) => x.id === listing_id);
        if (idx !== -1) {
          const l = p.rentals[idx];
          const c = p.crew.find((x) => x.id === l.crew_id);
          if (c) c.assign = null;
          p.rentals.splice(idx, 1);
          p.log.unshift({ t: now, msg: `Cancelled mercenary rental listing for ${l.crew_name}.`, kind: "info" });
          game.save();
        }
      }
      return {
        data: {
          ok: true,
          patch: useGame.getState().player,
          derived: useGame.getState().derived,
        },
      };
    }

    if (url === "/actions") {
      const results: any[] = [];
      const actions = body?.actions || [];
      for (const a of actions) {
        const id = a.id;
        try {
          game.act(a.type, a.payload);
          results.push({ id, ok: true });
        } catch (err: any) {
          results.push({ id, ok: false, error: err.message });
        }
      }
      return {
        data: {
          patch: useGame.getState().player,
          derived: useGame.getState().derived,
          server_time: now,
          results,
        },
      };
    }

    if (url.includes("/pvp/attack") || url.includes("/pvp/fight")) {
      const targetName = body?.target_name || "Street Syndicate Rival";
      // v9 fix: Turf PvP is a real engine action (it used to pay out through the dev_add_cash cheat, which a
      // release build rejects, so wins paid nothing). Loot is booked under "Fights & rivals" in the ledger.
      let out: any = null;
      if (game.player) game.act("pvp_attack", { target_name: targetName, power: game.derived?.power || 50 }, { onResult: (r: any) => { out = r; } });
      if (!out) throw new Error("Your crew is still regrouping");
      const { won, loot, my_power: pow, opp_power: oppPower } = out;

      return {
        data: {
          ok: true,
          patch: useGame.getState().player,
          derived: useGame.getState().derived,
          result: {
            won,
            loot,
            target: targetName,
            my_power: pow,
            opp_power: oppPower,
          },
        },
      };
    }
    return { data: { ok: true } };
  },

  put: async () => ({ data: { ok: true } }),
  delete: async () => ({ data: { ok: true } }),
};

export const errMsg = (e: any) =>
  e?.response?.data?.detail || e?.message || "Something went wrong";
