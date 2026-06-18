# Hydra evaluator

A browser-based helper for image-edit model evaluation. Given an **input image**,
a **prompt** describing the requested edit, and two candidate edits (**Response A**
and **Response B**), it helps you rate the pair and write a submission-ready
justification.

## Two ways to use it

1. **Manual** — paste the task, look at the images, click the rating buttons,
   jot quick notes, and the app stitches them into a clean justification (em
   dashes stripped).
2. **Auto-evaluate with Claude** — drop in an Anthropic API key and let
   `claude-opus-4-8` read the three images, score the five axes, and draft the
   justification for you. You review and adjust before submitting.

## Running it

It's a static app — no build step.

- Quickest: open `index.html` in a browser.
- If you load local image files (not `https://` URLs) and the browser blocks
  reading them over `file://`, serve the folder instead:

  ```sh
  cd hydra-evaluator-app
  python -m http.server
  # then open http://localhost:8000
  ```

## The five rating axes

- Overall Preference
- Instruction Following
- Correctness
- Visual Quality
- AI-Generated Appearance / Naturalness

Each is scored on the standard 5-point A-vs-B scale.

## How auto-evaluation works

The evaluator sends the prompt and images to the Anthropic Messages API with a
strict JSON schema, so the response maps directly onto the rating buttons and
note fields. The grading rule it applies: an image edit must **make the
requested changes** *and* **leave everything else unchanged** — a response that
regenerates the scene has failed the task, not half-succeeded.

## API key and security

The API key is entered at runtime and stored only in this browser's
`localStorage`. It is never committed and is sent only to Anthropic (via the
`anthropic-dangerous-direct-browser-access` header).

**Do not host this app publicly as-is** — anyone loading the page could read the
key from the browser. For a hosted deployment, put a small proxy server in front
so the key stays server-side.
