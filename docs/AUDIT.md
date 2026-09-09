# Analiză și predare — Amanet No Limit

Data: 9 septembrie 2026. Bază: main, fd2e44ff7beb9e7e9ee47d5a672f90b27e0c349b.

## Constatări
- Site-ul public și repository-ul sunt versiuni distincte. Site-ul public are rute /Pagini/*.html; GitHub are pagini statice la rădăcină.
- Motorul de bursă solicita API-uri, dar ignora rezultatul și fixa aurul 24K la 647,67 RON/g. Timerul de actualizare crea impresia falsă de cotație live inclusiv la eșecul cererilor.
- Formularul deschidea WhatsApp și arăta „Solicitare înregistrată”, deși nu avea endpoint de salvare. Fotografiile erau doar previzualizate local, nu atașate mesajului.
- Catalogul conținea prețuri, reduceri, garanții, stoc implicit și fotografii generice fără proveniență verificată pentru bunul oferit. Datele originale sunt păstrate în docs/catalog-original.json pentru verificare.
- Calculatoarele sincronizau inputurile numerice cu sliderul prin clamp implicit și puteau înlocui valori incomplete cu valori implicite. Au fost înlocuite cu validare explicită și funcții pure.
- Pagina publică de termeni și cea GDPR au returnat 404 la verificare; contactul a returnat protecție anti-bot. Pagina de telefoane conținea text despre design și ratinguri fără sursă.
- Nu există backend, autentificare, stoc centralizat, plăți, rezervări confirmate sau cont de contract. Nu sunt prezentate ca implementate.

## Ce s-a schimbat
- Design comun negru, auriu și suprafață deschisă pentru calculatorul rapid; CSS adaptiv, fonturi de sistem, fără dependențe externe.
- Pagini Acasă, Calculator, Evaluare, Magazin, Contact și informații de utilizare.
- Calculator rapid cu transferul alegerilor către pagina completă; calcule monetare la două zecimale, validarea intervalelor, cost total transparent.
- Tarifele sunt explicit orientative, centralizate în js/site-config.js. Fără API-uri criptomonede, actualizări fictive sau afirmații de bursă oficială.
- Formular validat, fotografii locale cu limită de număr/dimensiune și eliminare; mesaj verificabil, WhatsApp și Web Share unde există suport. Fără confirmare falsă de primire.
- Catalog cu căutare fără diacritice, filtre, sortare, stare fără rezultate și linkuri de cerere personalizate. Prețurile și garanțiile neverificate nu se afișează ca certe.
- Navigare cu tastatura, dialog nativ, stări ARIA, reducerea mișcării, legături de orientare în loc de iframe încărcat automat.
- Pagini statice livrate direct la rădăcină; fără build sau instalare de dependențe.

## Înainte de înlocuirea site-ului public
1. Confirmarea adreselor, programului de sărbători, tarifelor și condițiilor comerciale cu proprietarul.
2. Confirmarea stocului, fotografii reale și prețuri pentru fiecare produs. Arhiva de catalog nu trebuie publicată în webroot.
3. Completarea datelor operatorului (denumire juridică, CUI, sediu, contact pentru solicitări privind datele) și a informării privind prelucrarea efectivă în agenție. Paginile livrate descriu comportamentul tehnic al acestei versiuni, nu sunt o validare juridică completă.
4. Identificarea produsului GoDaddy: Web Hosting/cPanel, Plesk sau Website Builder. Accesul la cont nu a fost furnizat, infrastructura și setările nu au fost verificate.
5. Backup complet al fișierelor și al eventualelor baze de date vechi. Publicare întâi într-un subfolder de staging, verificare pe telefon, apoi înlocuire controlată.
6. Nu se modifică DNS sau setările de email. Dacă există WordPress ori alte reguli .htaccess, acestea se inspectează și se îmbină, nu se suprascriu automat.

## Limitări
Nu a fost efectuată verificare vizuală în browser. Mediul local a încetat să răspundă în timpul lucrului; livrarea finală a fost pregătită prin conectorul GitHub, verificată static și acoperită de teste de regresie. Nu s-a trimis niciun mesaj real, nu s-a publicat pe domeniu și nu au fost accesate datele GoDaddy. Nu este conectată o sursă reală de cotații sau o bază de date de produse.

Site-ul public afișează și autentificare și un preview de contract pe /Pagini/amaneteaza.html. Backendul și funcționarea lor reală nu au fost verificate. Înainte de migrare, inventariați aceste funcții și păstrați datele/rutele existente dacă sunt active.

## Verificări efectuate pe livrarea finală
- 49 de aserțiuni pentru calculele aurului, comisioane, rotunjiri, limite și scadențe: trecute, în runtime JavaScript.
- Sintaxa tuturor fișierelor JavaScript: validă.
- 16 pagini HTML și 274 legături locale/resurse: ținte existente, ancore valide, fără ID-uri duplicate; câte un H1 pe pagină principală.
- Scriptul Python suplimentar pentru validarea HTML este inclus pentru rulare locală; nu a putut fi executat în mediul local blocat.
- Nicio verificare în browser, nicio trimitere reală de mesaj, nicio accesare a contului GoDaddy.

Surse: https://github.com/nistordaniel06-cpu/amanet-no-limit/tree/fd2e44ff7beb9e7e9ee47d5a672f90b27e0c349b ; https://amanetnolimit.com/ ; https://amanetnolimit.com/Pagini/amaneteaza.html ; paginile de categorie /Pagini/telefoane.html, laptopuri.html, bijuterii.html, ceasuri.html și auto.html.
