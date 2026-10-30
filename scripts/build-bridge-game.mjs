#!/usr/bin/env node
/**
 * Automated OhMyGame Bridge Builder Game Creator
 * Creates project, sends prompt, monitors progress, outputs play link
 */

const BASE_URL = "http://192.168.1.5:43110";

const PROMPT = `Create a 2D bridge-building physics game: "Bridge Builder: Structural Integrity"

Core concept: Players construct bridges from nodes and beams to span gaps. Vehicles (cars, trucks, trains) cross in real-time physics simulation. Bridge must hold — stress visualization shows tension/compression in real-time. If it collapses, dramatic failure with debris, particles, vehicle destruction.

Genre: puzzle / simulation
Primary mechanic: drag-drop node placement + beam drawing + real-time stress test
Trend alignment: polished physics sim, bite-sized levels, visual excellence

Requirements:
- Playable in browser (Phaser 3 + Matter.js physics, or Three.js 2D + custom verlet integration)
- Mobile-first: touch to place nodes, drag to draw beams, pinch-zoom/pan canvas
- Single HTML file output (index.html) with ES modules, embedded shaders
- Procedural high-end 2D graphics: 
  * Node/beam materials (steel, cable, wood, carbon fiber) with PBR-lite shading
  * Dynamic stress heatmap overlay (blue compression → red tension → white failure)
  * Vehicle weight classes with suspension animation
  * Collapse: beam snapping, particle debris, dust clouds, screen shake, slow-mo moment
  * Water/river below with reflections, ambient parallax layers
- Levels: 30 handcrafted puzzles (canyon, river, city gap, mountain pass, train viaduct)
  * Progressive unlock: new materials, longer spans, moving loads, wind, earthquakes
  * Daily challenge: seeded level shared via URL
  * Sandbox mode: unlimited budget, creative sharing
- Exceptional UI/UX:
  * Clean toolbar: material selector (icon + cost), undo/redo, test mode toggle
  * Budget counter with visual stress gauge
  * "Test Bridge" button → smooth transition to simulation view
  * Simulation HUD: vehicle queue, speed, stress legend, reset/camera follow
  * Level select: map with preview thumbnails, star ratings, completion badges
  * Settings: graphics quality, colorblind mode, reduced motion, haptics
  * No tutorial walls — progressive disclosure via ghost hints
- Physics fidelity:
  * Verlet integration or Matter.js with constraint stiffness/damping per material
  * Realistic buckling: compression beams bend before snap
  * Cable sag under load (catenary curves)
  * Vehicle suspension reacts to bridge deflection
- Audio: subtle tension creaks, snap sounds, ambient wind/water, satisfying "level complete" chime
- Accessible: high contrast mode, one-hand playable, scalable UI, no text-critical info

Visual style: Premium 2D — think "Poly Bridge" meets "Monument Valley" aesthetics. Crisp vectors, subtle gradients, material textures via shader, cinematic lighting on collapse. 60fps on 5-year-old phones.

Start by creating the design doc on canvas, then generate assets (shaders, sprites, UI components), then build the physics + game loop. Playtest each level for fun factor and fairness. Iterate until the "test bridge" moment feels dramatic and fair.`;

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const text = await res.text();
  try {
    return { status: res.status, data: JSON.parse(text) };
  } catch {
    return { status: res.status, data: text };
  }
}

async function createProject() {
  console.log("📦 Creating project...");
  const { status, data } = await fetchJson(`${BASE_URL}/projects`, {
    method: "POST",
    body: JSON.stringify({
      name: "Bridge Builder: Structural Integrity",
      type: "web-game",
    }),
  });
  if (status >= 400) throw new Error(`Project creation failed: ${JSON.stringify(data)}`);
  console.log(`✅ Project created: ${data.id} (${data.name})`);
  return data;
}

async function sendPrompt(projectId, prompt) {
  console.log("💬 Sending prompt to agent...");
  // First, get or create a conversation
  const { status: listStatus, data: projects } = await fetchJson(`${BASE_URL}/projects`);
  const project = projects.find(p => p.id === projectId);
  if (!project) throw new Error("Project not found");

  // The conversation is created on first prompt, so we need to find the conversation ID
  // Let's try to send the prompt - it should auto-create a conversation
  const { status, data } = await fetchJson(`${BASE_URL}/projects/${projectId}/conversations`, {
    method: "GET",
  });
  
  let conversationId;
  if (status === 200 && data.length > 0) {
    conversationId = data[0].id;
    console.log(`📝 Using existing conversation: ${conversationId}`);
  } else {
    // Create a new conversation by sending a prompt - the API might auto-create
    console.log("📝 Creating new conversation via first prompt...");
  }

  // Send the prompt - this should create a conversation if needed
  const { status: promptStatus, data: promptData } = await fetchJson(
    `${BASE_URL}/projects/${projectId}/conversations/new/turns`, // Try 'new' as conversationId
    {
      method: "POST",
      body: JSON.stringify({ prompt }),
    }
  );

  if (promptStatus === 404) {
    // Try to list conversations first
    const { data: convs } = await fetchJson(`${BASE_URL}/projects/${projectId}/conversations`);
    if (convs.length > 0) {
      conversationId = convs[0].id;
      console.log(`📝 Found conversation: ${conversationId}`);
      return sendPromptToConversation(projectId, conversationId, prompt);
    }
    // Create conversation explicitly
    const { status: createConvStatus, data: newConv } = await fetchJson(
      `${BASE_URL}/projects/${projectId}/conversations`,
      { method: "POST", body: JSON.stringify({}) }
    );
    if (createConvStatus >= 400) throw new Error(`Failed to create conversation: ${JSON.stringify(newConv)}`);
    conversationId = newConv.id;
    console.log(`📝 Created conversation: ${conversationId}`);
    return sendPromptToConversation(projectId, conversationId, prompt);
  }

  if (promptStatus >= 400) throw new Error(`Prompt failed: ${JSON.stringify(promptData)}`);
  return promptData;
}

async function sendPromptToConversation(projectId, conversationId, prompt) {
  console.log(`💬 Sending prompt to conversation ${conversationId}...`);
  const { status, data } = await fetchJson(
    `${BASE_URL}/projects/${projectId}/conversations/${conversationId}/turns`,
    {
      method: "POST",
      body: JSON.stringify({ prompt }),
    }
  );
  if (status >= 400) throw new Error(`Prompt failed: ${JSON.stringify(data)}`);
  console.log(`✅ Prompt sent, turn: ${data.turnId}, queued: ${data.queued}`);
  return { conversationId, turnId: data.turnId };
}

async function monitorProgress(projectId, conversationId, turnId) {
  console.log("⏳ Monitoring agent progress...");
  let lastEvent = "";
  while (true) {
    await new Promise(r => setTimeout(r, 3000));
    const { data } = await fetchJson(`${BASE_URL}/projects/${projectId}/conversations/${conversationId}`);
    if (data && data.summary) {
      console.log(`   Messages: ${data.summary.messageCount}, Updated: ${data.summary.updatedAt}`);
    }
    // Check if turn is complete by looking at project files
    const { data: files } = await fetchJson(`${BASE_URL}/projects/${projectId}/files?path=`);
    if (files && Array.isArray(files)) {
      const hasIndex = files.some(f => f.name === "index.html" && f.kind === "file");
      if (hasIndex) {
        console.log("🎮 index.html detected — game likely built!");
        return true;
      }
    }
    // Also check playable endpoint
    const { data: playable } = await fetchJson(`${BASE_URL}/projects/${projectId}/playable`);
    if (playable && playable.url) {
      console.log(`🎮 Playable URL: ${playable.url}`);
      return playable.url;
    }
  }
}

async function main() {
  try {
    const project = await createProject();
    const result = await sendPrompt(project.id, PROMPT);
    if (result.conversationId) {
      console.log("\n🎯 Build started! Monitor at:");
      console.log(`   Studio: http://192.168.1.5:4178/studio`);
      console.log(`   Project ID: ${project.id}`);
      console.log(`   Conversation ID: ${result.conversationId}`);
      console.log("\n⏳ The agent is now working. Check the studio UI for progress.");
      console.log("   When index.html appears, play link will be:");
      console.log(`   http://192.168.1.5:4178/__xpc/local-game/${project.id}/play/`);
    }
  } catch (e) {
    console.error("❌ Error:", e.message);
    process.exit(1);
  }
}

main();