# Worker Cloudflare : génération du fichier calendrier

Déploiement (une fois le compte Cloudflare créé) :

    cd worker
    npx wrangler login      # ouvre le navigateur, autoriser
    npx wrangler deploy     # affiche l'URL https://rdv-ics.<compte>.workers.dev

Puis coller cette URL dans `icsEndpoint` du bloc CONFIG de `index.html`.

Test : https://rdv-ics.<compte>.workers.dev/?s=Test&d=2026-10-20&t=19:30&l=Paris
