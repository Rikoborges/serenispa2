# 🧪 Guide de Test Manuel — SereniSpa

## ✅ Checklist complète pour valider les améliorations

### Phase 1: Préparation

- [ ] Branche `claude/analyze-serenispa-L67PR` checkout
- [ ] `npm install` complété
- [ ] Serveur démarré: `node index.js`
- [ ] Vérifier dans les logs: `Server running on port 3000`
- [ ] MongoDB connecté (local ou Atlas)

### Phase 2: Créer les thérapeutes

```bash
# Endpoint: POST /api/admin/seed-therapists
curl -X POST http://localhost:3000/api/admin/seed-therapists
```

**Vérifier:**
- ✅ Réponse 200 OK
- ✅ Message: "Therapists créés et massages mis à jour"
- ✅ 3 thérapeutes retournés (Ana, Léo, Julie)

**Vérifier en BD:**
- Collection `therapists`: 3 documents
- Collection `massages`: 4 documents (avec `therapistId` assigné)

### Phase 3: Client - Créer un compte

1. Ouvrir `http://localhost:3000`
2. Scroller jusqu'à "Connexion"
3. Cliquer "Créer un compte"
4. Remplir:
   - Nom: `Jean Dupont`
   - Email: `jean@example.com`
   - Téléphone: `06 12 34 56 78`
   - Password: `password123`
5. Cliquer "Créer mon compte"

**Vérifier:**
- ✅ Toast: "Compte créé ! Connectez-vous."
- ✅ Formulaire basculé à "Connexion"
- ✅ BD: User créé

### Phase 4: Client - Login

1. Email: `jean@example.com`
2. Password: `password123`
3. Cliquer "Se connecter"

**Vérifier:**
- ✅ Toast: "Connexion réussie !"
- ✅ Menu change: "Mon compte" au lieu de "Connexion"
- ✅ Token stocké dans localStorage

### Phase 5: Formulaire de booking - Affichage des slots

1. Scroller à "Réserver un Soin"
2. Voir le formulaire (précédemment caché)
3. Dropdown: Sélectionner **"Massage Relaxant (Ana)"**

**Vérifier:**
- ✅ Dropdown montre les 4 massage avec therapiste
- ✅ Ex: "Massage Relaxant (Ana) (75 €)"
- ✅ Section "Créneau horaire" s'actualise

**Vérifier les slots (⭐ NOUVEAU):**
- ✅ Slots apparaissent groupés par date
- ✅ Format: "Lundi 21 Avr" → "10:00 ✓", "11:00 ✓", "12:00 (Occupé)"
- ✅ Slots libres: clicables, fond blanc
- ✅ Slots occupés: grisés, non-clicables

### Phase 6: Booking - Sélectionner un créneau

1. Cliquer sur un slot **disponible** (ex: 10:00)

**Vérifier:**
- ✅ Slot devient vert/actif (classe `.active`)
- ✅ Bouton "Confirmer la réservation" reste actif

### Phase 7: Booking - Confirmer réservation

1. Cliquer "Confirmer la réservation"

**Vérifier:**
- ✅ Toast: "✅ Réservation confirmée !"
- ✅ Formulaire reset (dropdown vide, slots disparaissent)
- ✅ BD: Réservation créée

**Vérifier détails BD:**
```javascript
{
  userId: "...", // Jean Dupont
  massageId: "...", // Massage Relaxant
  therapistId: "...", // Ana
  date: ISODate("2026-04-21T10:00:00Z"),
  statut: "confirmé"
}
```

### Phase 8: Test de conflit (double-booking) ⭐

1. Sans recharger, refaire un booking:
   - Massage: "Massage Relaxant (Ana)"
   - Slot: Exact same "10:00"

2. Cliquer "Confirmer"

**Vérifier:**
- ✅ Toast d'erreur: "Ce créneau est déjà réservé"
- ✅ Réservation NOT créée
- ✅ Formulaire reste affiché (pas reset)

### Phase 9: "Mes Réservations" - Navigation

1. Haut du page: Cliquer "Mon compte" (icône user)
2. Panel apparaît: "Bienvenue, Jean Dupont !"
3. Cliquer "Mes Réservations" ⭐ NOUVEAU

**Vérifier:**
- ✅ Navigation vers `my-reservations.html`
- ✅ Header + footer chargent
- ✅ Titre: "Mes Réservations"

### Phase 10: "Mes Réservations" - Affichage

**Vérifier tableau:**
- ✅ Colonne: Massage | Thérapeute | Date & Heure | Prix | Action
- ✅ Ligne 1: "Massage Relaxant" | "Ana" | "21/04/2026 à 10:00" | "75€" | "Annuler"
- ✅ Section "Réservations à venir" (futur)
- ✅ Section "Réservations passées" (vide pour l'instant)

### Phase 11: "Mes Réservations" - Annuler

1. Cliquer bouton "Annuler" sur la réservation
2. Confirm dialog: "Êtes-vous sûr ?"
3. Cliquer "OK"

**Vérifier:**
- ✅ Toast: "✅ Réservation annulée"
- ✅ Tableau se met à jour (réservation disparaît)
- ✅ BD: Réservation supprimée

### Phase 12: Admin Dashboard - Accès

1. Se déconnecter (menu utilisateur)
2. Créer/utiliser un compte **admin** (besoin `isAdmin: true` en BD)

**Alternative rapide (DB):**
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { isAdmin: true } }
)
```

3. Aller sur `http://localhost:3000/admin.html`

**Vérifier:**
- ✅ Header affiche "Tableau de bord Admin"
- ✅ Pas d'erreur d'accès
- ✅ Stats cards chargent

### Phase 13: Admin Dashboard - Statistiques

**Vérifier 3 stat cards:**
- ✅ "Réservations totales": 1 (ou plus selon tests)
- ✅ "Chiffre d'affaires estimé": 75 € (ou total)
- ✅ "Types de massage": 4

### Phase 14: Admin Dashboard - Par thérapeute ⭐

**Vérifier tableau "Charge par thérapeute":**
- ✅ Ana: 1 réservation
- ✅ Léo: 0 (ou plus si d'autres tests)
- ✅ Julie: 0 (ou plus)

**Colonne:** Thérapeute | Spécialité | Réservations

### Phase 15: Admin Dashboard - Prochaines réservations ⭐

**Vérifier tableau "Réservations (7 jours)":**
- ✅ Affiche la réservation créée
- ✅ Colonnes: Client | Téléphone | Massage | Thérapeute | Date & Heure
- ✅ "Jean Dupont" | "06 12 34 56 78" | "Massage Relaxant" | "Ana" | "21/04/2026 10:00"

### Phase 16: Admin Dashboard - Réservations récentes

**Vérifier tableau "Réservations récentes":**
- ✅ Affiche les réservations (max 15)
- ✅ Colonnes: Client | Email | Massage | Thérapeute | Date | Statut
- ✅ Thérapeute column: ⭐ NOUVEAU, montre "Ana"

### Phase 17: Cas limites

#### A) Tenter booking dans le passé
1. Booking form: Sélectionner massage
2. **Slots ne doivent pas montrer dates passées**

**Vérifier:**
- ✅ Slots commencent demain (pas aujourd'hui)

#### B) Tenter booking pendant l'almoço (13h-14h)
1. Sélectionner un slot entre 13:00-14:00
2. **Deve estar indisponível**

**Vérifier:**
- ✅ Slots 13:00-14:00 absents ou grisés

#### C) Tenter booking hors heures (avant 9h ou après 18h)
1. Vérifier que les slots commencent à 9:00
2. Vérifier que les slots finissent avant 18:00

**Vérifier:**
- ✅ Premiers slot: 09:00
- ✅ Derniers slot: 17:00 (55 min + 5 pause = 18:00 fin)

#### D) Tenter deux bookings au même horaire (thérapeute saturation)
1. Client A: Book "Massage Relaxant" (Ana) 14:00 ✓
2. Client B: Book même massage/horaire → doit échouer

**Vérifier:**
- ✅ Client B voit: "Ce créneau est déjà réservé"
- ✅ BD: Juste 1 réservation (pas 2)

---

## 🎬 Scénario completo (5 min)

```
1. Seed therapists ✓
2. Create user + login ✓
3. See slots (NEW) ✓
4. Book one ✓
5. View "Mes Réservations" (NEW) ✓
6. Go admin ✓
7. See stats by therapist (NEW) ✓
8. See upcoming reservations (NEW) ✓
```

---

## 🔍 Validations clés

### Backend
- [ ] API `/api/reservations/available-slots/:massageId/:therapistId` retourne slots valides
- [ ] API `POST /api/reservations` valide le conflit avant save
- [ ] API `GET /api/admin/stats` inclut `byTherapist` et `upcoming`
- [ ] Delete `/api/reservations/:id` fonctionne

### Frontend
- [ ] Slots affichent visuellement
- [ ] Sélection de slot enregistre `selectedTherapistId`
- [ ] Booking envoie `therapistId` au serveur
- [ ] "Mes Réservations" populate therapist et display
- [ ] Admin voit therapist dans tables

### Data Model
- [ ] Therapist.js créé
- [ ] Massage a `therapistId`
- [ ] Reservation a `therapistId`

---

## 📊 Résumé pour le jury

**Avant:**
- ❌ Client ne voit pas dispo
- ❌ Double-booking possible
- ❌ Pas de list de réservations
- ❌ Admin ne voit pas la charge par thérapeute

**Après:**
- ✅ Client voit slots libres (incrémente confiance)
- ✅ Double-booking impossible (gestion fiable)
- ✅ Client gère ses RDV (augmente rétention)
- ✅ Admin optimise planning (meilleure opération)

**Impact métier:**
- 📈 Conversions +X%
- 📉 Conflits: 0
- 🎯 Gestion réaliste
