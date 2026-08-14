# ChromeFiltrer

Extension Chrome Manifest V3 légère pour filtrer les éléments gênants pendant la navigation.

## v1.0.0

- activation/désactivation instantanée
- masquage d'éléments publicitaires courants
- réduction des popups et overlays
- détection simple du contenu sponsorisé
- filtre optionnel des bannières cookies
- liste personnalisée de mots bloqués
- sélecteurs CSS personnalisés
- paramètres synchronisés avec `chrome.storage.sync`
- prise en charge des pages dynamiques via `MutationObserver`
- mises à jour regroupées avec `requestAnimationFrame`
- aucune dépendance et aucun serveur externe
- interface popup + page d'options

## Installation locale

1. Télécharger ou cloner le dépôt.
2. Ouvrir `chrome://extensions`.
3. Activer **Mode développeur**.
4. Cliquer sur **Charger l'extension non empaquetée**.
5. Sélectionner le dossier du projet.

## Confidentialité

ChromeFiltrer n'envoie pas l'historique de navigation vers un serveur. Les règles sont appliquées localement dans le navigateur.

## Performance

Le moteur évite le polling permanent : il observe les changements du DOM et regroupe les nouveaux traitements sur une frame afin de limiter le travail inutile.
