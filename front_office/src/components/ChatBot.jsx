import React, { useState, useRef, useEffect, useCallback } from "react";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";
import { fetchChatbotContext, sendMessageToGroq } from "../api/chatbot";
import "./ChatBot.css";

const QUICK_QUESTIONS = [
    "💰 What are your prices?",
    "🕐 Opening hours today?",
    "🏆 Upcoming events?",
    "📦 Available packs?",
];

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [context, setContext] = useState(null);
    const [contextLoading, setContextLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showQuickQuestions, setShowQuickQuestions] = useState(true);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Scroll to bottom when new messages appear
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, scrollToBottom]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && !contextLoading) {
            setTimeout(() => inputRef.current?.focus(), 350);
        }
    }, [isOpen, contextLoading]);

    // Fetch context on first open
    const handleOpen = async () => {
        setIsOpen(true);
        if (!context) {
            setContextLoading(true);
            setError(null);
            try {
                const data = await fetchChatbotContext();
                setContext(data);
                // Add welcome message
                setMessages([{
                    role: "assistant",
                    content: "Hey there, gamer! 🎮 I'm Gamefy AI — your personal assistant. I know everything about our rooms, prices, schedules, events, and packs.\n\nAsk me anything!",
                }]);
            } catch (err) {
                console.error("Failed to load chatbot context", err);
                setError("Failed to load Gamefy data. Please try again.");
            } finally {
                setContextLoading(false);
            }
        }
    };

    const handleToggle = () => {
        if (isOpen) {
            setIsOpen(false);
        } else {
            handleOpen();
        }
    };

    const handleSend = async (text) => {
        const messageText = text || input.trim();
        if (!messageText || isLoading || !context) return;

        setError(null);
        setShowQuickQuestions(false);
        setInput("");

        // Add user message
        const userMessage = { role: "user", content: messageText };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);

        // Send to Groq
        setIsLoading(true);
        try {
            // Only send last 20 messages to Groq to keep context window manageable
            const recentMessages = updatedMessages
                .filter(m => m.role !== "system")
                .slice(-20)
                .map(m => ({ role: m.role, content: m.content }));

            const aiResponse = await sendMessageToGroq(recentMessages, context);
            setMessages(prev => [...prev, { role: "assistant", content: aiResponse }]);
        } catch (err) {
            console.error("Groq API error:", err);
            setError(err.message || "Failed to get a response. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleQuickQuestion = (question) => {
        // Strip the emoji prefix for cleaner messages
        const cleanQuestion = question.replace(/^[^\w]*/, "").trim();
        handleSend(cleanQuestion);
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                id="chatbot-toggle"
                className={`chatbot-toggle ${isOpen ? "open" : ""}`}
                onClick={handleToggle}
                aria-label={isOpen ? "Close chat" : "Open chat"}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </button>

            {/* Chat Window */}
            <div className={`chatbot-window ${isOpen ? "visible" : ""}`}>
                {/* Header */}
                <div className="chatbot-header">
                    <div className="chatbot-header-left">
                        <div className="chatbot-avatar">
                            <Bot size={20} />
                        </div>
                        <div className="chatbot-header-info">
                            <h3>Gamefy AI</h3>
                            <span>● Online</span>
                        </div>
                    </div>
                    <button className="chatbot-close" onClick={() => setIsOpen(false)}>
                        <X size={14} />
                    </button>
                </div>

                {/* Content */}
                {contextLoading ? (
                    <div className="chatbot-loading-context">
                        <div className="chatbot-loading-spinner" />
                        <span>Loading Gamefy data...</span>
                    </div>
                ) : (
                    <>
                        {/* Messages */}
                        <div className="chatbot-messages">
                            {messages.map((msg, i) => (
                                <div key={i} className={`chatbot-msg ${msg.role === "user" ? "user" : "ai"}`}>
                                    <div className="chatbot-msg-avatar">
                                        {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                                    </div>
                                    <div className="chatbot-msg-bubble">{msg.content}</div>
                                </div>
                            ))}

                            {/* Typing indicator */}
                            {isLoading && (
                                <div className="chatbot-typing">
                                    <div className="chatbot-msg-avatar" style={{
                                        background: "linear-gradient(135deg, rgba(28, 243, 202, 0.15), rgba(221, 0, 184, 0.15))",
                                        border: "1px solid rgba(28, 243, 202, 0.2)",
                                        width: 28, height: 28, borderRadius: 10,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        flexShrink: 0, marginTop: 2
                                    }}>
                                        <Bot size={14} />
                                    </div>
                                    <div className="chatbot-typing-dots">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Error */}
                        {error && <div className="chatbot-error">{error}</div>}

                        {/* Quick Questions */}
                        {showQuickQuestions && messages.length <= 1 && (
                            <div className="chatbot-quick-questions">
                                {QUICK_QUESTIONS.map((q, i) => (
                                    <button
                                        key={i}
                                        className="chatbot-quick-btn"
                                        onClick={() => handleQuickQuestion(q)}
                                        disabled={isLoading}
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="chatbot-input-area">
                            <input
                                ref={inputRef}
                                type="text"
                                className="chatbot-input"
                                placeholder="Ask anything about Gamefy..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading || !context}
                            />
                            <button
                                className="chatbot-send"
                                onClick={() => handleSend()}
                                disabled={isLoading || !input.trim() || !context}
                                aria-label="Send message"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default ChatBot;
