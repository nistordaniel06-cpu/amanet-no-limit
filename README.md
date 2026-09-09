# Amanet No Limit

Redesign static, în română, pentru site-ul existent găzduit la GoDaddy. HTML/CSS/JavaScript fără dependențe de runtime sau build.

Pagini: Acasă, Evaluare, Calculator, Magazin, Contact și informații despre utilizare. Fotografiile rămân locale până la partajare. WhatsApp nu este un backend de înregistrare automată.

## Verificare și împachetare

    node tests/calculators.test.js
    python3 tests/static_check.py
    python3 scripts/package-site.py

Tarife: js/site-config.js. Modele de catalog: js/catalog-data.js. Datele vechi se păstrează în docs/catalog-original.json și nu intră în arhiva de publicare.

Consultați [analiza](docs/AUDIT.md) și [instrucțiunile GoDaddy](docs/DEPLOY-GODADDY.md) înainte de publicare. Nu sunt implementate conturi, solduri de contract, plăți, rezervări garantate, stoc centralizat sau cotații live.

Testarea vizuală pe dispozitive și verificarea panoului GoDaddy rămân necesare înainte de înlocuirea site-ului public.
