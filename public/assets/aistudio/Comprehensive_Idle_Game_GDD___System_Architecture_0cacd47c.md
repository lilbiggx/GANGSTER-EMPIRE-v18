# Comprehensive Game Design Document (GDD) & System Architecture
## Title: Project Empire: Asynchronous Syndicate & Resource Management

---

## 1. Executive Summary & Core Retention Philosophy

### 1.1 High-Level Concept
**Project Empire** is an asynchronous, low-interaction idle strategy game designed for mobile devices. It eliminates mindless screen tapping and battery-draining real-time graphics in favor of **deep systemic interplay, emergent storytelling, and high-stakes executive decision-making**. 

The player assumes the role of an elusive **Syndicate Architect**. You do not hammer nails or fight in the streets; you design the machine, hire the specialists, set the operational rules, place your bets on the underworld economy, and close the app. 

### 1.2 The "Why Players Return" Hook (The Morning Newspaper Effect)
In most idle games, players return only to watch a number go up. In **Project Empire**, players return because **curiosity demands it**. While the player is away, their automated systems collide with a living, simulated underworld. Returning to the game feels like opening a personalized morning briefing filled with suspense:
* *"Did my high-stakes Smuggling Run slip past the Sector 4 blockade, or did my Enforcer have to burn our bribes?"*
* *"Did Vance and Kaelen finally settle their blood feud in the Foundry, or did they trigger a work stoppage?"*
* *"Did the underground fighting pit wager I placed before bed pay out at $4.5\times$, or did the rival syndicate rig the match?"*

### 1.3 The Three Tiers of Engagement
1. **Passive Engagement (The Engine):** Facilities refine goods, launder funds, and gather intel; crew members build skills, form relationships, and accumulate stress; territories shift in heat and control—all calculated deterministically while the app is closed.
2. **Strategic Engagement (The Blueprint):** Players log in for 3–5 minutes to reconfigure facility supply chains, tweak IF/THEN crisis doctrines, rotate stressed crew, invest in tech trees, and place calculated wagers on upcoming asynchronous events.
3. **Occasional Engagement (The Executive Ruling):** Upon login, the simulation pauses at high-stakes narrative crossroads ("Dilemmas") discovered while offline. The player makes a single, decisive ruling that permanently alters crew traits, territory control, or syndicate wealth.

---

## 2. System 1: Autonomous Base & Supply Chain Engine

### 2.1 Multi-Stage Supply Chains (Beyond Simple Generators)
To make base management deeply engaging without requiring active tapping, facilities are linked in **Autonomous Supply Chains**. Players must balance bottlenecks:
1. **Extraction Facilities (e.g., Scrap Yards, Chemical Siphons):** Generate **Raw Contraband** at a steady rate.
2. **Refinement Labs (e.g., Synth-Forges, Data Decryptors):** Consume Raw Contraband to produce **High-Value Assets**. If Extraction is too slow, Labs sit idle. If Extraction is too fast, storage caps overflow and attract "Heat."
3. **Front Businesses (e.g., Nightclubs, Logistics Hubs):** Consume High-Value Assets and convert them into **Clean Credits** and **Syndicate Influence**.

### 2.2 Facility Synergy & Adjacency Matrix
Facilities are placed on a $3 \times 4$ modular grid inside the Syndicate HQ. Adjacent rooms create passive systemic interactions:
* **Positive Synergy:** Placing a *Med-Bay* adjacent to a *Heavy Foundry* reduces crew stress accumulation in the Foundry by $-25\%$.
* **Negative Friction:** Placing a *High-Volume Smuggling Dock* next to an *Executive Safehouse* increases the base's overall **Security Heat** by $+15\%$ per hour.

### 2.3 Deterministic Offline Math & Bottleneck Resolution
Because no client-side ticks occur while the app is closed, the server resolves multi-stage supply chains in a single mathematical pass upon reconnection using elapsed time ($T_{delta}$):

$$\text{Effective } T = \min(T_{delta}, T_{cap})$$

$$\text{Raw Output } (O_{raw}) = \left( \frac{\text{Effective } T}{3600} \right) \times R_{extract} \times M_{tier} \times \left(1 + \sum S_{crew}\right) \times (1 - P_{heat})$$

$$\text{Refined Output } (O_{ref}) = \min\left( \text{Available Raw} + O_{raw}, \left( \frac{\text{Effective } T}{3600} \right) \times R_{consume} \right) \times \text{Conversion Ratio}$$

* **Concrete Calculation Example:**
  * **Offline Time ($T_{delta}$):** $28,800$ seconds ($8$ hours). Storage cap ($T_{cap}$) is $12$ hours ($43,200$ seconds).
  * **Extractor Setup:** Tier 2 Chemical Siphon ($R_{extract} = 100\text{ units/hr}$, $M_{tier} = 1.25$) with Crew Bonus $\sum S_{crew} = 0.20$ and Heat Penalty $P_{heat} = 0.05$.
  * **Step 1 (Raw Generation):** $8 \times 100 \times 1.25 \times 1.20 \times 0.95 = 1,140\text{ Raw Chemicals}$.
  * **Step 2 (Refinement Check):** The linked Synth-Lab can process $120\text{ Raw Chemicals/hr}$ ($8 \times 120 = 960\text{ max capacity}$). Since $1,140 > 960$, the Lab runs at $100\%$ capacity, converting $960$ Raw Chemicals into **480 Refined Stims** (at a $2:1$ ratio), leaving $180$ Raw Chemicals in storage.

### 2.4 Facility Data Schema (JSON)
```json
{
  "facility_id": "fac_synth_lab_02",
  "type": "refinement_lab",
  "grid_position": { "row": 1, "col": 2 },
  "tier": 2,
  "input_resource": "raw_chemicals",
  "output_resource": "refined_stims",
  "hourly_consumption_rate": 120,
  "conversion_ratio": 0.5,
  "assigned_crew_ids": ["crew_042", "crew_088"],
  "active_adjacency_bonuses": ["adj_cooling_vents_v1"],
  "last_sync_timestamp": 1772671440
}
```

---

## 3. System 2: Emergent Crew & Relationship Engine

### 3.1 Deep Crew Personalities & Hidden Agendas
Crew members are not static stat-sticks; they are autonomous agents with **Archetypes, Quirks, and Relationship Affinity**. This creates an ever-evolving "soap opera" inside the player's empire.
* **Core Roles:**
  * *Enforcers:* Suppress facility Heat, protect turf, and excel in aggressive expeditions.
  * *Technicians:* Boost refinement conversion ratios and prevent equipment breakdowns.
  * *Fixers:* Increase Clean Credit laundering rates and improve betting odds through insider intel.
* **Dynamic Trait Evolution:** If a crew member survives three high-heat lockouts, they may organically gain the `Ice-Veined` trait ($+15\%$ efficiency during crises). Conversely, if left at $100\%$ stress for over 12 hours, they develop `Paranoid` (randomly accuses co-workers of theft, halting room production).

### 3.2 The Chemistry Matrix (Mentors, Lovers, Rivals, Snitches)
Every hour two crew members spend assigned to the same facility, the server increments their **Shared History Counter** and rolls against their personality tags:
* **Blood Rivalry:** Two crew members with `Alpha` traits clash. While working together, they generate $+20\%$ output out of spite, but add $+10$ Stress/hr and have a $5\%$ chance per offline cycle to trigger a **Sabotage Event**.
* **Trusted Partners:** Two compatible crew members form a bond, granting an automatic $+12\%$ synergy bonus and sharing stress loads evenly.
* **The Undercover Mole (High-Tension Mechanic):** Newly recruited high-stat crew members carry a small hidden probability of being a rival informant or federal mole. Fixing a `Mole` requires assigning a high-perception *Fixer* to the Counter-Intelligence room to passively audit personnel files while the player is offline.

### 3.3 Pre-Programmed Crisis Doctrines (IF/THEN Automation)
To keep interaction low while maximizing strategic agency, players configure **Standing Orders (Doctrines)** before closing the app. When a crisis occurs at 3:00 AM while the player is asleep, the system consults the player's Doctrine:

| Crisis Trigger | Doctrine Option A: "Iron Fist" | Doctrine Option B: "Silver Tongue" | Doctrine Option C: "Ghost Protocol" |
| :--- | :--- | :--- | :--- |
| **Police/Rival Raid on Facility** | Enforcers fight back. $0\%$ resource loss, high risk of Crew Injury. | Automatically deduct up to $2,500$ Credits from Vault as a bribe. | Shut down facility for $4$ hours; dump $50\%$ of current uncollected batch. |
| **Crew Stress Hits $100\%$** | Force overtime ($+10\%$ output, $25\%$ chance crew member quits or snaps). | Auto-bench crew member to Lounge and pull healthiest reserve from bench. | Inject Stim-Packs (Consumes $10$ Stims, resets Stress to $50$, adds `Addicted` risk). |

---

## 4. System 3: Asynchronous Territory & Underworld Map

### 4.1 District Control & The "Heat" Economy
The city is divided into **7 Distinct Districts** (e.g., *The Neon Docks, Foundry Row, High-Rise Financial*). Players send autonomous operations into districts to claim **Turf Influence**.
* **Passive Turf Dividends:** Controlling $>50\%$ of a district unlocks unique passive global buffs (e.g., controlling *The Neon Docks* increases offline storage caps by $+6$ hours across all facilities).
* **The Heat Meter ($0\% - 100\%$):** Aggressive resource extraction and turf expansion generate **Heat**. 
  * **Low Heat ($0\% - 30\%$):** Smooth operations; bonus to front-business laundering.
  * **High Heat ($70\%+$):** Triggers aggressive asynchronous events (Supply Blockades, Asset Freezes, Rival Hit Squads) resolved against your standing Doctrines upon login.

### 4.2 Timed Operations & Multi-Stage Expeditions ("Heists")
Players can prep and launch **Grand Heists**—24-hour multi-stage operations that play out while the app is closed.
1. **Preparation Phase (Active - 2 Mins):** Select target (e.g., *Orbital Casino Vault*), assign a 4-person crew (1 Fixer, 1 Hacker, 2 Enforcers), and allocate upfront equipment funding.
2. **Execution Phase (Offline - 8 to 24 Hours):** The server simulates three checkpoints (Infiltration $\rightarrow$ Vault Breach $\rightarrow$ Extraction) at 4-hour intervals.
3. **The Return Reveal:** When the player opens the app, the Heist Playback Log reveals how their crew's specific traits interacted with each checkpoint, culminating in a massive atomic loot drop.

---

## 5. System 4: The Underground Wagering & Speculation Exchange

To satisfy the requirement for atomic betting and high-excitement returns, the game features the **Shadow Exchange**—an asynchronous wagering hub where players risk Clean Credits on simulated underworld outcomes.

### 5.1 Three Pillars of Asynchronous Wagering
1. **The Pit (Automated Combat Leagues):**
   * Every 6 hours, simulated 1v1 and 3v3 combat matches take place between AI syndicates (or asynchronous snapshots of other players' Enforcers).
   * Players inspect fighter stats, injury histories, and arena modifiers before closing the app, placing wagers on Moneyline, Round Under/Over, or First Blood.
2. **Contraband Futures Market (Resource Speculation):**
   * World events shift the street value of Refined Goods every 8 hours (e.g., *"Port Authority Strike causes Refined Stims value to surge $+180\%$!"*).
   * Players can hold goods in vaults or buy "Short/Long Contracts" before going to sleep, cashing out when the market settles.
3. **Heist Insurance & Syndicate Backing:**
   * Players can place side-bets on the success or failure of global community milestones or high-risk NPC cartel convoys.

---

## 6. System 5: Atomic Transaction & Economic Integrity Engine

### 6.1 Zero-Trust ACID Settlement Architecture
Because players accumulate offline resources, resolve multi-stage heists, and settle high-payout wagers simultaneously upon login, the backend enforces strict **Atomic Resolution** to eliminate race conditions, packet-replay exploits, or double-payouts.

```
[Client App Boots] 
       │
       ├── Generates UUID v4 Idempotency Key
       ▼
[POST /api/v1/session/reconcile]
       │
       ▼
[Redis Lock Manager] ──► (If Lock Exists: Reject Concurrent Request)
       │
       ▼
[PostgreSQL Transaction Block: BEGIN ISOLATION LEVEL SERIALIZABLE]
       ├── 1. Verify Idempotency Key in `processed_transactions`
       ├── 2. Lock Player Wallet & Facility Rows (`SELECT ... FOR UPDATE`)
       ├── 3. Compute $T_{delta}$ Supply Chain Yields & Deduct Upkeep
       ├── 4. Evaluate Pending Wagers against Immutable Match Seed Results
       ├── 5. Write Cryptographic Hash Entry to `immutable_audit_ledger`
       ├── 6. Update Player Balances & Advance `last_sync_timestamp`
[COMMIT TRANSACTION]
       │
       ▼
[Return Consolidated Session Briefing JSON to Client]
```

### 6.2 Concrete Atomic Ledger Schema (JSON)
```json
{
  "transaction_id": "txn_99481a_f82c",
  "idempotency_key": "550e8400-e29b-41d4-a716-446655440000",
  "player_id": "plr_syndicate_77",
  "timestamp_utc": 1772703840,
  "previous_ledger_hash": "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
  "mutations": [
    { "source": "idle_production", "asset": "clean_credits", "delta": 14250 },
    { "source": "doctrine_bribe_auto", "asset": "clean_credits", "delta": -1500 },
    { "source": "pit_wager_win_match_402", "asset": "clean_credits", "delta": 8000 }
  ],
  "final_balances": {
    "clean_credits": 84750,
    "refined_stims": 620
  }
}
```

---

## 7. System 6: Retention Loops & The "Return" UX Pipeline

### 7.1 The 3-Minute Executive Session Flow
To respect the player's time and mobile battery while maximizing satisfaction, every login follows a tight, rewarding UX cadence:
* **0:00 – 0:45 (The Briefing Reveal):** The app opens to a sleek, tactile "Executive Dossier." Ticker numbers roll up for Clean Credits earned, followed by an interactive timeline showing how your standing Doctrines handled overnight threats and how your Pit Wagers resolved.
* **0:45 – 1:45 (The Executive Dilemma):** One high-impact narrative event awaits your personal signature (see 7.2 below).
* **1:45 – 3:00 (Strategic Re-Alignment):** Collect heist loot, swap fatigued crew into the Recovery Lounge, upgrade a bottlenecked Refinery, place a new wager on the next Pit match, and close the app.

### 7.2 Interactive Login Dilemma Example
Instead of mindless tapping, the player is presented with a rich strategic choice generated from their offline simulation:

> **EXECUTIVE ALERT: THE DOCKS INTERCEPTION**  
> *At 04:12 AM, Enforcer 'Sledge' intercepted a corrupt customs official skimming $15\%$ off Facility Alpha's output. Because your Doctrine was set to 'Hold for Executive Ruling', Sledge has the official locked in the freezer.*
> * **Choice A [Execute & Make an Example]:** District Heat increases by $+20\%$, but all Enforcers gain $+15\%$ Efficiency for the next 24 hours.
> * **Choice B [Flip Him onto the Payroll]:** Costs $3,000$ Clean Credits immediately, but permanently unlocks the *Customs Insider* modifier ($+10\%$ Smuggling Dock capacity).
> * **Choice C [Hand Him to Rival Cartel as a Peace Offering]:** Resets Sector 4 Rival Aggression to $0\%$ and grants $+50$ Syndicate Influence.

### 7.3 Long-Term Meta-Progression ("The Escape / Prestige Loop")
To keep players engaged for months:
* **The Federal Indictment Meter:** As your syndicate grows massive, a long-term **Federal Case File** slowly builds against your current identity over weeks of real time.
* **The "Burn & Relocate" Prestige:** Before the Feds reach $100\%$ and raid your empire, you can trigger **The Ghost Protocol**. You liquidate your physical facilities into **Offshore Bearer Bonds** (permanent meta-currency), pick 2 of your most loyal veteran Crew Members to take into hiding with you, and start a new Syndicate in a higher-tier city with permanent global multipliers and new black-market tech trees.

---

## 8. Complete Login Sync Payload Example (Client-Server Contract)

When the player opens the app, this single payload drives the entire UI without requiring further network chatter:

```json
{
  "sync_status": "atomic_commit_verified",
  "offline_duration_seconds": 32400,
  "executive_briefing": {
    "net_credits_delta": 20750,
    "supply_chain_summary": {
      "raw_chemicals_extracted": 1140,
      "refined_stims_produced": 480,
      "bottleneck_warning": "Extractor Alpha exceeded Lab 02 capacity by 180 units."
    },
    "doctrine_interventions": [
      {
        "timestamp_offset": 14200,
        "trigger": "Sector 2 Police Sweep",
        "doctrine_executed": "Silver Tongue (Auto-Bribe)",
        "cost": 1500,
        "result": "Zero production downtime; Heat reduced by 10%."
      }
    ],
    "crew_drama_logs": [
      {
        "crew_ids": ["crew_042", "crew_088"],
        "event": "Shared shift in Synth-Lab 02 sparked 'Trusted Partners' bond (+12% Output)."
      }
    ],
    "wagering_settlements": [
      {
        "wager_id": "bet_pit_901",
        "event_name": "Ironclad vs. Viper (Underground Pit)",
        "wager_placed": 2000,
        "odds": 4.0,
        "outcome": "WIN",
        "atomic_payout": 8000
      }
    ],
    "pending_executive_dilemma": {
      "dilemma_id": "dil_customs_skim_04",
      "title": "The Docks Interception",
      "choices": ["opt_execute", "opt_flip_payroll", "opt_rival_peace"]
    }
  }
}
```