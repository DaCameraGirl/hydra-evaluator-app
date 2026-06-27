<p align="center">
  <img src="docs/readme-banner.svg" alt="Hydra Evaluator — Browser tool for image-edit model evaluation, with optional Claude auto-grading." width="720" />
</p>

<p align="center">
  <strong>Browser tool for image-edit model evaluation, with optional Claude auto-grading.</strong>
</p>

<p align="center">
  <a href="https://github.com/DaCameraGirl/hydra-evaluator-app"><img src="https://img.shields.io/badge/Code-GitHub-58a6ff?style=for-the-badge&logo=github&logoColor=white" alt="Source code" /></a>
  <a href="https://github.com/DaCameraGirl/AI-Video-Annotator"><img src="https://img.shields.io/badge/Related-41d99a?style=for-the-badge" alt="Related" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/stack-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="stack-TypeScript" />
  <img src="https://img.shields.io/badge/license-All Rights Reserved-f0c45d?style=flat-square" alt="license-All Rights Reserved" />
</p>

### Languages

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-52%25-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/JavaScript-34%25-F7DF1E?style=flat-square&logo=javascript&logoColor=111" alt="JavaScript" />
  <img src="https://img.shields.io/badge/CSS-11%25-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS" />
</p>

### Stack

<p align="center">
  <img src="https://img.shields.io/badge/React-browser-61DAFB?style=flat-square&logo=react&logoColor=111" alt="React-browser" />
  <img src="https://img.shields.io/badge/Claude-grading-bc8cff?style=flat-square" alt="Claude-grading" />
</p>

<p align="center">
  Built by <strong>Angela Hudson</strong> · <a href="https://github.com/DaCameraGirl">DaCameraGirl</a>
</p>
# Hydra Evaluator

Local Project Hydra image-response evaluation helper. Paste a Hydra task, load the input and Response A/B images, choose ratings, and draft a concise justification in Angela's preferred comparison style.

**Live:** https://dacameragirl.github.io/hydra-evaluator-app/

Built by Angela Hudson / DaCameraGirl.

<p align="center"><img src="docs/readme-divider.svg" width="720" alt="" /></p>
<p align="center"><img src="https://capsule-render.vercel.app/api?type=waving&color=0:070b14,100:12102a&height=50&section=header&text=What%20It%20Does&fontSize=22&fontColor=e6edf3&animation=twinkling" width="720" alt="What It Does" /></p>


- **Prompt parsing**: paste the full task text and pull out the prompt plus storage image links when possible.
- **Side-by-side image review**: view the input, Response A, and Response B together with URL or file-drop loading.
- **Prompt checklist**: split the prompt into concrete details to watch for while rating.
- **Hydra ratings**: record overall preference, instruction following, correctness, visual quality, and naturalness.
- **Justification drafting**: generate 2 to 5 sentence explanations that start with `Response A/B is better than Response A/B.`
- **No em dashes**: generated text replaces em dashes so it matches Angela's requested style.

<p align="center"><img src="docs/readme-divider.svg" width="720" alt="" /></p>
<p align="center"><img src="https://capsule-render.vercel.app/api?type=waving&color=0:070b14,100:12102a&height=50&section=header&text=Evaluation%20Notes&fontSize=22&fontColor=e6edf3&animation=twinkling" width="720" alt="Evaluation Notes" /></p>


This app does not automatically judge image quality yet. It is a fast local workbench for careful human review. Treat it as a helper for:

- preserving the original subject, pose, background, and requested invariants
- separating instruction following from correctness
- calling out extra unwanted objects or changed scene details
- writing specific, plain-language justifications under time pressure

<p align="center"><img src="docs/readme-divider.svg" width="720" alt="" /></p>
<p align="center"><img src="https://capsule-render.vercel.app/api?type=waving&color=0:070b14,100:12102a&height=50&section=header&text=Tech%20Stack&fontSize=22&fontColor=e6edf3&animation=twinkling" width="720" alt="Tech Stack" /></p>


- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Local browser state only
- GitHub Pages deployment

No backend, no database, no API keys.

<p align="center"><img src="docs/readme-divider.svg" width="720" alt="" /></p>
<p align="center"><img src="https://capsule-render.vercel.app/api?type=waving&color=0:070b14,100:12102a&height=50&section=header&text=Run%20Locally&fontSize=22&fontColor=e6edf3&animation=twinkling" width="720" alt="Run Locally" /></p>


```bash
npm install
npm run dev
```

Checks:

```bash
npm run lint
npm run typecheck
npm run build
```

<p align="center"><img src="docs/readme-divider.svg" width="720" alt="" /></p>
<p align="center"><img src="https://capsule-render.vercel.app/api?type=waving&color=0:070b14,100:12102a&height=50&section=header&text=CI%20and%20Deploy&fontSize=22&fontColor=e6edf3&animation=twinkling" width="720" alt="CI and Deploy" /></p>


Pull requests and pushes to `main` run:

- `npm run lint`
- `npm run typecheck`
- `npm run build`

The repo is configured for GitHub Pages at:

```text
https://dacameragirl.github.io/hydra-evaluator-app/
```

The Vite `base` is `/hydra-evaluator-app/` to match the repository name.

Pushing to `main` triggers `.github/workflows/deploy-pages.yml`, which builds the app and publishes `dist/` to GitHub Pages.

<p align="center"><img src="docs/readme-divider.svg" width="720" alt="" /></p>
<p align="center"><img src="https://capsule-render.vercel.app/api?type=waving&color=0:070b14,100:12102a&height=50&section=header&text=Repo%20Workflow&fontSize=22&fontColor=e6edf3&animation=twinkling" width="720" alt="Repo Workflow" /></p>


- Work on feature branches.
- Run lint, typecheck, and build before opening PRs.
- Keep Hydra wording plain and specific.
- Keep generated justifications free of em dashes.
- Use issues for follow-up automation, vision-model support, and rating workflow improvements.

<p align="center"><img src="docs/readme-divider.svg" width="720" alt="" /></p>
<p align="center"><img src="https://capsule-render.vercel.app/api?type=waving&color=0:070b14,100:12102a&height=50&section=header&text=License&fontSize=22&fontColor=e6edf3&animation=twinkling" width="720" alt="License" /></p>


Copyright (c) 2026 Angela Hudson. All Rights Reserved. See [LICENSE](LICENSE).
Viewing this repository does not grant a license to use the code.