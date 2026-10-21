# membres du groupe 1: Marouane & Nawal

# our group work
## folder structure
inside dataset/data1:
```
dataset/data1/
|-- original/                     # original data provided (the split of data for our group)
|-- bronze/                       # cleaned version ready to be labeled (manual + LLM)
|-- gold/                         # manually labeled data
|-- silver/                       # the complete labeled data and fully manually checked
`-- notebooks/
  |-- Step1_Cleaning_EDA.ipynb   # data preprocessing & cleaning avant labellisation + EDA after cleaning
  |-- Step2_Final_Cleaning.ipynb # data verification & final cleaning apres labellisation
  `-- Documenatation_data.ipynb
```
- notebooks/Documenatation_data.ipynb 

# 1 🌍 Sources des Données

## Vue d'ensemble
Ce notebook documente complètement le dataset `QA-Labled-Data_final.csv` destiné à un projet de **Question Answering Contextuel (QA contextuel)**.

### 🌐 Source : Goud.ma

**Plateforme journalistique marocaine spécialisée en actualités**

#### Informations générales

- **URL** : https://www.goud.ma
- **Type** : Plateforme d'actualité en ligne marocaine
- **Période couverte** : Septembre 2024 → Janvier 2026
- **Accessibilité** : Données publiques

#### Domaines de contenu

| Domaine | Description | Proportion |
|---------|-------------|-----------|
| 🏛️ **Politique** | Actualités gouvernementales, décisions officielles | 25% |
| 📰 **Actualité nationale** | Faits divers, nouvelles du pays | 20% |
| ⚖️ **Faits divers** | Incidents, crimes, procédures légales | 20% |
| 💼 **Économie** | Développement économique, commerce | 15% |
| 🏃 **Sport** | Événements sportifs | 12% |
| 🎭 **Culture** | Vie culturelle marocaine | 8% |

#### Pourquoi Goud.ma ?

 **Structure narrative adaptée** : Articles bien structurés

 **Densité sémantique élevée** : Faits explicites et vérifiables

 **Richesse en entités nommées** : Personnes, lieux, dates, chiffres

 **Contenu factuel** : Information non-ambiguë

 **Authentique Darija** : Représentation naturelle de la langue dialectale
 
 **Données publiques** : Accessibles et légales

# 2 🧹 Collecte & Nettoyage

- Méthode de collecte :
  - (données fournies par le prof)
- Étapes de nettoyage :
  - Suppression du bruit
  - Doublons
  - suppression des URL, emoji
  - suppression de la ligne de signature au debut de l'auteur ou de goud.ma
  - Normalisation
  - gestion des valeurs aberrantes (outliers) par winsorizing de la longueur du contexte pour une longueur normalisee


# 3 🏷️ Annotation du Gold Dataset

### Processus de Création

1. **Conception des paires QA :** Rédaction entièrement manuelle de l'ensemble des questions et réponses associées au contexte (**866 paires QA**) en respectant le cahier des charges de labellisation contextuelle.
2. **Variete des questions :** creation de questions variees pour assurer la qualite de cette partie de donnees qui sert comme gold standard dataset.
3. **Livrable :** Constitution finale de notre gold standard dataset.

> Difficulté: Processus d'annotation humaine particulièrement chronophage.

# 4 🤖 Labellisation Semi-Automatique avec IA

* **Modèle utilisé :** `gemini-3.1 pro` et `Gemini 3 Flash`

1. **Segmentation :** Division du dataset initial en des parties pour l'envoyer dans une requete a etre labellise par le LLM utilise.

2. Enregistrement des reponses sous forme de texte, puis conversion en JSON puis CSV.

3. Nettoyage des resultats : suppression des doublons dans la reponse en utilisant une colonne `id`.

4. Renvoi d'une requete pour labelliser les donnees manquantes ou de mauvaise qualite.

# 5 🔍 Vérification et Validation

- une verification manuelle sur ~8k lignes de donnees
- une verification automatique utilisant le debut de question comme indice pour voir la variete des types de questions dans le dataset

# 6 📊 Analyse des Erreurs de l’IA

Corrige manuellement, les details sont dans le notebook **Step2_Final_Cleaning.ipynb** (nettoyage apres labellisation LLM).

* **Taux d'erreur global :** Taux d'erreur de correction: **5.68%**
# 9 📊 Statistiques du Dataset

- dataset
  - gold: 866 rows **(manually written)**
  - silver: 7334 rows; full data - gold **(manually checked)**
  - final (8200 rows) = silver + gold






