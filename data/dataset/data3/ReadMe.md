## 4.1 Sources des Données

### Sources Utilisées
* **Goud.ma Dataset:** Hugging Face repository `Goud/Goud-sum`.
* **Goud.ma donné par l'encadrant:** scrapé depuis goud.ma.

### Motivation du Choix
* Contient du contenu en **Darija écrit en lettres arabes**.

### Caractéristiques Linguistiques
* **Types de langues:** Darija et Arabe.

### Observations Terrain
* **Qualité des données :** Articles rédigés par des journalistes professionnels en Darija (alphabet arabe).
* **Avantages :** 
  * Volume important d'articles disponibles pour la collecte.
  * Le premier paragraphe contient systématiquement un résumé de l'article.
* **Problèmes rencontrés :**
  * Présence d'articles en arabe classique.
  * Présence de poèmes ou de simples vidéos qui complexifient le prétraitement.
  * Inclusion ponctuelle de mots en caractères latins.

---

## 4.2 Collecte & Nettoyage

### Méthode de Collecte
* Collecte manuelle des données.

### Étapes du Pipeline de Nettoyage
1. **Extraction :** Récupération ciblée du premier paragraphe de chaque article.
2. **Filtrage des Outliers :** Suppression des textes basée sur la longueur du premier paragraphe.
3. **Déduplication :** Identification et suppression des doublons.
4. **Suppression du Bruit :** Nettoyage automatique des émojis, des URLs et du spam.
5. **Normalisation Textuelle :** 
   * Suppression des diacritiques (Attahwil).
   * Suppression du Kashida/Tatweel (`ـ`, code `0x0640`) inséré entre les lettres arabes.

---

## 4.3 Annotation du Gold Dataset

### Processus de Création
1. **Sélection des données :** Extraction et sélection d'un échantillon ciblé de contextes pour l'annotation (800 contextes).
2. **Conception des paires QA :** Rédaction entièrement manuelle de l'ensemble des questions et réponses associées.
3. **Cadrage technique :** Établissement et application rigoureuse d'un guide d’annotation QA personnalisé.
4. **Livrable :** Constitution finale de notre gold standard partiel de référence.

### Cadre d'Annotation
* **Annotateurs :** Collaboration de l'ensemble des membres de l'équipe.
* **Difficulté majeure :** Processus d'annotation humaine particulièrement chronophage.

### Règles d'Annotation Strictes
* **Réponse extractive :** La réponse doit être directement extraite du texte.
* **Pas de paraphrase :** Interdiction de reformuler le texte original.
* **Concision :** Formulation de réponses courtes et directes.
* **Types de questions autorisés :** *Who, Where, When, What, How Many, Which*.
* **Types de questions interdits :** *Why, How*.
* **Contrainte d'objectivité :** Zéro recours à des connaissances externes au texte.
* **Méthode :** Annotation 100% humaine obligatoire.

---

## 4.4 Labellisation Semi-Automatique avec IA

### Infrastructure Technique
* **Infrastructure :** Google AI Studio API.
* **Modèle utilisé :** `gemini-3.1-flash-lite-preview` (Gemini 3.1 Flash Lite).

### Architecture du Processus de Génération
1. **Gestion des Clés :** Génération de clés API réparties sur les comptes Google des membres (2 pour member 1, 4 pour membre 2, soit un total de 6 clés actives).
2. **Segmentation :** Division du dataset initial en deux parties équitables pour chaque membre du groupe.
3. **Automatisation des Scripts :**
   * `label_starter.bat` : Script batch Windows configuré pour lancer 3 instances parallèles du script Python (`label.py`), en attribuant à chacune un `worker_id` et une clé API dédiée dans une nouvelle invite de commande.
   * `label.py` : Worker parallèle chargé de lire les textes depuis un fichier CSV, d'interroger l'API Gemini pour générer les paires QA, de sauvegarder les résultats et de mettre à jour le statut d'avancement.
4. **Exécution et Rendement :** Exécution quotidienne des scripts pour atteindre la limite de 500 requêtes par jour (RPD) par clé API, permettant de labelliser 3 000 contextes par jour (500 RPD × 6 clés), pour un total d'environ 10 000 paires QA générées.
5. **Consolidation :** Fusion finale des deux sous-datasets de paires QA obtenues.

---

## 4.5 Vérification et Validation

### Protocole de Révision
1. Lecture attentive des contextes sources.
2. Contrôle de la conformité des questions et des réponses vis-à-vis des règles d'annotation prédéfinies.
3. Validation de la typologie associée à chaque question.
4. Tri et classification en trois catégories : *Correct, À corriger, À supprimer*.

### Environnement de Travail
* **Vérificateurs :** Prise en charge collective par l'ensemble des membres de l'équipe.
* **Outils utilisés :** Label Studio couplé à une interface de labellisation personnalisée développée via du code XML.

---

## 4.6 Analyse des Erreurs de l’IA

* **Statut de l'analyse :** Toutes les erreurs détectées par la vérification Label Studio ont été analysées afin de déterminer les types d'erreurs commises par l'IA.
  
#### Taux d'Erreur Global et Répartition
* **Taux d'erreur global :** Le modèle affiche un taux de non-conformité de **7.8%**.
* **Répartition des anomalies :** Sur l'ensemble des paires générées, **4.8%** des données sont classées comme **"À corriger"** (erreurs mineures ou ajustements nécessaires) et **1.3%** sont catégorisées comme **"À supprimer"** (données totalement aberrantes ou hors-sujet). Le taux de réussite strict (**"Correct"**) s'élève à **92.2%**.

#### Analyse par Typologie de Question 
* **Le type "What" (Quoi) :** C'est le point noir de la génération avec le taux d'erreur le plus élevé, culminant à près de **13.2%**. L'IA peine à formuler des questions ou extraire des réponses précises pour ce type ouvert.
* **Le type "Which" (Lequel) :** Il représente le deuxième défi le plus important pour le modèle avec un taux d'erreur d'environ **10.6%**.
* **Le type "Where" (Où) :** Il affiche également une faiblesse notable avec un taux d'erreur de **9.2%**.
* **Les types plus performants :** Les questions de type **"How Many"** (environ **7.5%**) et **"Who"** (environ **4.5%**) s'en sortent mieux. Le type **"When"** (Quand) est le mieux maîtrisé par l'IA avec le taux d'erreur le plus bas du dashboard, situé juste en dessous de **4%**.

#### Répartition des Corrections 
* **Erreurs sur les Réponses (~53%) :** Plus de la moitié des corrections effectuées par l'équipe concernent les réponses fournies par l'IA (problème de délimitation du texte, extractions incomplètes ou paraphrases interdites).
* **Erreurs sur les Questions (~47%) :** Le reste des corrections est lié à des formulations de questions incorrectes, mal construites ou associées à une mauvaise typologie.

---

## 4.7 Statistiques de Performance

### Métriques (Avant Correction)
* **Volume de contextes et pairs QA:** 7 741 contextes labellisés manuellement

---

## 4.8 Correction des Erreurs

### Méthode de Traitement
* Tri des données aberrantes selon les trois catégories définies (*Correct, À corriger, À supprimer*).

### Difficultés Rencontrées
* Complexité arbitrale lors de la prise de décision entre la correction manuelle d'un contexte défectueux ou sa suppression pure et simple du dataset.

---

## 4.9 Statistiques du Dataset

### Distribution des Types de Questions
Pour analyser la structure des données générées par l'IA, la répartition par typologie de questions se présente comme suit :

* **Who :** 37 739 exemples, représentant **46.4%** du jeu de données global.
* **Where :** 22 515 exemples, représentant **18.2%** du jeu de données global.
* **What :** 18 970 exemples, représentant **14.6%** du jeu de données global.
* **When :** 13 126 exemples, représentant **9.3%** du jeu de données global.
* **How Many :** 10 073 exemples, représentant **6.7%** du jeu de données global.
* **Which :** 3 833 exemples, représentant **4.7%** du jeu de données global.

### Distribution des Types de Langues
La répartition linguistique des données générées se présente ainsi :

* **Arabic :** 609 exemples, représentant **7.9** du jeu de données global.
* **Arabizi :** 7 137 exemples, représentant **92.1%** du jeu de données global.

### Longueur Moyenne des Éléments (en mots)
L'analyse quantitative de la longueur du texte pour chaque composante des paires générées donne les résultats moyens suivants :

* **Longueur moyenne des questions :** ~7.26 mots.
* **Longueur moyenne des réponses :** ~2.66 mots.
* **Longueur moyenne des contextes :** ~29.66 mots.

---

## 4.10 Limites

* **Biais des données :** Les données proviennent uniquement d'un site d'actualités (Goud.ma). Le vocabulaire est donc très journalistique. Le modèle aura du mal à comprendre le langage familier de tous les jours.
* **Limites linguistiques :** La Darija n'a pas de règles d'écriture fixes. De plus, la forte présence de l'Arabizi (32.5% des données) rend le traitement du texte plus difficile et moins précis.
* **Limites du modèle IA :** Le modèle utilisé (`gemini-3.1-flash-lite-preview`) est une version légère. Il peut parfois inventer des réponses (hallucinations), reformuler le texte au lieu de copier la réponse exacte, ou mal comprendre les expressions typiquement marocaines.
---

## 4.11 Améliorations

### Axes de Développement Futurs
* **Données :** Intégrer nativement de la Darija combinée à de l'Arabizi directement depuis la source de collecte, plutôt que de s'appuyer sur une conversion descendante via un LLM.
* **Modèle IA :** Migrer vers un grand modèle de langage (LLM) plus performant pour optimiser la pertinence de la première passe de labellisation.
