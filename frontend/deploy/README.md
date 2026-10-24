# VandiPilot landing page — deploy folder

This folder is exactly what gets published to Netlify. It is a single static
page with no build step: `publish = "."`, `command = ""`.

Built for Jira **ON-19** — "deploy the landing page so that customers can make
online booking/enquiries".

## Contents

| File                              | Purpose                                              |
|-----------------------------------|------------------------------------------------------|
| `index.html`                      | The page. All CSS and JS inlined, no external assets. |
| `robots.txt`                      | Allows indexing, points at the sitemap.              |
| `sitemap.xml`                     | Single URL, for Google Search Console.               |
| `netlify.toml`                    | Security headers, cache rules, www/apex redirect.    |
| `og-image.png`                    | 1200×630 social preview card.                        |
| `favicon.svg` / `favicon-32.png`  | Browser tab icon.                                     |
| `apple-touch-icon.png`            | iOS home-screen icon (180×180).                      |
| `testimonials-section.html.disabled` | Parked markup, not served. See below.             |

## BEFORE THE FIRST DEPLOY — two placeholders must be replaced

1. **`vandipilot.com`** — appears in `index.html` (canonical, og:url,
   og:image, twitter:image, JSON-LD), `robots.txt`, `sitemap.xml` and
   `netlify.toml`. Replace with the live Hostinger domain, including the
   `https://` scheme and no trailing slash, e.g. `https://www.vandipilot.in`.

2. **`mwvrprwy`** — appears three times in `index.html`, once in each
   form action (quick booking, Book a Pilot popup, contact). Replace with the
   form ID from the Formspree dashboard. Enquiries arrive at the mailbox
   configured on that Formspree form; each submission carries a `source` field
   (`quick-booking` / `popup` / `contact`) and a matching `_subject` line.

Find them with: `grep -rn "vandipilot.com\|mwvrprwy" .`

## What was removed before launch (ON-19)

The story called for hiding content that is not based on real figures. Removed:

- Hero chips "4.8 Rating" and "10,000+ Trips" — replaced with
  "Transparent Rates" and "Kannur & Outstation".
- Trust cards "4.8★ Average Rating" and "10,000+ Trips Completed" — replaced
  with "Local & Outstation" and "Book in a Minute".
- The whole testimonials section (three invented quotes with names and star
  ratings), plus its "Reviews" link in the mobile drawer. The markup is parked
  in `testimonials-section.html.disabled`; restore it only once there are real,
  attributable reviews.
- The yellow "Demo preview" banner.
- Four dead `href="#"` social icons, replaced with WhatsApp, phone and email.

No `aggregateRating` is published in the structured data, for the same reason.

## Still outstanding

- **Terms and Privacy** in the footer still point at `#`. A page collecting
  names, phone numbers and emails should have a real privacy policy.
- **Hours** (Mon–Sun, 6:00 AM – 11:00 PM) were carried over from the design and
  have not been confirmed with the business.
- **WhatsApp**: the page links to `wa.me/919074025803`, which opens a chat.
  Delivering form submissions straight into WhatsApp Business needs the paid
  Cloud API; Formspree covers that for now.
- **Fonts** load from Google Fonts. If Lighthouse flags render-blocking,
  self-host Inter in this folder.

## Deploy steps

1. Replace both placeholders above; commit.
2. Netlify → Add new site. Either drag this folder in, or connect the repo and
   set the publish directory to this folder's path.
3. Check the generated `*.netlify.app` URL on a phone first.
4. Netlify → Domain management → add the custom domain; note the DNS records.
5. Hostinger → DNS Zone → point the apex at Netlify's A record and `www` at the
   site's CNAME. (Or switch nameservers to Netlify DNS — simpler, but moves all
   DNS management across.)
6. Wait for DNS, then enable HTTPS (Let's Encrypt) and Force HTTPS in Netlify.
7. Uncomment the matching redirect block in `netlify.toml` so only one of
   apex/www is canonical, and make sure it agrees with the canonical tag.
8. Submit a real enquiry from the live site and confirm it arrives.
9. Google Search Console → add the property, submit `sitemap.xml`.
10. Run Lighthouse on mobile. Move ON-19 to Done.
