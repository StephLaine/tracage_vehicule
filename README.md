# Tracage ALPR — Maquette frontend

Interface de supervision ALPR (Port-au-Prince), maquette interactive avec données mockées.

## Lancement

```bash
cd frontend
npm install
npm run dev
```

Ouvrir [http://localhost:5173](http://localhost:5173). Connexion : n'importe quel email/mot de passe → tableau de bord.

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Connexion (démo) |
| `/` | Tableau de bord + flux temps réel |
| `/alerts` | Alertes filtrables |
| `/search` | Recherche et trajectoire (ex. `HT-2245-XY`) |
| `/plates` | Plaques signalées |
| `/cameras` | État des 3 caméras |

## Démo rapide (5 min)

1. Login → Dashboard : observer les nouvelles détections toutes les 8 s
2. Attendre une alerte rouge (toast)
3. Recherche → `HT-2245-XY` → timeline A → B → C
4. Alertes → ouvrir une modal, valider
5. Plaques signalées → ajouter une plaque
6. Caméras → carte des positions
