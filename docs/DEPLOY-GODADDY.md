# Publicarea pe domeniul existent

Această versiune este un site static. Nu necesită Node.js, npm, PHP sau bază de date pentru funcțiile livrate. Nu a fost publicată pe domeniul existent.

## 1. Identifică găzduirea

În contul GoDaddy verifică produsul care găzduiește efectiv domeniul: Web Hosting/cPanel, Plesk, Managed WordPress sau Websites + Marketing. Instrucțiunile de mai jos sunt condiționate de existența accesului la fișierele website-ului; nu presupune că toate produsele au același panou. Domeniul și găzduirea pot fi produse separate.

## 2. Pregătește conținutul

- Confirmă tarifele, comisioanele, telefonul, adresa și programul. Tarifele sunt în js/site-config.js; acum sunt explicit orientative.
- Verifică fiecare model din js/catalog-data.js. Prețurile și garanțiile originale sunt în docs/catalog-original.json, doar pentru revizuire internă. Site-ul nou nu le prezintă ca certe.
- Completează datele firmei și informarea despre prelucrarea efectivă a datelor. Paginile de informații livrate descriu comportamentul acestei versiuni, nu sunt o verificare juridică a activității.
- Site-ul public afișa cont/autentificare și preview de contract. Confirmă dacă sunt funcții folosite și unde sunt datele lor; implementarea GitHub nu le include. Nu șterge backend sau baze de date existente.

## 3. Creează arhiva pentru încărcare

Descarcă această ramură din GitHub, apoi rulează:

    python3 scripts/package-site.py

Rezultatul amanet-godaddy.zip conține doar paginile și fișierele publice. Nu încărca întregul ZIP de surse GitHub în rădăcina publică: conține documentație și date de catalog arhivate.

## 4. Testează înainte de înlocuire

Fă un backup descărcabil al fișierelor vechi și al oricăror baze de date. În panoul de găzduire, identifică directorul document-root al domeniului; pentru unele configurări cPanel este public_html, dar un domeniu suplimentar poate avea alt director.

Încarcă/extrage arhiva într-un subfolder de test. Paginile și resursele au legături relative și pot fi previzualizate acolo. Pentru subfolder configurează separat protecție împotriva indexării; robots.txt de la rădăcina domeniului și meta/canonical trebuie verificate înainte de deschiderea publică a staging-ului.

Pe telefon și desktop verifică: meniul; 10g aur 14K; un împrumut de 1.000 lei/30 zile; căutare și filtre; date de formular invalide; fotografii și eliminarea lor; dialogul; deschiderea WhatsApp și atașarea manuală; navigarea în Maps/Waze. Trimiterea unui mesaj real se face doar dacă o dorești.

## 5. Înlocuiește controlat

După verificare, copiază numai conținutul arhivei în directorul domeniului. Controlează prioritatea index.html față de un eventual index.php vechi; păstrează posibilitatea de rollback. Nu șterge folderele care aparțin unor aplicații existente. Nu înlocui automat .htaccess, setările DNS sau emailurile.

Fișierele Pagini/*.html păstrează accesul din legăturile vechi prin redirecționare HTML. Pentru redirecturi HTTP 301 pe un server Apache compatibil, adaptează manual exemplul din docs/apache-redirects.example; acesta se aplică doar după confirmarea rădăcinii și a regulilor existente. Pentru Plesk/IIS folosește setările echivalente ale serverului.

Verifică HTTPS, cache-ul și toate rutele pe domeniul final. Publică sitemap.xml și confirmă că staging-ul rămâne neindexat. Păstrează backupul până când noua versiune este verificată în producție.

## Revenire

Restaurează fișierele și regulile serverului din backup. Codul nou nu modifică baze de date sau DNS, deci nu există migrații de date de inversat pentru această versiune.
