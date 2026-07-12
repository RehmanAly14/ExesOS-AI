function isJsonTruncated(text) {
  if (!text || typeof text !== "string") return true;
  const trimmed = text.trim();
  if (!trimmed.startsWith("{")) return true;
  return trimmed.charAt(trimmed.length - 1) !== "}";
}

function extractBalancedJsonSlices(text) {
  const slices = [];

  for (let i = 0; i < text.length; i += 1) {
    if (text[i] !== "{") continue;

    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let j = i; j < text.length; j += 1) {
      const char = text[j];

      if (inString) {
        if (escaped) escaped = false;
        else if (char === "\\") escaped = true;
        else if (char === '"') inString = false;
        continue;
      }

      if (char === '"') inString = true;
      else if (char === "{") depth += 1;
      else if (char === "}") {
        depth -= 1;
        if (depth === 0) {
          slices.push(text.slice(i, j + 1));
          break;
        }
      }
    }
  }

  return slices.sort((a, b) => b.length - a.length);
}

function sliceJsonBounds(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return text.slice(start, end + 1);
}

function repairJsonText(jsonText) {
  return jsonText
    .replace(/^\uFEFF/, "")
    .replace(/,\s*}/g, "}")
    .replace(/,\s*]/g, "]");
}

/**
 * Extract and parse a JSON object from LLM output.
 */
function extractJson(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Empty LLM response");
  }

  if (isJsonTruncated(text)) {
    const error = new Error("Truncated JSON response");
    error.code = "JSON_TRUNCATED";
    throw error;
  }

  const trimmed = text.trim();
  const candidates = [];

  extractBalancedJsonSlices(trimmed).forEach((slice) => candidates.push(slice));

  const bounded = sliceJsonBounds(trimmed);
  if (bounded) candidates.push(bounded);

  if (trimmed.startsWith("{")) candidates.push(trimmed);

  const uniqueCandidates = [...new Set(candidates)];
  let lastError = null;

  for (const candidate of uniqueCandidates) {
    const attempts = [candidate, repairJsonText(candidate)];

    for (const jsonSlice of attempts) {
      try {
        const value = JSON.parse(jsonSlice);
        if (!value || typeof value !== "object" || Array.isArray(value)) continue;
        return {
          value,
          extractionSucceeded: true,
          repairSucceeded: jsonSlice !== candidate,
        };
      } catch (error) {
        lastError = error;
      }
    }
  }

  const parseError = lastError || new Error("No JSON object found in LLM response");
  if (isJsonTruncated(text)) parseError.code = "JSON_TRUNCATED";
  throw parseError;
}

module.exports = {
  extractJson,
  isJsonTruncated,
};
