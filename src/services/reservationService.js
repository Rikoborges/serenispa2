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
}

module.exports = new ReservationService();