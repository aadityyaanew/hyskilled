"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Bot,
  Sparkles,
  X,
  Send,
  RotateCcw,
  ArrowUpRight,
  User,
  Loader2,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";

const STARTER_PROMPTS = [
  " Best course for complete beginners?",
  " What is Full-Stack Builder Track?",
  " Tell me about AI & Prompt courses",
  " Do you provide certificates & job assistance?",
  " How can I book Free 1-on-1 Counselling?",
];

/**
 * Lightweight safe markdown renderer for chat bubbles:
 * Handles **bold**, [link text](/url), bullet points, and newlines.
 */
function MarkdownContent({ content }) {
  if (!content) return null;

  // Split lines
  const lines = content.split("\n");

  return (
    <div className="space-y-1.5 text-sm leading-relaxed text-foreground/90">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Bullet points
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const itemText = trimmed.slice(2);
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
              <span>{renderInlineMarkdown(itemText)}</span>
            </div>
          );
        }

        // Heading
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="mt-2 font-bold text-foreground">
              {renderInlineMarkdown(trimmed.slice(4))}
            </h4>
          );
        }

        return <p key={idx}>{renderInlineMarkdown(line)}</p>;
      })}
    </div>
  );
}

function renderInlineMarkdown(text) {
  // Regex to split by markdown links [text](url) and bold **bold**
  const regex = /(\[.*?\]\(.*?\)|\*\*.*?\*\*|`.*?`)/g;
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (!part) return null;

    // Links: [Label](URL)
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      const [, label, url] = linkMatch;
      const isInternal = url.startsWith("/");
      return (
        <Link
          key={i}
          href={url}
          target={isInternal ? undefined : "_blank"}
          rel={isInternal ? undefined : "noopener noreferrer"}
          className="inline-flex items-center gap-0.5 rounded font-semibold text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
        >
          {label}
          {isInternal ? null : <ArrowUpRight className="inline size-3" />}
        </Link>
      );
    }

    // Bold: **text**
    const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
    if (boldMatch) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {boldMatch[1]}
        </strong>
      );
    }

    // Inline Code: `code`
    const codeMatch = part.match(/^`(.*?)`$/);
    if (codeMatch) {
      return (
        <code key={i} className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground">
          {codeMatch[1]}
        </code>
      );
    }

    return <span key={i}>{part}</span>;
  });
}

export function HyskilledChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! 👋 I am the **Hyskilled AI Agent**.\n\nI can help you explore our practical courses, **Career Tracks** (save up to 45%), certifications, and connect you with a mentor.\n\nWhat would you like to build your career in?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setShowTooltip(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Hide tooltip after 9 seconds if not opened
  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 9000);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = async (textToSend) => {
    const messageContent = (typeof textToSend === "string" ? textToSend : input).trim();
    if (!messageContent || isLoading) return;

    setInput("");

    const newMessages = [...messages, { role: "user", content: messageContent }];
    setMessages(newMessages);
    setIsLoading(true);

    // Placeholder for assistant stream
    const assistantIndex = newMessages.length;
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      abortControllerRef.current = new AbortController();

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        throw new Error("Chat request failed");
      }

      if (!res.body) {
        throw new Error("No response body received");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let streamedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        streamedText += chunk;

        setMessages((prev) => {
          const updated = [...prev];
          if (updated[assistantIndex]) {
            updated[assistantIndex] = {
              ...updated[assistantIndex],
              content: streamedText,
            };
          }
          return updated;
        });
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setMessages((prev) => {
          const updated = [...prev];
          if (updated[assistantIndex]) {
            updated[assistantIndex] = {
              ...updated[assistantIndex],
              content:
                "I apologize, something went wrong while processing your request. Please try asking again or [Book a Free Counselling Session](/register-seat) to speak with an advisor.",
            };
          }
          return updated;
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([
      {
        role: "assistant",
        content:
          "Conversation restarted!  How can I help you with your learning goals today?",
      },
    ]);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Widget Trigger */}
      <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-2 lg:bottom-6 lg:right-6">
        {/* Helper pop-in preview tooltip */}
        {showTooltip && !isOpen && (
          <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-background/95 px-3 py-2 text-xs font-medium text-foreground shadow-xl backdrop-blur-md">
              <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Have questions? Ask <strong>Hyskilled AI</strong></span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(false);
                }}
                className="ml-1 text-muted-foreground hover:text-foreground"
                aria-label="Dismiss message"
              >
                <X className="size-3" />
              </button>
            </div>
            {/* Arrow */}
            <div className="absolute -bottom-1.5 right-6 size-3 rotate-45 border-r border-b border-border/80 bg-background" />
          </div>
        )}

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Close Hyskilled AI Agent" : "Open Hyskilled AI Agent"}
          className={`group relative flex size-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 ${isOpen
              ? "bg-muted text-foreground ring-2 ring-primary/20"
              : "bg-primary text-primary-foreground shadow-primary/30 ring-4 ring-primary/10 hover:shadow-primary/40"
            }`}
        >
          {isOpen ? (
            <X className="size-6 transition-transform duration-200 group-hover:rotate-90" />
          ) : (
            <>
              <Bot className="size-6 transition-transform duration-200 group-hover:scale-110" />
              {/* Online indicator badge */}
              <span className="absolute top-1 right-1 flex size-3.5 items-center justify-center">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </span>
            </>
          )}
        </button>
      </div>

      {/* Floating Chat Modal Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Hyskilled AI Agent Chat Window"
          className="fixed inset-x-3 bottom-20 top-16 z-50 flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/98 shadow-2xl backdrop-blur-xl transition-all animate-in fade-in zoom-in-95 duration-200 sm:inset-auto sm:right-6 sm:bottom-24 sm:h-[580px] sm:w-[410px]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/70 bg-muted/40 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="relative flex size-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-rose-600 text-primary-foreground shadow-md">
                <Bot className="size-5" />
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-foreground text-sm tracking-tight">Hyskilled AI Agent</h3>
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                    AI
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Always Active • Career Advisor
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReset}
                title="Restart conversation"
                className="size-8 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="size-8 text-muted-foreground hover:text-foreground"
              >
                <ChevronDown className="size-4" />
              </Button>
            </div>
          </div>

          {/* Messages scroll area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm [scrollbar-width:thin]">
            {messages.map((msg, index) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={index}
                  className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Sparkles className="size-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-xs ${isUser
                        ? "rounded-br-sm bg-primary text-primary-foreground font-medium"
                        : "rounded-tl-sm border border-border/70 bg-muted/50 text-foreground"
                      }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    ) : (
                      <MarkdownContent content={msg.content} />
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading / Typing indicator */}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="size-3.5" />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-border/70 bg-muted/50 px-3.5 py-2.5">
                  <span className="size-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
                  <span className="size-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
                  <span className="size-2 rounded-full bg-primary/60 animate-bounce" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Starter suggestions on first open */}
          {messages.length <= 2 && !isLoading && (
            <div className="border-t border-border/60 bg-muted/20 px-3 py-2">
              <p className="text-[11px] font-medium text-muted-foreground mb-1.5">Suggested Questions:</p>
              <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
                {STARTER_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    className="shrink-0 rounded-full border border-border/80 bg-background px-2.5 py-1 text-xs text-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Box */}
          <div className="border-t border-border/70 bg-background p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about courses, tracks, pricing..."
                disabled={isLoading}
                className="flex-1 rounded-xl border border-input bg-muted/40 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="size-10 shrink-0 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
              >
                {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </Button>
            </form>
            <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
              Powered by Hyskilled AI • Real-time Course & Career Guidance
            </p>
          </div>
        </div>
      )}
    </>
  );
}
