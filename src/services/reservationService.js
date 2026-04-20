const Reservation = require('../models/Reservation');

class ReservationService {
    async createReservation(userId, massageId, date) {
        // Validação de "Título/Massage" (Pág. 172)
        if (!massageId || !date) {
            throw new Error("Massage ID et date são obrigatórios.");
        }

        // Validação de Data Passada (Pág. 173) - Regra Ética do Spa
        const selectedDate = new Date(date);
        const today = new Date();
        if (selectedDate < today) {
            throw new Error("La date de réservation ne peut pas être dans le passé.");
        }

        // Criação da reserva
        const reservation = new Reservation({
            userId,
            massageId,
            date
        });

        return await reservation.save();
    }

    async updateReservation(reservationId, userId, date) {
        const reservation = await Reservation.findById(reservationId);

        if (!reservation) throw new Error("Réservation introuvable.");
        if (reservation.userId.toString() !== userId) throw new Error("Action non autorisée.");

        const selectedDate = new Date(date);
        if (selectedDate < new Date()) throw new Error("La date ne peut pas être dans le passé.");

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