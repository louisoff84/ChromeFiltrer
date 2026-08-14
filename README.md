# ChromeFiltrer v2

Extension Chrome Manifest V3 avec moteur de filtrage et panel de gestion entièrement local.

## Panel local

Le panel permet de gérer la protection, les filtres, les mots et sélecteurs personnalisés, whitelist/blacklist, profils Léger/Normal/Strict, statistiques locales, sauvegardes JSON et diagnostic.

## Optimisations

- `MutationObserver` au lieu d'un polling permanent
- traitements regroupés avec `requestAnimationFrame`
- règles compilées et paramètres chargés une seule fois par page
- statistiques agrégées par domaine
- aucune API distante
- aucune dépendance JavaScript
- stockage `chrome.storage.sync` pour la configuration
- stockage `chrome.storage.local` pour statistiques et données locales
- interface responsive

## Installation

1. Télécharger le dépôt.
2. Ouvrir `chrome://extensions`.
3. Activer **Mode développeur**.
4. Choisir **Charger l'extension non empaquetée**.
5. Sélectionner le dossier ChromeFiltrer.

> La v2 pose l'architecture du panel pour accueillir progressivement les modules avancés sans transformer l'extension en un script monolithique.
