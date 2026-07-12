function logParseResult(label, attempt, maxAttempts, parseMeta, retryCount = attempt - 1) {
  console.log(
    `[${label}] attempt=${attempt}/${maxAttempts} retryCount=${retryCount} ` +
      `extraction=${parseMeta.extractionSucceeded} ` +
      `repair=${parseMeta.repairSucceeded} ` +
      `validation=${parseMeta.schemaValidationPassed}`
  );
}

async function fetchStructuredResponse({
  label,
  maxAttempts = 2,
  fetchRaw,
  parseFn,
  fallback,
  throwOnFailure = false,
}) {
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    let raw = "";

    try {
      raw = await fetchRaw(attempt);
      const parsed = parseFn(raw);
      logParseResult(label, attempt, maxAttempts, parsed.parseMeta, attempt - 1);
      return parsed.result;
    } catch (error) {
      lastError = error;
      const failureMeta = error.parseMeta || {
        extractionSucceeded: false,
        repairSucceeded: false,
        schemaValidationPassed: false,
      };
      logParseResult(label, attempt, maxAttempts, failureMeta, attempt - 1);

      if (!error.parseMeta) {
        console.error(`[${label}] error="${error.message}"`);
      }

      if (error.code === "MODEL_UNAVAILABLE") {
        break;
      }
    }
  }

  if (throwOnFailure) {
    throw lastError || new Error(`${label} failed to produce a valid structured response`);
  }

  if (typeof fallback === "function") {
    console.warn(`[${label}] Using fallback after failed attempt(s)`);
    return fallback();
  }

  throw lastError || new Error(`${label} failed`);
}

module.exports = {
  fetchStructuredResponse,
};
