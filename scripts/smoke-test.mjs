import { spawn, spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "..");
const serveRoot = path.dirname(appRoot);
const appFolderName = path.basename(appRoot);
const appPort = Number(process.env.HYDRA_TEST_PORT || 8767);
const appUrl = `http://127.0.0.1:${appPort}/${appFolderName}/index.html`;
const runnerPath = path.join(appRoot, ".hydra-smoke-runner.html");
const runnerUrl = `http://127.0.0.1:${appPort}/${appFolderName}/.hydra-smoke-runner.html`;
let edgeUserDataDir;
const edgePath =
  process.env.EDGE_PATH ||
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForHttp(url, timeoutMs = 10000) {
  const started = Date.now();
  let lastError;
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await wait(150);
  }
  throw lastError || new Error(`Timed out waiting for ${url}`);
}

function waitForExit(child, timeoutMs = 3000) {
  if (!child || child.exitCode !== null) return Promise.resolve();
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, timeoutMs);
    child.once("exit", () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

function decodeHtml(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

const pageTest = String.raw`
<script>
(async () => {
  function done(result) {
    document.body.setAttribute("data-smoke", result.ok ? "pass" : "fail");
    document.body.textContent = JSON.stringify(result);
  }
  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }
  async function waitFor(condition, message, timeoutMs = 10000) {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      if (condition()) return;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error(message);
  }

  try {
    document.body.setAttribute("data-smoke", "running");
    assert(typeof window.toImageBlock === "function", "toImageBlock is not available");
    document.querySelector("#loadSample").click();

    const imageSelectors = ["#imgInput", "#imgA", "#imgB"];
    const previewSources = await Promise.all(imageSelectors.map(async (selector) => {
      const image = document.querySelector(selector);
      assert(image.src.endsWith(".png"), selector + " did not point at a PNG");
      const response = await fetch(image.src);
      assert(response.ok, selector + " returned HTTP " + response.status);
      const blob = await response.blob();
      assert(blob.type === "image/png", selector + " fetched " + blob.type);
      assert(blob.size > 1000, selector + " image was too small");
      return { selector, src: image.src, type: blob.type, size: blob.size };
    }));

    const imageBlocks = await Promise.all(["input", "a", "b"].map((slot) => window.toImageBlock(slot)));
    const imageBlockSummary = imageBlocks.map((block) => ({
      type: block.type,
      sourceType: block.source.type,
      mediaType: block.source.media_type,
      dataLength: block.source.data.length,
    }));

    imageBlockSummary.forEach((block, index) => {
      assert(block.type === "image", "Block " + index + " was not an image");
      assert(block.sourceType === "base64", "Block " + index + " was not base64");
      assert(block.mediaType === "image/png", "Block " + index + " was " + block.mediaType);
      assert(block.dataLength > 1000, "Block " + index + " payload was too small");
    });

    const mockResult = {
      overall_preference: "Response B is much better",
      instruction_following: "Response B is much better",
      correctness: "Response B is much better",
      visual_quality: "Response B is slightly better",
      naturalness: "Response B is slightly better",
      winner_notes: "Response B adds the navy blazer, low bun, and gold round glasses while keeping the desk setup intact",
      loser_notes: "Response A misses the glasses and changes more of the original styling than requested",
      tradeoff_notes: "Both images are usable, but preservation decides the comparison",
      justification: "Response B is much better than Response A — it completes all three requested edits while preserving the surrounding scene. Response A misses the glasses and changes more of the original styling than requested. The deciding tradeoff is that Response B keeps the edit closer to the input image.",
    };

    const originalFetch = window.fetch.bind(window);
    window.__lastAnthropicBody = null;
    window.fetch = async (url, options) => {
      if (String(url).includes("/v1/messages")) {
        window.__lastAnthropicBody = JSON.parse(options.body);
        return new Response(JSON.stringify({
          content: [{ type: "text", text: JSON.stringify(mockResult) }],
        }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      return originalFetch(url, options);
    };

    document.querySelector("#apiKey").value = "test-key-not-sent";
    document.querySelector("#apiKey").dispatchEvent(new Event("change"));
    document.querySelector("#autoEval").click();

    await waitFor(
      () => !document.querySelector("#autoEval").disabled &&
        document.querySelector("#justification").value.includes("Response B is much better"),
      "Auto-evaluate did not fill the justification",
    );

    const activeRatings = [...document.querySelectorAll(".rating-row")].map((row) => ({
      name: row.querySelector(".rating-name").textContent,
      value: row.querySelector(".rating-option.active")?.textContent || "",
    }));
    const expected = new Map([
      ["Overall Preference", "Response B is much better"],
      ["Instruction Following", "Response B is much better"],
      ["Correctness", "Response B is much better"],
      ["Visual Quality", "Response B is slightly better"],
      ["AI-Generated Appearance / Naturalness", "Response B is slightly better"],
    ]);
    activeRatings.forEach(({ name, value }) => {
      assert(value === expected.get(name), name + " was " + value);
    });

    const payloadImageSources = window.__lastAnthropicBody.messages[0].content
      .filter((part) => part.type === "image")
      .map((part) => ({
        type: part.source.type,
        mediaType: part.source.media_type,
        dataLength: part.source.data.length,
      }));

    assert(payloadImageSources.length === 3, "Claude payload did not include three images");
    payloadImageSources.forEach((source, index) => {
      assert(source.type === "base64", "Payload image " + index + " was not base64");
      assert(source.mediaType === "image/png", "Payload image " + index + " was " + source.mediaType);
      assert(source.dataLength > 1000, "Payload image " + index + " data was too small");
    });

    const promptText = window.__lastAnthropicBody.messages[0].content.at(-1).text;
    const justification = document.querySelector("#justification").value;
    assert(promptText.includes("Make exactly these three changes"), "Prompt was missing from Claude payload");
    assert(!/[\u2013\u2014]/.test(justification), "Justification still contains an en/em dash");
    assert(justification.includes(","), "Justification did not normalize the dash to a comma");

    done({
      ok: true,
      appUrl: location.href,
      previewSources,
      imageBlockSummary,
      payloadImageSources,
      activeRatings,
      justification,
    });
  } catch (error) {
    done({ ok: false, message: error.message, stack: error.stack });
  }
})();
</script>`;

const server = spawn("python", ["-m", "http.server", String(appPort), "--bind", "127.0.0.1"], {
  cwd: serveRoot,
  stdio: "ignore",
  windowsHide: true,
});

try {
  const index = await readFile(path.join(appRoot, "index.html"), "utf8");
  await writeFile(runnerPath, index.replace("</body>", `${pageTest}\n</body>`));
  await waitForHttp(appUrl);
  edgeUserDataDir = await mkdtemp(path.join(tmpdir(), "hydra-evaluator-edge-dump-"));

  const result = spawnSync(
    edgePath,
    [
      "--headless=new",
      "--disable-gpu",
      "--disable-gpu-sandbox",
      "--disable-dev-shm-usage",
      "--no-sandbox",
      "--no-first-run",
      "--no-default-browser-check",
      `--user-data-dir=${edgeUserDataDir}`,
      "--dump-dom",
      "--virtual-time-budget=15000",
      runnerUrl,
    ],
    {
      encoding: "utf8",
      timeout: 30000,
      windowsHide: true,
    },
  );

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`Edge exited with ${result.status}: ${result.stderr}`);
  }

  const bodyMatch = result.stdout.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!bodyMatch) throw new Error("Could not find smoke test output in Edge DOM dump");
  const bodyText = decodeHtml(bodyMatch[1].replace(/<[^>]*>/g, "").trim());
  const parsed = JSON.parse(bodyText);
  if (!parsed.ok) {
    throw new Error(`${parsed.message}\n${parsed.stack || ""}`);
  }

  console.log(JSON.stringify(parsed, null, 2));
} finally {
  await rm(runnerPath, { force: true });
  if (edgeUserDataDir) {
    await rm(edgeUserDataDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 250 });
  }
  if (server.exitCode === null) {
    server.kill();
    await waitForExit(server);
  }
}
