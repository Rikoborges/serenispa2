const Reservation = require('../models/Reservation');
const availabilityService = require('./availabilityService');

class ReservationService {
    async createReservation(userId, massageId, therapistId, date) {
        if (!massageId || !therapistId || !date) {
            throw new Error("Massage ID, therapist ID et date sont obligatoires.");
        }

        // Valider que le créneau est disponible (45 minutos)
        await availabilityService.validateSlot(therapistId, date, 45);

        // Créer la réservation
        const reservation = new Reservation({
            userId,
            massageId,
            therapistId,
            date
        });

        return await reservation.save();
    }

    async updateReservation(reservationId, userId, date) {
        const reservation = await Reservation.findById(reservationId);

        if (!reservation) throw new Error("Réservation introuvable.");
        if (reservation.userId.toString() !== userId) throw new Error("Action non autorisée.");

        // Valider le nouveau créneau (45 minutos)
        await availabilityService.validateSlot(reservation.therapistId, date, 45);

        reservation.date = date;
        return await reservation.save();
    }

    async deleteReservation(reservationId, userId) {
        const reservation = await Reservation.findById(reservationId);

        if (!reservation) throw new Error("Réservation introuvable.");
        if (reservation.userId.toString() !== userId) throw new Error("Action non autorisée.");

        await reservation.deleteOne();
        return { message: "Réservation annulée." };
    }
}

module.exports = new ReservationService();