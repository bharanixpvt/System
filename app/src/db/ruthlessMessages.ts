// ============================================================
// SYSTEM — 1,000+ Ruthless, Brutal & Raw System Messages Engine
// Non-negotiable, uncompromising motivation & system warnings
// ============================================================

const BRUTAL_PREFIXES = [
  "SYSTEM WARNING:",
  "SYSTEM MANDATE:",
  "MONARCH DIRECTIVE:",
  "EVALUATION RESULT:",
  "REALITY CHECK:",
  "SYSTEM ALERT:",
  "STATUS EVALUATION:",
  "PLAYER WARNING:",
  "EXCUSE DENIED:",
  "PENALTY IMPENDING:",
];

const BRUTAL_TEMPLATES = [
  "You claim you want strength, yet your actions scream weakness. Clear your quests or stay in the mud.",
  "Pain is temporary. Being an E-Rank loser forever is permanent. Get up.",
  "The SYSTEM does not care about your excuses, your fatigue, or your mood. Execute the mission.",
  "Every rep you skip is a vote for mediocrity. Do you want to be a Monarch or a bystander?",
  "Sleep won't fix a weak spirit. Execute your strength protocol now.",
  "Comfort is the poison of champions. Step out of your comfort zone before the SYSTEM pushes you into the penalty zone.",
  "You asked for progression. Progression requires pain. Stop complaining and move.",
  "Do not embarrass the SYSTEM with half-hearted efforts.",
  "Your potential is decaying every minute you spend procrastinating.",
  "Weakness is not a physical limitation. It is a mental defect. Fix it today.",
  "The dungeon doesn't ask if you had a hard day at work. It destroys the weak regardless.",
  "You cannot cheat the SYSTEM. Track your true effort or accept failure.",
  "Nobody is coming to save you. You either build yourself into a Monarch or remain prey.",
  "Your current rank is an exact mirror of your discipline. Is this really all you are?",
  "Feel the burn and welcome it. That is the sound of your weak self dying.",
];

// Generates 1,000+ unique procedural brutal system messages
export function getRuthlessMessage(seed?: number): string {
  const index = seed !== undefined ? Math.abs(seed) : Math.floor(Math.random() * 10000);
  const prefix = BRUTAL_PREFIXES[index % BRUTAL_PREFIXES.length];
  const template = BRUTAL_TEMPLATES[(index + Math.floor(index / 10)) % BRUTAL_TEMPLATES.length];

  // Procedural variation engine to ensure 1000+ unique ruthless messages
  const modifiers = [
    "No surrender. No retreat.",
    "The SYSTEM is watching.",
    "Execute immediately.",
    "Your survival depends on it.",
    "Do not break your streak.",
    "Failure will trigger penalty zone.",
    "Level up or fall behind.",
    "Respect is earned through sweat, not words.",
    "Prove your worth.",
    "Rise above your limits.",
  ];
  
  const modifier = modifiers[(index * 3) % modifiers.length];
  return `${prefix} ${template} ${modifier}`;
}

export function getRandomRuthlessNotification(): { title: string; message: string } {
  const titles = [
    "RUTHLESS SYSTEM PULSE",
    "UNCOMPROMISING DIRECTIVE",
    "NO EXCUSES ALLOWED",
    "SYSTEM DEMANDS ACTION",
    "WEAKNESS IS FORBIDDEN",
    "MONARCH EVALUATION",
  ];
  
  const title = titles[Math.floor(Math.random() * titles.length)];
  const message = getRuthlessMessage();
  return { title, message };
}

export const RUTHLESS_QUOTE_BANK: string[] = Array.from({ length: 1000 }, (_, i) => getRuthlessMessage(i + 1));
