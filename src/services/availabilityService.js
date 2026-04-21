const Reservation = require('../models/Reservation');
const Massage = require('../models/massage');

class AvailabilityService {
  // Horário do spa: 9h-18h, almoço 13h-14h
  // Duração massage: 55 min + 5 min pausa = 60 min par slot

  getBusinessHours() {
    return {
      start: 9,    // 9h
      end: 18,     // 18h
      lunchStart: 13,
      lunchEnd: 14
    };
  }

  isWithinBusinessHours(date) {
    const hour = date.getHours();
    const { start, end, lunchStart, lunchEnd } = this.getBusinessHours();

    // Entre 9h et 18h?
    if (hour < start || hour >= end) return false;

    // Pas pendant l'almoço (13h-14h)
    if (hour >= lunchStart && hour < lunchEnd) return false;

    return true;
  }

  async getAvailableSlots(massageId, therapistId, daysAhead = 14) {
    const massage = await Massage.findById(massageId);
    if (!massage) throw new Error('Massage non trouvé');

    const slots = [];
    const now = new Date();
    const { start, end, lunchStart, lunchEnd } = this.getBusinessHours();

    // Générer les slots pour les 14 prochains jours
    for (let day = 0; day < daysAhead; day++) {
      const date = new Date(now);
      date.setDate(date.getDate() + day);
      date.setHours(0, 0, 0, 0); // Minuit du jour

      // Itérer chaque heure de 9h à 18h
      for (let hour = start; hour < end; hour++) {
        // Skip l'almoço
        if (hour >= lunchStart && hour < lunchEnd) continue;

        const slotStart = new Date(date);
        slotStart.setHours(hour, 0, 0, 0);

        // Vérifier si ce slot est dans le passé
        if (slotStart < now) continue;

        // Vérifier si le therapist est libre à cette heure
        const hasConflict = await this.hasConflict(therapistId, slotStart, 55); // 55 min duration

        slots.push({
          time: slotStart.toISOString(),
          available: !hasConflict,
          date: slotStart.toLocaleDateString('fr-FR', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
          hour: `${String(hour).padStart(2, '0')}:00`
        });
      }
    }

    return slots;
  }

  async hasConflict(therapistId, slotStart, durationMinutes = 55) {
    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);

    // Chercher une réservation qui chevauche ce slot
    const conflict = await Reservation.findOne({
      therapistId,
      statut: 'confirmé',
      date: {
        $lt: slotEnd,         // Réservation finit après le début du slot
        $gte: new Date(slotStart.getTime() - 55 * 60 * 1000) // Réservation commence avant la fin du slot
      }
    });

    return !!conflict;
  }

  async validateSlot(therapistId, slotTime, durationMinutes = 55) {
    const slot = new Date(slotTime);

    // Vérifier que c'est dans les heures d'ouverture
    if (!this.isWithinBusinessHours(slot)) {
      throw new Error('Cet horaire est en dehors de nos heures d\'ouverture (9h-18h, fermé 13h-14h)');
    }

    // Vérifier qu'il n'y a pas de conflit
    const hasConflict = await this.hasConflict(therapistId, slot, durationMinutes);
    if (hasConflict) {
      throw new Error('Ce créneau est déjà réservé');
    }

    return true;
  }
}

module.exports = new AvailabilityService();
