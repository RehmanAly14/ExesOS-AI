/**
 * ExecOS AI — Fireworks model configuration
 * All model IDs are loaded from environment variables.
 * Models are validated against the Fireworks API on startup.
 */

const axios = require("axios");

const FIREWORKS_CHAT_URL = "https://api.fireworks.ai/inference/v1/chat/completions";
const FIREWORKS_MODELS_URL = "https://api.fireworks.ai/inference/v1/models";

/** Models known to support json_schema on Fireworks (empty = use json_object only). */
const JSON_SCHEMA_CAPABLE_MODELS = new Set(
  (process.env.FIREWORKS_JSON_SCHEMA_MODELS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
);

const state = {
  initialized: false,
  availableModels: new Set(),
  resolved: {
    chat: null,
    executive: null,
    fallback: null,
  },
};

function getApiKey() {
  return process.env.FIREWORKS_API_KEY || "";
}

function parseModelChain() {
  const chain = process.env.FIREWORKS_MODEL_FALLBACK_CHAIN;
  if (chain) {
    return chain.split(",").map((id) => id.trim()).filter(Boolean);
  }

  return [
    process.env.FIREWORKS_EXECUTIVE_MODEL,
    process.env.FIREWORKS_LLM_MODEL,
    process.env.FIREWORKS_STRUCTURED_FALLBACK_MODEL,
  ].filter(Boolean);
}

function getConfiguredModels() {
  return {
    chat: process.env.FIREWORKS_LLM_MODEL || null,
    executive: process.env.FIREWORKS_EXECUTIVE_MODEL || process.env.FIREWORKS_LLM_MODEL || null,
    fallback: process.env.FIREWORKS_STRUCTURED_FALLBACK_MODEL || null,
    chain: parseModelChain(),
  };
}

async function listAvailableModels() {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  try {
    const response = await axios.get(FIREWORKS_MODELS_URL, {
      headers: { Authorization: `Bearer ${apiKey}` },
      params: { pageSize: 200 },
      timeout: 15000,
    });

    const items = response.data?.data || [];
    return items.map((item) => item.id || item.name).filter(Boolean);
  } catch (error) {
    console.warn(
      "[FireworksConfig] Could not list models:",
      error.response?.data?.error?.message || error.message
    );
    return [];
  }
}

async function probeModel(modelId) {
  const apiKey = getApiKey();
  if (!apiKey || !modelId) return false;

  try {
    await axios.post(
      FIREWORKS_CHAT_URL,
      {
        model: modelId,
        messages: [{ role: "user", content: "Reply with OK" }],
        max_tokens: 4,
        temperature: 0,
      },
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        timeout: 20000,
      }
    );
    return true;
  } catch (error) {
    const message = error.response?.data?.error?.message || error.message;
    console.warn(`[FireworksConfig] Model unavailable: ${modelId} — ${message}`);
    return false;
  }
}

async function resolveFirstWorkingModel(candidates, availableSet) {
  const tried = new Set();

  for (const candidate of candidates) {
    if (!candidate || tried.has(candidate)) continue;
    tried.add(candidate);

    if (availableSet.size > 0 && !availableSet.has(candidate)) {
      console.warn(`[FireworksConfig] Skipping ${candidate} — not in account catalog`);
      continue;
    }

    const works = await probeModel(candidate);
    if (works) return candidate;
  }

  return null;
}

function supportsJsonSchema(modelId) {
  return JSON_SCHEMA_CAPABLE_MODELS.has(modelId);
}

function getChatModel() {
  if (!state.resolved.chat) {
    throw new Error("Fireworks models not initialized. Call initializeFireworksConfig() first.");
  }
  return state.resolved.chat;
}

function getExecutiveModel() {
  if (!state.resolved.executive) {
    throw new Error("Fireworks models not initialized. Call initializeFireworksConfig() first.");
  }
  return state.resolved.executive;
}

function getFallbackModel() {
  return state.resolved.fallback || state.resolved.executive;
}

function getStructuredOutputMode(modelId) {
  return supportsJsonSchema(modelId) ? "json_schema" : "json_object";
}

async function initializeFireworksConfig() {
  if (state.initialized) return state.resolved;

  const configured = getConfiguredModels();
  const chain = [...new Set([...configured.chain, configured.executive, configured.chat, configured.fallback].filter(Boolean))];

  console.log("[FireworksConfig] Validating Fireworks models...");

  const catalog = await listAvailableModels();
  catalog.forEach((id) => state.availableModels.add(id));

  if (catalog.length > 0) {
    console.log(`[FireworksConfig] Account catalog: ${catalog.length} model(s)`);
  }

  const executive = await resolveFirstWorkingModel(
    [configured.executive, ...chain],
    state.availableModels
  );

  const chat = await resolveFirstWorkingModel(
    [configured.chat, executive, ...chain],
    state.availableModels
  );

  const fallback = await resolveFirstWorkingModel(
    [configured.fallback, ...chain.filter((id) => id !== executive)],
    state.availableModels
  );

  if (!executive || !chat) {
    throw new Error(
      "No working Fireworks LLM model found. Set FIREWORKS_EXECUTIVE_MODEL and FIREWORKS_LLM_MODEL in .env"
    );
  }

  state.resolved = {
    chat,
    executive,
    fallback: fallback || executive,
  };
  state.initialized = true;

  console.log("[FireworksConfig] Resolved models:", {
    chat: state.resolved.chat,
    executive: state.resolved.executive,
    fallback: state.resolved.fallback,
    structuredMode: getStructuredOutputMode(state.resolved.executive),
  });

  return state.resolved;
}

module.exports = {
  initializeFireworksConfig,
  getChatModel,
  getExecutiveModel,
  getFallbackModel,
  getStructuredOutputMode,
  supportsJsonSchema,
  getConfiguredModels,
  FIREWORKS_CHAT_URL,
};
