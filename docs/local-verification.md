Required before every Fly deploy

* [ ] `fetch('/api/health')` → no Fly headers locally
* [ ] CTA hover shows `http://localhost:4000/api/campaigns/:id/click`
* [ ] Clicking CTA increments `rawHits` and `invoicesWithClicks`
* [ ] Campaign delete succeeds locally
* [ ] `docker compose logs api` shows no Prisma P2021/P2003
* [ ] No production domain appears in local PDFs/emails
