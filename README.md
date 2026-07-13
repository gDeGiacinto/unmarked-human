# BPM-THERAPY — redesigned site + CMS

A from-scratch rebuild of guydegiacinto.com, keeping the same content (hero, live
stream schedule, music/mixes, video, about, contact/booking) with a new visual
design and a full content admin — no WordPress required.

## How it's built

- **No framework, no build dependencies.** `build.js` is a plain Node script
  that reads `content/site.json` and renders `templates/index.html` into
  `dist/index.html`. Nothing to `npm install`, nothing to break.
- **Content lives in `content/site.json`** — every piece of text, every stat,
  every schedule row, every social link.
- **Admin UI at `/admin`** is [Decap CMS](https://decapcms.org) (the actively
  maintained fork of Netlify CMS), loaded from a CDN — a proper visual editor
  with forms for every section, image uploads, and add/remove/reorder for
  lists like the stream schedule and tracks.
- Editing content in `/admin` commits straight to `content/site.json` in your
  GitHub repo. Netlify sees the commit and rebuilds automatically — edits go
  live in about a minute, no code, no redeploying by hand.

## Local preview

```
node build.js        # renders content/site.json -> dist/index.html
cd dist && python3 -m http.server 8080
```

Open http://localhost:8080. The `/admin` login won't work locally — Decap CMS
needs the git-gateway backend, which only exists once this is deployed to
Netlify (see below).

## Deploying

Two things need to be set up: (1) a host that builds and serves the site,
and (2) login for `/admin` so it can commit content edits to GitHub.

**Note on `/admin` login:** Netlify Identity + Git Gateway used to be the
default way to do this, but Netlify has deprecated it. This project is
configured to use **[DecapBridge](https://decapbridge.com)** instead — a
free, purpose-built login service for Decap CMS. It works the same way no
matter which host you pick below.

### 1. Push this folder to a new GitHub repo

```
cd site
git init
git add .
git commit -m "Initial redesign"
git branch -M main
git remote add origin <your-new-repo-url>
git push -u origin main
```

### 2. Set up admin login with DecapBridge

1. Go to [decapbridge.com](https://decapbridge.com) and sign up (free).
2. Create a new "Site," link it to the GitHub repo you just pushed.
3. DecapBridge gives you the exact `backend:` block for `admin/config.yml`
   — copy the `repo:` value it shows you into that file (it's currently a
   placeholder: `YOUR-GITHUB-USERNAME/YOUR-REPO-NAME`), commit, and push.
4. In DecapBridge, invite yourself as an editor with guy@guydegiacinto.com.

### 3. Pick a host and connect the repo

Either of these works — pick whichever is easier for you:

**Option A — Sevalla** (built by Kinsta, so it's the same account/billing
you already have). Free static-site tier.
1. In your Kinsta/Sevalla dashboard, create a new Static Site from the
   GitHub repo.
2. Build command: `node build.js` — Publish/output directory: `dist`.
3. Deploy. Sevalla gives you a `*.sevalla.app` URL to test with first.

**Option B — Netlify** (still a fine static host, just not for the old
Identity auth). New site from Git → pick the repo → it reads
`netlify.toml` automatically (build command `node build.js`, publish `dist`).

### 4. Point your domain and retire Kinsta WordPress

1. Verify the new site works on its temporary `*.sevalla.app` /
   `*.netlify.app` URL first — click through every section, test `/admin`.
2. At your domain registrar (or in Kinsta's DNS if that's where
   guydegiacinto.com is managed), update the DNS records to point at the
   new host, following the exact records Sevalla/Netlify shows you under
   its domain settings.
3. DNS changes can take a few hours to propagate. Leave the old Kinsta
   WordPress site running until you've confirmed guydegiacinto.com is
   serving the new site everywhere.
4. Once confirmed, cancel or downgrade the Kinsta WordPress hosting plan
   (Sevalla is a separate product/billing line, so this won't affect the
   new site).

## Replacing the placeholder art

`assets/img/hero.svg` and `assets/img/studio.svg` are abstract placeholders
standing in for real photos. Upload real images through the Hero Image /
About Image fields in `/admin` — they'll land in
`assets/img/uploads/` and replace the placeholders automatically.

## Wiring up the real pieces

A few sections are marked as demo placeholders in the original site and
carried over intentionally so nothing breaks:

- **Live stream embed** (Stream section) — paste a YouTube/Twitch live URL
  in the admin's "Live Embed URL" field.
- **Music embeds** (Music section) — paste SoundCloud/Mixcloud player URLs.
- **Video cards** — paste YouTube URLs (watch or share links both work).
- **Contact form** — currently shows an in-page "queued" confirmation only.
  Wire it to Formspree or Netlify Forms to actually receive emails; ask and
  I can set that up.
