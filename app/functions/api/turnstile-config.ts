/**
 * GET /api/turnstile-config — hands the browser the PUBLIC Turnstile site key.
 *
 * The site key is not a secret (it ships in the widget markup either way), but
 * serving it from env rather than baking it into the build means BOTH Turnstile
 * keys live in the Cloudflare dashboard — you set them in one place and no
 * rebuild is needed to change them. When the key is unset the endpoint returns
 * `{ siteKey: null }` and the form renders no widget (fail-open), so the site
 * works before the keys exist.
 *
 * The SECRET key is never read here — only the Function's server-side
 * verification touches it.
 */

interface Env {
  TURNSTILE_SITE_KEY?: string;
  [key: string]: string | undefined;
}

export const onRequestGet: PagesFunction<Env> = (context) =>
  new Response(JSON.stringify({ siteKey: context.env.TURNSTILE_SITE_KEY ?? null }), {
    status: 200,
    headers: {
      'content-type': 'application/json',
      // Public and rarely changing; let the edge cache it briefly.
      'cache-control': 'public, max-age=300',
    },
  });
