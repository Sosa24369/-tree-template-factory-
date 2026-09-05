import { defineRailway, preserve, project, service, volume } from "railway/iac";

export default defineRailway(() => {
  const editorVolume = volume("editor-volume", { alerts: { usage: { "100": {}, "80": {}, "95": {} } }, allowOnlineResize: true, region: "sfo", sizeMB: 50000 });
  const editor = service("editor", {
    replicas: { "sfo": 1 },
    volumeMounts: { "/data": editorVolume },

    // THE BUILD. Three installs and one UI build, in this order:
    //   root    — sharp, used by the upload pipeline in app/dashboard-core.mjs
    //   app     — vite + react, needed to build the studio UI and, at publish time,
    //             the landing pages themselves inside the volume clone
    //   dashboard UI -> app/dist-dashboard, which server/index.mjs serves behind the login
    //   server  — hono
    // Without this the platform's own detection installs only server/'s six packages
    // and the studio UI is never built (the server then answers / with a 503).
    build:
      "npm ci --no-audit --no-fund && " +
      "npm --prefix app ci --no-audit --no-fund && " +
      "npm --prefix app run build:dashboard && " +
      "npm --prefix server ci --no-audit --no-fund",

    // Without this the platform falls back to the root package.json "main"
    // (index.js), which does not exist — the first deploy crash-looped on
    // "Cannot find module '/app/index.js'".
    start: "node server/index.mjs",
    healthcheck: "/healthz",
    healthcheckTimeout: 120,

    // preserve() = "this variable is managed in the Railway dashboard, not here".
    // The two tokens are secrets and must never be written into a repo file.
    env: {
      CF_PAGES_PROJECT: preserve(), CLOUDFLARE_ACCOUNT_ID: preserve(), CLOUDFLARE_API_TOKEN: preserve(),
      DASHBOARD_PASSWORD_HASH: preserve(), GITHUB_REPO: preserve(), GITHUB_TOKEN: preserve(),
      PUBLIC_BASE_URL: preserve(), REPO_DIR: preserve(), SESSION_SECRET: preserve(),

      // git IS THE PERSISTENCE LAYER for this service — it clones the records repo on
      // boot and pushes every save. Railpack's runtime image does not include it, so
      // the first correct build still crash-looped on `spawnSync git ENOENT`.
      // (nixpacks.toml used to add it; Railpack ignores that file entirely.)
      // Not a secret, so it lives here in code rather than in the dashboard.
      RAILPACK_DEPLOY_APT_PACKAGES: "git",
    },
  });

  return project("tree-template-editor", {
    resources: [editor, editorVolume],
  });
});
