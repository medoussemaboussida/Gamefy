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
 * @param {string} type - "PC_ROOM" or "VIP_ROOM"
 * @returns {Promise<AvailablePcDto[]>}
 */
export const getAvailablePCs = (startTime, endTime, type) => {
    return apiClient.get(`/gamefy/reservations/available-pcs?start=${startTime}&end=${endTime}&type=${type}`);
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
 * Get personalized reservations for the current player.
 * @returns {Promise<ReservationDto[]>}
 */
export const getMyReservations = () => {
    return apiClient.get("/gamefy/reservations/my");
};
