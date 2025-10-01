/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { useSendMessageMutation } from "@/api/chatbot.api";

// If you have Vite alias '@' for assets, this import will work.
// Otherwise, pass iconUrl as a prop instead of importing.
import chatIcon from "@/assets/chatbot image.png";

type Message = {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  sqlData?: string; // HTML table from SQLBuilderAgent
};

type ChatBotProps = {
  isDarkMode?: boolean;
  isArabic?: boolean;
  showToggle?: boolean; // show floating button
  iconUrl?: string; // optional override for the icon
};

const ChatBot: React.FC<ChatBotProps> = ({
  isDarkMode = false,
  isArabic = false,
  showToggle = true,
  iconUrl,
}) => {
  const navigate = useNavigate();

  // UI state
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState<{ x: number; y: number }>(() =>
    isArabic ? { x: 40, y: 25 } : { x: 10, y: 10 }
  );
  const [bounds, setBounds] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Messages
  const initialBotMessage = useMemo(
    () =>
      isArabic
        ? "مرحباً! أنا مساعد تنفيذ. كيف يمكنني مساعدتك اليوم؟"
        : "Hello! I'm Tanfeez Assistant. How can I help you today?",
    [isArabic]
  );

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: initialBotMessage, isUser: false, timestamp: new Date() },
  ]);

  // SQL modal
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [currentSqlData, setCurrentSqlData] = useState<string>("");

  // Input
  const [newMessage, setNewMessage] = useState("");

  // RTK Query
  const [sendMessageMutation] = useSendMessageMutation();

  // Re-apply initial message when language changes
  useEffect(() => {
    setMessages((prev) => {
      if (!prev.length || prev[0].id !== 1) return prev;
      const next = [...prev];
      next[0] = { ...next[0], text: initialBotMessage };
      return next;
    });
  }, [initialBotMessage]);

  // Update container bounds on resize
  useEffect(() => {
    const onResize = () =>
      setBounds({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Simulate a "new message" badge, like your demo
  useEffect(() => {
    const t = setTimeout(() => {
      if (!isOpen) setHasNewMessage(true);
    }, 10000);
    return () => clearTimeout(t);
  }, [isOpen]);

  const toggleChat = useCallback(() => {
    setIsOpen((o) => {
      const nowOpen = !o;
      if (nowOpen) setHasNewMessage(false);
      return nowOpen;
    });
  }, []);

  // Drag handlers
  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (isOpen) return; // don't drag while open

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    // Convert stored position (RTL uses left; LTR uses right) to screen coords
    const currentScreenX = isArabic
      ? position.x
      : bounds.width - position.x - 80;
    const currentScreenY = bounds.height - position.y - 80;

    dragStart.current = {
      x: clientX - currentScreenX,
      y: clientY - currentScreenY,
    };

    const move = (ev: MouseEvent | TouchEvent) => {
      const x =
        "touches" in ev ? ev.touches[0].clientX : (ev as MouseEvent).clientX;
      const y =
        "touches" in ev ? ev.touches[0].clientY : (ev as MouseEvent).clientY;

      const moved =
        Math.abs(x - (dragStart.current.x + currentScreenX)) > 5 ||
        Math.abs(y - (dragStart.current.y + currentScreenY)) > 5;

      if (moved) setIsDragging(true);
      if (!isDragging && !moved) return;

      let newScreenX = x - dragStart.current.x;
      let newScreenY = y - dragStart.current.y;

      const maxX = bounds.width - 80;
      const maxY = bounds.height - 80;

      newScreenX = Math.max(0, Math.min(newScreenX, maxX));
      newScreenY = Math.max(0, Math.min(newScreenY, maxY));

      if (isArabic) {
        // RTL store as left/bottom
        const newX = newScreenX;
        const newY = bounds.height - newScreenY - 80;
        setPosition({ x: newX, y: newY });
      } else {
        // LTR store as right/bottom
        const newX = bounds.width - newScreenX - 80;
        const newY = bounds.height - newScreenY - 80;
        setPosition({ x: newX, y: newY });
      }

      ev.preventDefault();
    };

    const end = () => {
      const threshold = 50;
      const { x, y } = position;
      const { width, height } = bounds;

      // Snap logic similar to your Vue version
      if (isArabic) {
        const screenX = x;
        const screenY = height - y - 60;
        let newX = x;
        let newY = y;

        if (screenX < threshold) newX = 21;
        else if (screenX > width - 80 - threshold) newX = width - 80 - 24;

        if (screenY < threshold) newY = height - 24 - 80;
        else if (screenY > height - 80 - threshold) newY = 24;

        setPosition({ x: newX, y: newY });
      } else {
        const screenX = width - x - 60;
        const screenY = height - y - 60;
        let newX = x;
        let newY = y;

        if (screenX < threshold) newX = width - 24 - 80;
        else if (screenX > width - 80 - threshold) newX = 24;

        if (screenY < threshold) newY = height - 24 - 80;
        else if (screenY > height - 80 - threshold) newY = 24;

        setPosition({ x: newX, y: newY });
      }

      setTimeout(() => setIsDragging(false), 10);

      document.removeEventListener("mousemove", move as any);
      document.removeEventListener("mouseup", end);
      document.removeEventListener("touchmove", move as any);
      document.removeEventListener("touchend", end);
    };

    document.addEventListener("mousemove", move as any);
    document.addEventListener("mouseup", end);
    document.addEventListener("touchmove", move as any, { passive: false });
    document.addEventListener("touchend", end);

    e.preventDefault();
  };

  const handleToggleClick = () => {
    if (!isDragging) toggleChat();
  };

  const stylePos = useMemo<React.CSSProperties>(() => {
    const side = isArabic
      ? { left: `${position.x}px` }
      : { right: `${position.x}px` };
    return {
      ...side,
      bottom: `${position.y}px`,
      transition: isDragging ? "none" : "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      position: "fixed",
      zIndex: 1000,
    };
  }, [isArabic, isDragging, position.x, position.y]);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [isOpen, messages.length]);

  // Format time
  const timeOf = (d: Date) =>
    d.toLocaleTimeString(isArabic ? "ar-SA" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  // SQL modal helpers
  const openSqlModal = (html: string) => {
    setCurrentSqlData(html);
    setShowSqlModal(true);
  };
  const closeSqlModal = () => {
    setShowSqlModal(false);
    setCurrentSqlData("");
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now(),
      text: newMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((m) => [...m, userMsg]);
    setNewMessage("");
    setIsTyping(true);

    try {
      const data = await sendMessageMutation({
        user_input: userMsg.text,
      }).unwrap();

      let botText = "";
      let pageToNavigate: string | null = null;
      let sqlData: string | undefined;

      if (data && data.status === "success" && data.response) {
        if (data.response.GeneralQAAgent)
          botText = data.response.GeneralQAAgent;
        if (data.response.PageNavigatorAgent)
          pageToNavigate = data.response.PageNavigatorAgent;
        if (data.response.SQLBuilderAgent)
          sqlData = data.response.SQLBuilderAgent;
      } else {
        botText = isArabic
          ? "حدث خطأ أثناء معالجة الطلب."
          : "An error occurred while processing your request.";
      }

      if (botText) {
        setMessages((m) => [
          ...m,
          {
            id: Date.now() + 1,
            text: botText,
            isUser: false,
            timestamp: new Date(),
            sqlData,
          },
        ]);
      }

      if (pageToNavigate) {
        // Navigate without route existence check; react-router will handle it
        navigate(pageToNavigate);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((m) => [
        ...m,
        {
          id: Date.now() + 2,
          text: isArabic
            ? "تعذر الاتصال بالخادم."
            : "Failed to connect to the server.",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating container */}
      <div
        className={[
          "select-none",
          "transition-all",
          isDragging ? "transition-none z-[1001]" : "z-[1000]",
        ].join(" ")}
        style={stylePos}
      >
        {/* Toggle Button */}
        {!isOpen && showToggle && (
          <button
            onMouseDown={startDrag}
            onTouchStart={startDrag}
            onClick={handleToggleClick}
            aria-label={isArabic ? "فتح الدردشة" : "Open Chat"}
            className={[
              "relative w-20 h-20 rounded-full",
              "flex items-center justify-center",
              "shadow-xl overflow-hidden touch-none",
              "transition-all",
              isDragging ? "cursor-grabbing scale-110" : "hover:scale-105",
              // Blue/white theme
              "bg-gradient-to-br from-[#00B7AD] to-[#013431]",
            ].join(" ")}
          >
            <img
              src={iconUrl || chatIcon}
              alt="Chat Icon"
              className="w-[72px] h-[60px] object-cover rounded-sm relative z-[2] transition-transform"
            />
            {/* pulse ring */}
            {!isDragging && (
              <span className="absolute inset-0 rounded-full border-2 border-blue-300 animate-ping opacity-60" />
            )}
            {/* notification badge */}
            {hasNewMessage && (
              <span className="absolute top-2 right-2 w-3 h-3 rounded-full bg-red-500 border-2 border-white" />
            )}
          </button>
        )}

        {/* Chat Panel */}
        {isOpen && (
          <div
            className={[
              "absolute bottom-20",
              isArabic ? "left-0" : "right-0",
              "w-[380px] h-[500px]",
              "rounded-2xl overflow-hidden",
              "shadow-2xl border",
              // Glassy + blue/white theme
              isDarkMode
                ? "bg-slate-900/90 border-slate-700 backdrop-blur-xl"
                : "bg-white/95 border-white/60 backdrop-blur-xl",
              "flex flex-col",
              "animate-[fadeIn_0.25s_ease]",
            ].join(" ")}
          >
            {/* Header */}
            <div
              className={[
                "px-5 py-4 flex items-center justify-between",
                "text-white",
                "bg-gradient-to-r from-[#00B7AD] to-[#09615d]",
              ].join(" ")}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2Zm9 7V7l-6-6H9v2H7a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v10h2V11h2v10h2V11h2a2 2 0 0 0 2-2V7h2v2Z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-sm font-semibold">
                    {isArabic ? "مساعد تنفيذ" : "Tanfeez Assistant"}
                  </h3>
                  <span className="text-xs opacity-80">
                    {isArabic ? "متصل" : "Online"}
                  </span>
                </div>
              </div>
              <button
                onClick={toggleChat}
                aria-label={isArabic ? "إغلاق الدردشة" : "Close Chat"}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41Z" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className={[
                "flex-1 p-5 overflow-y-auto flex flex-col gap-3",
                isDarkMode ? "bg-slate-900/40" : "bg-slate-50/50",
              ].join(" ")}
              dir={isArabic ? "rtl" : "ltr"}
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={[
                    "flex items-end gap-2",
                    m.isUser ? "justify-end" : "justify-start",
                  ].join(" ")}
                >
                  <div className="max-w-[70%] flex flex-col">
                    {!m.isUser && m.sqlData && (
                      <div className="mb-2">
                        <button
                          onClick={() => openSqlModal(m.sqlData!)}
                          className="text-xs px-3 py-1.5 rounded-md shadow bg-gradient-to-r from-[#00B7AD] to-[#09615d] text-white hover:shadow-md transition inline-flex items-center gap-1"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm17 2H4v14h16V5ZM6 7h12v2H6V7Zm0 4h12v2H6v-2Zm0 4h6v2H6v-2Z" />
                          </svg>
                          {isArabic ? "تفاصيل SQL" : "SQL Details"}
                        </button>
                      </div>
                    )}

                    <div
                      className={[
                        "px-4 py-3 rounded-2xl text-sm leading-snug break-words",
                        m.isUser
                          ? "bg-gradient-to-r from-[#00B7AD] to-[#09615d] text-white rounded-br-md"
                          : isDarkMode
                          ? "bg-slate-700/80 text-slate-100 rounded-bl-md"
                          : "bg-white/90 text-slate-700 rounded-bl-md",
                      ].join(" ")}
                    >
                      {m.text}
                    </div>
                    <div
                      className={[
                        "mt-1 text-[10px] opacity-60",
                        m.isUser ? "text-right" : "",
                      ].join(" ")}
                    >
                      {timeOf(m.timestamp)}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-end gap-2 justify-start">
                  <div
                    className={[
                      "px-4 py-3 rounded-2xl rounded-bl-md",
                      isDarkMode ? "bg-slate-700/80" : "bg-white/90",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                        style={{ animationDelay: "0.15s" }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                        style={{ animationDelay: "0.3s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div
              className={[
                "px-5 py-4 border-t",
                isDarkMode
                  ? "bg-slate-900/80 border-slate-700"
                  : "bg-white/80 border-black/10",
              ].join(" ")}
            >
              <div className="flex items-center gap-2">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage();
                  }}
                  placeholder={
                    isArabic ? "اكتب رسالتك..." : "Type your message..."
                  }
                  disabled={isTyping}
                  className={[
                    "flex-1 px-4 py-2.5 rounded-full text-sm outline-none transition",
                    "border",
                    isDarkMode
                      ? "bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400"
                      : "bg-white/80 border-black/10 text-slate-700 placeholder:text-slate-400",
                    "focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60",
                  ].join(" ")}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isTyping}
                  className={[
                    "w-10 h-10 rounded-full flex items-center justify-center text-white",
                    "bg-gradient-to-br from-[#00B7AD] to-[#09615d]",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "transition hover:scale-110 shadow",
                  ].join(" ")}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2 .01 7Z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SQL Modal */}
      {showSqlModal && (
        <div
          className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-5 animate-[fadeIn_0.2s_ease]"
          onClick={closeSqlModal}
        >
          <div
            className={[
              "w-[90%] max-w-[900px] max-h-[80vh] rounded-xl overflow-hidden border shadow-2xl",
              isDarkMode
                ? "bg-slate-900/95 border-slate-700"
                : "bg-white/98 border-white/60",
              "flex flex-col",
            ].join(" ")}
            onClick={(e) => e.stopPropagation()}
            dir={isArabic ? "rtl" : "ltr"}
          >
            <div className="px-6 py-4 text-white bg-gradient-to-r from-[#00B7AD] to-[#09615d] flex items-center justify-between">
              <h2 className="text-sm font-semibold">
                {isArabic ? "تفاصيل البيانات" : "SQL Data Details"}
              </h2>
              <button
                onClick={closeSqlModal}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
                aria-label="Close Modal"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41Z" />
                </svg>
              </button>
            </div>
            <div
              className={[
                "flex-1 overflow-auto p-6",
                isDarkMode ? "bg-slate-900/70" : "bg-slate-50/80",
              ].join(" ")}
            >
              <div
                className={[
                  "rounded-lg overflow-x-auto shadow",
                  isDarkMode ? "bg-slate-700/80" : "bg-white",
                ].join(" ")}
                dangerouslySetInnerHTML={{ __html: currentSqlData }}
              />
            </div>
            <div
              className={[
                "px-6 py-4 border-t flex justify-end",
                isDarkMode
                  ? "bg-slate-900/80 border-slate-700"
                  : "bg-white/80 border-black/10",
              ].join(" ")}
            >
              <button
                onClick={closeSqlModal}
                className="px-4 py-2 rounded-md text-white bg-gradient-to-r from-slate-500 to-slate-600 hover:shadow transition text-sm"
              >
                {isArabic ? "إغلاق" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
