import axios from "axios";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

/**
 * Lightweight axios client for chatbot context fetching.
 * Unlike apiClient, this does NOT redirect on 401/403 — it just fails silently
 * so Promise.allSettled can handle it gracefully on public pages (vitrine).
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
const chatbotClient = axios.create({ baseURL: BASE_URL });
chatbotClient.interceptors.request.use((config) => {
    const jwt = localStorage.getItem("accessToken");
    if (jwt) config.headers.Authorization = `Bearer ${jwt}`;
    return config;
});
chatbotClient.interceptors.response.use((res) => res.data);

/**
 * Fetches all Gamefy context data from backend APIs in parallel.
 * This data is used to give the AI chatbot real, live information.
 */
export const fetchChatbotContext = async () => {
    const currentDate = new Date();
    const months = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
        "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
    const currentMonth = months[currentDate.getMonth()];
    const currentYear = String(currentDate.getFullYear());

    const [fixedPrices, activeOffer, workSchedule, events, gamingPacks, coachingPacks, coaches, games, pcSummary, bookingTrends] =
        await Promise.allSettled([
            chatbotClient.get("/gamefy/fixed-prices"),
            chatbotClient.get("/gamefy/offers/active").catch(() => null),
            chatbotClient.get(`/gamefy/work-days-schedules/public?month=${currentMonth}&year=${currentYear}`),
            chatbotClient.get("/gamefy/events/active"),
            chatbotClient.get("/gamefy/pack-gamefies"),
            chatbotClient.get("/gamefy/pack-coachings/all"),
            chatbotClient.get("/gamefy/coaches/profile/public/all"),
            chatbotClient.get("/gamefy/pc-games/public"),
            chatbotClient.get("/gamefy/pcs/public/summary"),
            chatbotClient.get("/gamefy/reservations/public/booking-trends"),
        ]);

    return {
        fixedPrices: fixedPrices.status === "fulfilled" ? fixedPrices.value : [],
        activeOffer: activeOffer.status === "fulfilled" ? activeOffer.value : null,
        workSchedule: workSchedule.status === "fulfilled" ? workSchedule.value : [],
        events: events.status === "fulfilled" ? events.value : [],
        gamingPacks: gamingPacks.status === "fulfilled" ? gamingPacks.value : [],
        coachingPacks: coachingPacks.status === "fulfilled" ? coachingPacks.value : [],
        coaches: coaches.status === "fulfilled" ? coaches.value : [],
        games: games.status === "fulfilled" ? games.value : [],
        pcSummary: pcSummary.status === "fulfilled" ? pcSummary.value : {},
        bookingTrends: bookingTrends.status === "fulfilled" ? bookingTrends.value : null,
        fetchedAt: currentDate.toISOString(),
        currentMonth,
        currentYear,
    };
};

/**
 * Builds the system prompt with all Gamefy context data.
 */
const buildSystemPrompt = (context) => {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = new Date();
    const todayDayName = dayNames[today.getDay()].toUpperCase();

    // Format pricing
    let pricingInfo = "No pricing data available.";
    if (context.fixedPrices && context.fixedPrices.length > 0) {
        pricingInfo = context.fixedPrices.map(p =>
            `${p.pcType} Room: 1h = ${Number(p.oneHourPrice).toFixed(3)} DT, 2h = ${Number(p.twoHoursPrice).toFixed(3)} DT, 3h = ${Number(p.threeHoursPrice).toFixed(3)} DT`
        ).join("\n");
    }

    // Format active offer
    let offerInfo = "No active offers right now.";
    if (context.activeOffer) {
        offerInfo = `Current Offer: "${context.activeOffer.offerName}" — ${context.activeOffer.reduction}% discount on all reservations!`;
    }

    // Format work schedule
    let scheduleInfo = "No schedule data available for this month.";
    if (context.workSchedule && context.workSchedule.length > 0) {
        const grouped = {};
        context.workSchedule.forEach(s => {
            const key = s.day;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(s);
        });

        // Convert UTC time string to local time string (same logic as ReservationPage.jsx)
        const offset = new Date().getTimezoneOffset(); // e.g. -60 for UTC+1
        const utcToLocal = (timeStr) => {
            if (!timeStr) return timeStr;
            const [h, m] = timeStr.split(":").map(Number);
            const utcMins = h * 60 + m;
            const localMins = utcMins - offset;
            const localH = Math.floor(((localMins % 1440) + 1440) % 1440 / 60);
            const localM = ((localMins % 1440) + 1440) % 1440 % 60;
            return `${String(localH).padStart(2, "0")}:${String(localM).padStart(2, "0")}`;
        };

        const scheduleLines = Object.entries(grouped).map(([day, slots]) => {
            const slot = slots[0];
            if (slot.status === "CLOSED") return `${day}: CLOSED`;
            return `${day}: ${utcToLocal(slot.startTime)} - ${utcToLocal(slot.endTime)} (${slot.status})`;
        });
        scheduleInfo = scheduleLines.join("\n");

        // Today's schedule
        const todaySchedule = context.workSchedule.find(s => s.day === todayDayName);
        if (todaySchedule) {
            if (todaySchedule.status === "CLOSED") {
                scheduleInfo += `\n\nTODAY (${todayDayName}): CLOSED`;
            } else {
                scheduleInfo += `\n\nTODAY (${todayDayName}): Open from ${utcToLocal(todaySchedule.startTime)} to ${utcToLocal(todaySchedule.endTime)}`;
            }
        }
    }

    // Format events
    let eventsInfo = "No upcoming events at the moment.";
    if (context.events && context.events.length > 0) {
        eventsInfo = context.events.map(e => {
            const start = new Date(e.startTime);
            const dateStr = start.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
            const timeStr = start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
            return `- "${e.title}" | ${dateStr} at ${timeStr} | Location: ${e.place} | Status: ${e.eventStatus}${e.description ? ` | ${e.description}` : ""}`;
        }).join("\n");
    }

    // Format gaming packs
    let gamingPacksInfo = "No gaming packs available.";
    if (context.gamingPacks && context.gamingPacks.length > 0) {
        gamingPacksInfo = context.gamingPacks.map(p => {
            const benefits = p.benefits?.map(b => `${b.benefitType} (${b.rateRule}${b.hours ? `: ${b.hours}h` : ""}${b.discountValue ? `: ${b.discountValue}%` : ""})`).join(", ") || "N/A";
            return `- "${p.name}" | Price: ${Number(p.price).toFixed(3)} DT | Duration: ${p.durationMonths || "N/A"} months | Benefits: ${benefits}${p.description ? ` | ${p.description}` : ""}`;
        }).join("\n");
    }

    // Format coaching packs
    let coachingPacksInfo = "No coaching packs available.";
    if (context.coachingPacks && context.coachingPacks.length > 0) {
        coachingPacksInfo = context.coachingPacks.map(p =>
            `- "${p.name}" | Price: ${Number(p.price).toFixed(3)} DT | Hours: ${p.hours || "N/A"} | Coach: ${p.coachName || "N/A"} | Duration: ${p.durationMonths || "N/A"} months${p.description ? ` | ${p.description}` : ""}`
        ).join("\n");
    }

    // Format coaches
    let coachesInfo = "No coaches available at the moment.";
    if (context.coaches && context.coaches.length > 0) {
        coachesInfo = context.coaches.map(c =>
            `- ${c.firstName} ${c.lastName} | Game: ${c.game} | Hourly Price: ${Number(c.hourlyPrice).toFixed(3)} DT${c.bio ? ` | Bio: ${c.bio}` : ""}`
        ).join("\n");
    }

    // Format available games
    let gamesInfo = "No games data available.";
    if (context.games && context.games.length > 0) {
        gamesInfo = context.games.join(", ");
    }

    // Format PC inventory
    let pcInventoryInfo = "No PC inventory data available.";
    if (context.pcSummary && Object.keys(context.pcSummary).length > 0) {
        pcInventoryInfo = Object.entries(context.pcSummary).map(([type, stats]) => {
            const details = Object.entries(stats)
                .map(([key, val]) => `${key}: ${val}`)
                .join(", ");
            return `${type}: ${details}`;
        }).join("\n");
    }

    return `You are Gamefy AI Assistant, the friendly and knowledgeable virtual helper for Gamefy — a premium gaming center / cyber café.

Your personality: You are enthusiastic about gaming, helpful, concise, and professional. Use a friendly tone with gaming vibes. You can use emojis sparingly. Keep answers concise and to the point.

IMPORTANT RULES:
- ONLY answer questions related to Gamefy and its services. If asked about anything unrelated, politely redirect to Gamefy topics.
- Use the REAL DATA provided below to answer questions. Never make up prices, schedules, or other facts.
- If you don't have data for something, say so honestly.
- Format prices in DT (Tunisian Dinar) with 3 decimal places.
- All times (schedule, events) are in LOCAL time (Tunisia). Display them exactly as provided — NEVER mention UTC or any timezone. Just say the time naturally like "11:00 AM" or "from 11:00 to 01:00".
- Be helpful about how things work at Gamefy: reservations, packs, events, coaching, payments (Stripe card or cash at the center).
- When asked about coaches, provide their name, game specialty, hourly price, and bio.
- When asked about games, list the games available on Gamefy PCs.
- When asked about PCs, provide the counts by type (GAMING, VIP) and their availability status.
- When asked about best times to book or when it's quietest/busiest, use the BOOKING TRENDS data to give data-backed recommendations. Suggest quieter days and time slots for a better experience.

=== CURRENT DATE ===
${today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}

=== ROOM TYPES ===
Gamefy has 2 room types for gaming plus coaching rooms:
1. PC ROOM (GAMING) — Standard gaming PCs with high-end specs
2. VIP ROOM — Premium VIP gaming experience with better equipment and a more comfortable, private environment
3. COACHING ROOM — Rooms for coaching sessions with professional esports coaches

=== PRICING (per PC, per session) ===
${pricingInfo}
Note: For 4+ hours, the 1-hour rate is applied per hour. Half-hours are charged at 50% of the hourly rate.

=== ACTIVE OFFER ===
${offerInfo}

=== WORK SCHEDULE (${context.currentMonth} ${context.currentYear}) ===
${scheduleInfo}

=== UPCOMING EVENTS ===
${eventsInfo}

=== GAMING PACKS ===
${gamingPacksInfo}

=== COACHING PACKS ===
${coachingPacksInfo}

=== OUR COACHES ===
${coachesInfo}

=== AVAILABLE GAMES ON OUR PCs ===
${gamesInfo}

=== PC INVENTORY ===
${pcInventoryInfo}

=== BOOKING TRENDS (${context.bookingTrends ? context.bookingTrends.period : 'N/A'}) ===
${(() => {
    if (!context.bookingTrends) return "No booking trend data available.";
    const bt = context.bookingTrends;
    let info = "";
    if (bt.byDayOfWeek) {
        info += "Reservations by day: " + Object.entries(bt.byDayOfWeek).map(([d, c]) => `${d}: ${c}`).join(", ") + "\n";
    }
    if (bt.busiestDay) info += `Busiest day: ${bt.busiestDay}\n`;
    if (bt.quietestDay) info += `Quietest day: ${bt.quietestDay}\n`;
    if (bt.byTimeSlot) {
        info += "Reservations by time slot: " + Object.entries(bt.byTimeSlot).map(([s, c]) => `${s}: ${c}`).join(", ") + "\n";
    }
    if (bt.busiestTimeSlot) info += `Busiest time slot: ${bt.busiestTimeSlot}\n`;
    if (bt.quietestTimeSlot) info += `Quietest time slot: ${bt.quietestTimeSlot}\n`;
    if (bt.byRoomType) {
        info += "By room type: " + Object.entries(bt.byRoomType).map(([t, c]) => `${t}: ${c}`).join(", ") + "\n";
    }
    if (bt.totalConfirmedReservations !== undefined) info += `Total confirmed reservations: ${bt.totalConfirmedReservations}`;
    return info;
})()}

=== HOW RESERVATIONS WORK ===
1. Choose a room type (PC Room, VIP Room, or Coaching Room)
2. For coaching: select a game, then pick a coach
3. Pick a date and time slot from the work schedule
4. Select available PCs
5. Optionally activate pack benefits (hours or discounts)
6. Review and confirm — payment via Stripe (card) or cash at the center
7. Pending reservations expire in 24 hours if not confirmed

=== HOW PACKS WORK ===
- Gaming Packs include benefits like free hours and discounts for PC/VIP rooms
- Coaching Packs include coaching hours with a specific coach
- Players can buy packs via Stripe payment and renew when expired
- Pack benefits are consumed when making reservations

=== PAYMENT METHODS ===
- Card payment via Stripe (online)
- Cash payment at the gaming center`;
};

/**
 * Sends a message to Groq's API with conversation history and Gamefy context.
 * @param {Array<{role: string, content: string}>} messages - Conversation history
 * @param {Object} context - Gamefy context data from fetchChatbotContext
 * @returns {Promise<string>} AI response text
 */
export const sendMessageToGroq = async (messages, context) => {
    const systemPrompt = buildSystemPrompt(context);

    const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                ...messages,
            ],
            temperature: 0.7,
            max_tokens: 1024,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";
};
