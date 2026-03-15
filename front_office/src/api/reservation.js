import { apiClient } from "./apiClient";

/**
 * @typedef {Object} WorkScheduleDto
 * @property {number} id
 * @property {string} day
 * @property {string} month
 * @property {string} year
 * @property {string} startTime
 * @property {string} endTime
 * @property {string} status
 */

/**
 * @typedef {Object} ReservationDto
 * @property {number} [id]
 * @property {string} reservationType
 * @property {string} startTime
 * @property {string} endTime
 * @property {number[]} pcIds
 */

/**
 * @typedef {Object} AvailablePcDto
 * @property {number} id
 * @property {number} pcNumber
 * @property {string} pcType
 * @property {string} games
 * @property {string|null} pcLocation
 * @property {boolean} available
 */

/**
 * Get work schedule for a given month and year (public endpoint).
 * @param {string} month
 * @param {string} year
 * @returns {Promise<WorkScheduleDto[]>}
 */
export const getWorkSchedule = (month, year) => {
    return apiClient.get(`/gamefy/work-days-schedules/public?month=${month}&year=${year}`);
};

/**
 * Get available PCs for a given time range and reservation type.
 * @param {string} startTime - ISO datetime string
 * @param {string} endTime - ISO datetime string
 * @param {string} type - "PC_ROOM", "VIP_ROOM", or "COACHING_ROOM"
 * @param {string} [game] - Optional game for filtering PCs in coaching flow
 * @returns {Promise<AvailablePcDto[]>}
 */
export const getAvailablePCs = (startTime, endTime, type, game) => {
    let url = `/gamefy/reservations/available-pcs?start=${startTime}&end=${endTime}&type=${type}`;
    if (game) url += `&game=${game}`;
    return apiClient.get(url);
};

/**
 * Get the list of available games for coaching.
 * @returns {Promise<string[]>}
 */
export const getAvailableGames = () => {
    return apiClient.get("/gamefy/reservations/games");
};

/**
 * Get the list of coaches for a specific game.
 * @param {string} game
 * @returns {Promise<Object[]>}
 */
export const getCoachesByGame = (game) => {
    return apiClient.get(`/gamefy/reservations/coaches?game=${game}`);
};

/**
 * Get coach sessions for a specific coach.
 * @param {number} coachId
 * @returns {Promise<Object[]>}
 */
export const getCoachSessions = (coachId) => {
    return apiClient.get(`/gamefy/coaching-sessions/coach/${coachId}`);
};

/**
 * Create a new reservation.
 * @param {ReservationDto} dto
 * @returns {Promise<ReservationDto>}
 */
export const createReservation = (dto) => {
    return apiClient.post("/gamefy/reservations", dto);
};

/**
 * Get all fixed prices.
 * @returns {Promise<Object[]>}
 */
export const getAllFixedPrices = () => {
    return apiClient.get("/gamefy/fixed-prices");
};

/**
 * Get fixed price by PC type (GAMING or VIP).
 * @param {string} pcType
 * @returns {Promise<Object>}
 */
export const getFixedPriceByPcType = (pcType) => {
    return apiClient.get(`/gamefy/fixed-prices/${pcType}`);
};

/**
 * Create a Stripe PaymentIntent for a reservation (card payment).
 * @param {number} reservationId
 * @returns {Promise<{clientSecret: string, publishableKey: string}>}
 */
export const createReservationPaymentIntent = (reservationId) => {
    return apiClient.post("/gamefy/payments/create-reservation-intent", { reservationId });
};

/**
 * Confirm a reservation card payment after Stripe succeeds.
 * @param {number} reservationId
 * @returns {Promise<string>}
 */
export const confirmReservationCardPayment = (reservationId) => {
    return apiClient.post("/gamefy/payments/confirm-reservation-payment", { reservationId });
};

/**
 * Confirm a reservation with cash payment.
 * @param {number} reservationId
 * @returns {Promise<string>}
 */
export const confirmReservationCashPayment = (reservationId) => {
    return apiClient.post("/gamefy/payments/confirm-reservation-cash", { reservationId });
};

/**
 * Get personalized reservations for the current player.
 * @returns {Promise<ReservationDto[]>}
 */
export const getMyReservations = () => {
    return apiClient.get("/gamefy/reservations/my");
};
