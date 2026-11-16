# Wensenlijstje

Een klein webappje om een cadeaulijst te maken en te delen met familie en vrienden. Gasten kunnen een cadeau reserveren of als gekocht markeren. De ontvanger ziet die reserveringen niet, zodat het een verrassing blijft.

De hele interface is in het Nederlands.

## Wat je ermee kunt

- Meer dan één lijstje maken, met een titel, een omschrijving en een gelegenheid (verjaardag, Sinterklaas, Kerst, of iets eigens).
- Cadeaus toevoegen, bewerken, verwijderen en van volgorde veranderen. Een cadeau heeft een naam, en verder mag alles leeg blijven: winkel-link, prijs, afbeelding, notitie en prioriteit.
- Een deellink die zonder account opent.
- Op die deellink een cadeau reserveren of als gekocht markeren, met een optionele naam. Andere gasten zien dat, zodat niet iedereen hetzelfde koopt.
- De beheerweergave krijgt die gegevens niet van de server. Ook op de deellink in dezelfde browser blijven reserveringen verborgen.

## Eigenaarstoegang

Er is geen account en geen wachtwoord. Wie een lijstje maakt, krijgt een **beheerlink** met een lange, willekeurige code. Die link is de sleutel: wie hem heeft, kan het lijstje aanpassen. Bewaar hem (de pagina zet hem ook in deze browser, onder “Op dit apparaat”).

De **deellink** is een andere URL. Daarmee kun je alleen kijken en reserveren, niet bewerken.

Deze keuze is bewust licht gehouden. Een magische link via e-mail heeft een mailserver, een inbox en een extra stap nodig. Voor een verjaardag of pakjesavond is één link die je bewaart eenvoudiger voor niet-technische familie. Het nadeel: raak je de beheerlink én de gegevens van deze browser kwijt, dan kan niemand het lijstje nog aanpassen. Een herstelmail is een logische volgende stap.

Reserveringen worden niet “verstopt” met CSS. De beheerpagina leest de reserveringstabel niet. In de browser waarin je het lijstje beheert, geldt dat ook voor de deellink. Open je de deellink in een andere browser of een privévenster, dan ben je gewoon een gast en zie je de reserveringen wél. Doe dat niet als je de verrassing wilt bewaren.

## Lokaal draaien

Je hebt Node.js 22.13 of nieuwer nodig. De database is SQLite via de ingebouwde module `node:sqlite`. Er hoeft niets extra’s gecompileerd te worden. Node kan bij het opstarten melden dat SQLite nog experimenteel is; dat is verwacht en de app werkt ermee.

```bash
npm install
npm run dev
```

`npm run dev` en `npm run build` gebruiken webpack. De standaard Turbopack-build van Next.js 16.4 liet een scriptbestand weg, waardoor de pagina wel verscheen maar knoppen niets deden.

Open [http://localhost:3000](http://localhost:3000).

Het databasebestand staat in `data/wensenlijstje.db` (dat pad kun je zetten met `WENSENLIJSTJE_DB`). De map `data/` wordt aangemaakt als hij nog niet bestaat.

Handig om te controleren:

```bash
npm test
npm run build
npm run e2e
```

`npm run e2e` bouwt de app, start hem op poort 3456 en klikt de hele stroom door: lijstje maken, cadeaus toevoegen, in een aparte browsersessie reserveren, en controleren dat de eigenaar de reservering niet ziet.

## Deployen

De app is een gewone Node-server met een bestand als database. Eén proces en een schijf die blijft staan, is genoeg. Serverless hosting zonder blijvende schijf (zoals Vercel) is geen goede match: daar verdwijnt het SQLite-bestand.

### Docker

```bash
docker build -t wensenlijstje .
docker run --rm -p 3000:3000 -v wensenlijstje-data:/data wensenlijstje
```

Zet `WENSENLIJSTJE_DB=/data/wensenlijstje.db` (staat al in de image). Achter HTTPS hoef je verder niets. Draai je bewust via gewoon HTTP, zet dan `COOKIE_SECURE=false`, anders onthoudt de browser de gast- en eigenaarcookie niet.

### Een kleine VPS, Fly.io of Railway

1. Node 22 installeren, of de Docker-image gebruiken.
2. Een volume koppelen aan `/data`.
3. De poort publiceren (3000) en HTTPS ervoor zetten via de platform-proxy of Caddy/nginx.
4. Eén instantie draaien. Meerdere processen op hetzelfde SQLite-bestand is niet de bedoeling.

Variabelen:

| Variabele | Betekenis |
| --- | --- |
| `WENSENLIJSTJE_DB` | Pad naar het databasebestand |
| `COOKIE_SECURE` | `true` of `false`. Standaard `true` als `NODE_ENV=production` |
| `PORT` | Poort voor `next start` |

Productie starten zonder Docker:

```bash
npm ci
npm run build
npm start
```

## Beperkingen

- Geen e-mail, geen wachtwoord, geen herstel als de beheerlink weg is.
- Eén reservering per cadeau.
- Afbeeldingen zijn een link, geen upload.
- Iedereen die de site kan openen, kan een lijstje aanmaken. Dat past bij een familie-site, niet bij een openbaar platform zonder limiet.
- `node:sqlite` is in Node 22 nog als experimenteel gemarkeerd.

## Mogelijke vervolgstappen

- Herstel via een magische e-maillink, zodat een zoekgeraakte beheerlink niet het einde is.
- Foto’s uploaden in plaats van alleen een link.
- Postgres of Turso als je meer dan één server wilt, of serverless wél wilt gebruiken.
- Een optionele code op de deellink.
- Slepen om de volgorde te wijzigen, naast de knoppen omhoog en omlaag.
