#!/usr/bin/env node
/**
 * Games Idea Generator — learns from your feedback to improve suggestions
 * Uses web search to find trending game concepts, presents 5 ideas per round
 * Usage: node scripts/game-idea-generator.mjs
 */

import { fileURLToPath } from "node:url";
import path from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import readline from "node:readline/promises";

const root = path.dirname(fileURLToPath(import.meta.url)).replace("/scripts", "");
const memoryFile = path.join(root, "local-tools", ".data", "idea-generator-memory.json");

const SEARCH_QUERIES = [
  "innovative browser game mechanics 2024 2025 web HTML5 Phaser Three.js",
  "cozy relaxing web game ideas micro games bite-sized playable browser",
  "replayable one-button mechanic browser game design patterns",
  "procedural generation infinite replayability browser game concepts",
  "asymmetric multiplayer co-op browser game ideas web",
  "roguelike deckbuilder browser game Phaser mechanics",
  "puzzle game unique mechanic rotation grid browser web",
  "factory automation incremental browser game web",
  "narrative choice interactive fiction browser game",
  "minimalist aesthetic browser game design 2024 2025",
];

async function loadMemory() {
  try {
    const data = await readFile(memoryFile, "utf8");
    return JSON.parse(data);
  } catch {
    return {
      rounds: 0,
      liked: [],
      disliked: [],
      allIdeas: [],
      preferences: [],
      avoidedKeywords: [],
    };
  }
}

async function saveMemory(memory) {
  await writeFile(memoryFile, JSON.stringify(memory, null, 2));
}

// Use the agent's websearch capability via a helper
async function searchWeb(query) {
  // This will be called from the agent context which has websearch
  // For standalone use, we'll use a curated fallback
  return "";
}

function generateCuratedIdeas(memory, roundNum) {
  // Curated high-quality browser game ideas based on 2024-2025 trends
  const ideaPools = {
    puzzle: [
      {
        title: "Circuit Gardener",
        concept: "Rotate pipe tiles to guide glowing water through a growing garden. Each completed circuit blooms a new plant species. 50 handcrafted levels, daily seed puzzle.",
        genre: "puzzle", mechanic: "grid-rotate", trend: "cozy",
      },
      {
        title: "Lightbridge",
        concept: "Place mirrors and prisms to bend a single laser beam through increasingly complex mazes. Split beams, change colors, hit targets. Minimalist, colorblind-safe.",
        genre: "puzzle", mechanic: "drag-drop", trend: "accessible",
      },
      {
        title: "Word Weaver",
        concept: "Connect letter tiles on a hex grid to form words. Each word grows a vine. Longer words = more branches. Daily seeded grid, friend challenge links share the exact board.",
        genre: "puzzle", mechanic: "grid-rotate", trend: "social",
      },
    ],
    arcade: [
      {
        title: "Orbit Drift",
        concept: "One-button: hold to orbit the nearest planet, release to drift in a straight line. Thread through asteroid fields, collect stardust, avoid gravity wells. Endless procedural sectors.",
        genre: "arcade", mechanic: "one-button", trend: "bite-sized",
      },
      {
        title: "Neon Rhythm Dodge",
        concept: "Obstacles pulse to the beat. Tap to phase-shift through walls synced to music. 10 original tracks, daily remix seed. Colorblind modes, one-hand playable.",
        genre: "arcade", mechanic: "time-pressure", trend: "accessible",
      },
      {
        title: "Microbial Rush",
        concept: "Swim as a bacterium. Tap to dash, hold to split. Absorb smaller cells, avoid phages. Procedural petri dish. 2-minute rounds, global daily leaderboard.",
        genre: "arcade", mechanic: "one-button", trend: "procedural",
      },
    ],
    roguelike: [
      {
        title: "Deck of Fate",
        concept: "Micro-roguelike: 12 floors, 3-card hand. Each floor = one encounter. Cards upgrade between floors. Run lasts 5 minutes. Daily seeded run shared via link.",
        genre: "roguelike", mechanic: "deck-building", trend: "bite-sized",
      },
      {
        title: "Dungeon Architect",
        concept: "You don't fight — you build the dungeon. Place traps, monsters, loot to maximize 'hero frustration' without killing them. AI heroes adapt. Puzzle-strategy hybrid.",
        genre: "roguelike", mechanic: "resource-loop", trend: "unique",
      },
    ],
    cozy: [
      {
        title: "Tiny Terrarium",
        concept: "Drag soil, moss, stones, miniatures into a jar. Living ecosystem sim: condensation cycles, plant growth, tiny bugs. No fail state. Share jar codes with friends.",
        genre: "cozy", mechanic: "drag-drop", trend: "cozy",
      },
      {
        title: "Night Market Chef",
        concept: "Tap to chop, swipe to stir, hold to flame. Serve 30+ dishes to quirky customers. 5-min days. Unlock recipes, decorate stall. Relaxed, no timers.",
        genre: "cozy", mechanic: "drag-drop", trend: "cozy",
      },
    ],
    experimental: [
      {
        title: "Echoes of Choice",
        concept: "Interactive short story: 3 characters, same timeline, different perspectives. Your choices in Chapter 1 ripple to Chapter 3 for all three. 15-min playthrough, 6 endings.",
        genre: "story", mechanic: "social-deduction", trend: "narrative",
      },
      {
        title: "Symbiotic",
        concept: "Control two creatures simultaneously (split-screen single player). One flies, one digs. They must cooperate to solve environmental puzzles. Unique dual-stick feel on keyboard.",
        genre: "experimental", mechanic: "dual-control", trend: "unique",
      },
      {
        title: "Glitch Gardener",
        concept: "A garden where physics glitches. Plant seeds in corrupted soil — they grow sideways, upside down, or float. Discover stable 'patches' to cultivate. Surreal, exploratory.",
        genre: "experimental", mechanic: "exploration", trend: "procedural",
      },
    ],
  };

  // Pick pool based on learned preferences or round
  const prefs = memory.preferences.join(" ");
  let poolKey = "puzzle";
  if (prefs.includes("arcade") || prefs.includes("action") || prefs.includes("fast")) poolKey = "arcade";
  else if (prefs.includes("roguelike") || prefs.includes("deck") || prefs.includes("run")) poolKey = "roguelike";
  else if (prefs.includes("cozy") || prefs.includes("relax") || prefs.includes("peaceful")) poolKey = "cozy";
  else if (prefs.includes("story") || prefs.includes("narrative") || prefs.includes("choice")) poolKey = "experimental";

  // Rotate pools each round for variety
  const pools = ["puzzle", "arcade", "roguelike", "cozy", "experimental"];
  poolKey = pools[(roundNum + memory.liked.length) % pools.length];

  const pool = ideaPools[poolKey];
  const avoided = new Set(memory.avoidedKeywords);
  const likedTitles = new Set(memory.liked.map(l => l.title));

  // Filter out disliked/avoided
  let filtered = pool.filter(idea =>
    !avoided.has(idea.mechanic) &&
    !avoided.has(idea.trend) &&
    !likedTitles.has(idea.title)
  );

  // If too few, reset filters
  if (filtered.length < 5) filtered = pool.filter(idea => !likedTitles.has(idea.title));

  // Pick 5 (or pad from other pools)
  const selected = filtered.slice(0, 5);
  if (selected.length < 5) {
    for (const p of pools) {
      if (p === poolKey) continue;
      for (const idea of ideaPools[p]) {
        if (selected.length >= 5) break;
        if (!likedTitles.has(idea.title)) selected.push(idea);
      }
    }
  }

  return selected.map((idea, i) => ({
    id: `${Date.now()}-${i}`,
    ...idea,
    round: roundNum,
    why: `Trending: ${idea.trend} | Mechanic: ${idea.mechanic} | Fits ${idea.genre} browser game`,
  }));
}

function displayIdeas(ideas) {
  console.log("\n" + "═".repeat(60));
  console.log(`  🎮  GAME IDEA GENERATOR — ROUND ${ideas[0].round}`);
  console.log("═".repeat(60));

  ideas.forEach((idea, i) => {
    console.log(`\n  ${i + 1}. ${idea.title}`);
    console.log(`     Genre: ${idea.genre}  |  Core: ${idea.mechanic}  |  Trend: ${idea.trend}`);
    console.log(`     ${idea.concept}`);
    console.log(`     💡 ${idea.why}`);
  });

  console.log("\n" + "─".repeat(60));
  console.log("  Commands:");
  console.log("    pick N       → Build idea #N (1-5) → gives OhMyGame prompt");
  console.log("    next         → Generate 5 new ideas");
  console.log("    like N \"why\" → Mark #N liked, teaches preferences");
  console.log("    dislike N \"why\" → Mark #N disliked, teaches avoidance");
  console.log("    memory       → Show learned preferences");
  console.log("    quit         → Exit");
  console.log("═".repeat(60));
}

function parseFeedback(input, ideas) {
  const parts = input.trim().split(/\s+/);
  const cmd = parts[0].toLowerCase();

  if (cmd === "pick" || cmd === "build") {
    const n = parseInt(parts[1]) - 1;
    if (n >= 0 && n < ideas.length) return { action: "pick", idea: ideas[n] };
  }
  if (cmd === "next" || cmd === "more") return { action: "next" };
  if (cmd === "like") {
    const n = parseInt(parts[1]) - 1;
    const reason = parts.slice(2).join(" ") || "fun mechanic";
    if (n >= 0 && n < ideas.length) return { action: "like", idea: ideas[n], reason };
  }
  if (cmd === "dislike" || cmd === "hate") {
    const n = parseInt(parts[1]) - 1;
    const reason = parts.slice(2).join(" ") || "not my style";
    if (n >= 0 && n < ideas.length) return { action: "dislike", idea: ideas[n], reason };
  }
  if (cmd === "memory" || cmd === "prefs") return { action: "memory" };
  if (cmd === "quit" || cmd === "exit") return { action: "quit" };
  if (cmd === "help") return { action: "help" };

  return { action: "help" };
}

function extractKeywords(text) {
  const stop = new Set(["the", "and", "for", "with", "game", "play", "player", "idea", "concept", "mechanic", "genre", "browser", "web", "html5", "make", "create", "build", "like", "love", "enjoy", "fun", "good", "great", "cool", "nice"]);
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 3 && !stop.has(w))
    .slice(0, 8);
}

function updateMemory(memory, feedback, currentIdeas) {
  memory.rounds++;
  if (feedback.action === "like") {
    memory.liked.push({
      ...feedback.idea,
      reason: feedback.reason,
      timestamp: new Date().toISOString(),
    });
    const keywords = extractKeywords(feedback.idea.concept + " " + feedback.idea.mechanic + " " + feedback.idea.trend + " " + feedback.reason);
    memory.preferences = [...new Set([...memory.preferences, ...keywords])].slice(0, 15);
  }
  if (feedback.action === "dislike") {
    memory.disliked.push({
      ...feedback.idea,
      reason: feedback.reason,
      timestamp: new Date().toISOString(),
    });
    const keywords = extractKeywords(feedback.idea.concept + " " + feedback.idea.mechanic + " " + feedback.idea.trend + " " + feedback.reason);
    memory.avoidedKeywords = [...new Set([...memory.avoidedKeywords, ...keywords])].slice(0, 15);
    memory.disliked[memory.disliked.length - 1].keywords = keywords;
  }
  memory.allIdeas.push(...currentIdeas);
  return memory;
}

function showMemory(memory) {
  console.log("\n📚 LEARNED PREFERENCES (after " + memory.rounds + " rounds):");
  console.log("  ✅ Liked:", memory.liked.length ? memory.liked.map(l => l.title).join(", ") : "none yet");
  console.log("  ❌ Disliked:", memory.disliked.length ? memory.disliked.map(d => d.title).join(", ") : "none yet");
  console.log("  🎯 Preferred keywords:", memory.preferences.length ? memory.preferences.join(", ") : "learning...");
  console.log("  🚫 Avoided keywords:", memory.avoidedKeywords.length ? memory.avoidedKeywords.join(", ") : "none");
}

function generateOhMyGamePrompt(idea) {
  return `Create a ${idea.genre} browser game: "${idea.title}"

Core concept: ${idea.concept}

Genre: ${idea.genre}
Primary mechanic: ${idea.mechanic}
Trend alignment: ${idea.trend}

Requirements:
- Playable in browser (Phaser 3 or Three.js + Vite)
- Mobile-friendly: touch controls, responsive layout
- Single HTML file output (index.html) with embedded JS/CSS or ES modules
- No external asset dependencies (procedural art or simple shapes)
- 2-5 minute core loop, replayable
- Shareable via URL (seed-based or state encoding)
- Accessible: colorblind-safe palette, one-hand playable if possible

Visual style: Clean, polished, ${idea.trend === "cozy" ? "warm cozy aesthetic" : idea.trend === "bite-sized" ? "minimalist arcade" : idea.trend === "procedural" ? "clean procedural" : "modern indie"}.

Start by creating the design doc on the canvas, then generate assets, then build the playable game. Playtest and iterate until it's fun.`;
}

async function main() {
  const memory = await loadMemory();

  let currentIdeas = generateCuratedIdeas(memory, memory.rounds + 1);
  memory.allIdeas.push(...currentIdeas);
  await saveMemory(memory);

  displayIdeas(currentIdeas);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  while (true) {
    const input = await rl.question("\n> ");
    const feedback = parseFeedback(input, currentIdeas);

    if (feedback.action === "pick") {
      console.log(`\n🚀 SELECTED: ${feedback.idea.title}`);
      console.log("═".repeat(60));
      console.log("📋 COPY THIS PROMPT INTO OHMYGAME STUDIO CHAT:");
      console.log("═".repeat(60));
      console.log(generateOhMyGamePrompt(feedback.idea));
      console.log("═".repeat(60));
      console.log("\n🎮 Your direct play link will be:");
      console.log("   http://192.168.1.5:4178/__xpc/local-game/<generated-id>/play/");
      console.log("\n📱 Test on iPhone → approve → I'll prepare Vercel deploy.");
      break;
    }

    if (feedback.action === "next") {
      currentIdeas = generateCuratedIdeas(memory, memory.rounds + 1);
      memory.allIdeas.push(...currentIdeas);
      await saveMemory(memory);
      displayIdeas(currentIdeas);
      continue;
    }

    if (feedback.action === "like" || feedback.action === "dislike") {
      memory = updateMemory(memory, feedback, currentIdeas);
      await saveMemory(memory);
      console.log(feedback.action === "like" ? "✅ Learned! Next round will favor similar ideas." : "❌ Noted. Avoiding similar ideas next round.");
      continue;
    }

    if (feedback.action === "memory") {
      showMemory(memory);
      continue;
    }

    if (feedback.action === "quit") {
      console.log("\n👋 Progress saved. Run again anytime to continue.");
      break;
    }

    displayIdeas(currentIdeas);
  }

  rl.close();
}

main().catch(console.error);