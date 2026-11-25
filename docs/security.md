# Security and safety (static site, no data)

## 1. Threat model
| Asset | Threat | Defence |
|---|---|---|
| Our credibility (accuracy points) | Wrong or loose vendor claim | claims.json, baselines, tags, `check_claims.py --release`, Fair Fight concessions |
| Intel trademark | Misuse of logo or implying endorsement | No logo files. Text footer with Intel's trademark line. Footer: "A student project made for the CMRIT x Intel 1 Million Minds challenge." |
| Visitors | XSS through URL params | Only `lang` (en/hi allowlist) and `facilitator` (1) are read. Render text via `textContent`, never `innerHTML` with variable data |
| Visitors | Tracking | No analytics, cookies, storage, accounts, forms (ADD-10) |
| Supply chain | Malicious npm package | Few dependencies, lockfile committed, `npm ci` in CI, `npm audit` reported, no post-install scripts unless reviewed |
| Availability at jury | Venue Wi-Fi fails | Self-hosted assets, fallback video (DEL-05) |
| Hosting | GitHub Pages rules | Not a commercial transaction site (verified rule: Pages must not run a business or e-commerce site). Game sells nothing and collects nothing |

## 2. Secrets
There are no secrets. Do not create API keys. If an agent asks for one, STOP and report (it means scope drifted). `.env.example` holds public values only. Never paste tokens in chat.

## 3. Content Security Policy (meta tag, because Pages cannot set headers)
```html
<meta http-equiv="Content-Security-Policy"
 content="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; media-src 'self' blob:; base-uri 'self'; form-action 'none'; object-src 'none'">
```
Consequence: no inline `<style>` blocks, no `style="..."` attributes in markup, no inline scripts. Setting CSS variables with `element.style.setProperty` from script is allowed. The grain overlay uses a data-URI image (allowed by `img-src data:`). If a Vite build injects something blocked, fix the build, do not loosen the policy.

## 4. Input handling
Keyboard and pointer only. Validate URL params with an allowlist. No file upload. No user text input anywhere.

## 5. Privacy copy
Say "can run on your laptop". Do not say "always private" or "nothing leaves your laptop" (apps and settings differ).

## 6. Dependency and CI hygiene
CI runs lint, typecheck, tests, build, `npm audit --audit-level=high` (report only), and a grep that fails on `localStorage|sessionStorage|document.cookie|gtag|analytics|fetch\(` outside tests.

## 7. Required security tests
1. e2e: network log shows zero requests to other origins.
2. unit: `lang=<script>` param falls back to `en`.
3. grep test: no `innerHTML` assignment with non-constant data.
4. CSP present on every html page; app still works under it.

## 8. Incident checklist (demo day)
Page broken after a deploy: revert to last tag with `git revert`, redeploy, switch to fallback video. Wrong claim spotted: remove the claim from the screen first, fix later.
