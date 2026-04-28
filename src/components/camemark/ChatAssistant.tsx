import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

const SYSTEM_PROMPT = "You are a helpful, friendly assistant for CameMark, Cameroon's premier digital marketplace. You help users navigate regions, understand CamRency (our wallet), and find products. Keep answers concise.";

const ChatAssistant = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasWelcomed, setHasWelcomed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-open chat after a short delay so the user sees the welcome
  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Welcome user when opened for the first time
  useEffect(() => {
    if (open && !hasWelcomed) {
      setHasWelcomed(true);
      setMessages([{ id: Date.now().toString(), role: "ai", content: "Welcome to CameMark! How can I help you navigate the marketplace today?" }]);
    }
  }, [open, hasWelcomed]);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    
    const newMsgs: Message[] = [...messages, { id: Date.now().toString(), role: "user", content: userMsg }];
    setMessages(newMsgs);
    setLoading(true);

    try {
      const messagesPayload = [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: "user", content: userMsg }
      ];

      const res = await fetch("https://text.pollinations.ai/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messagesPayload,
          model: "openai",
        }),
      });
      
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      let text = data.choices[0].message.content;
      
      // Remove any variation of the Pollinations deprecation notice
      text = text.replace(/.*The Pollinations legacy text API is being deprecated.*will continue to work normally\.?/gis, "").trim();
      
      // Sometimes it leaves weird Markdown if we stripped part of a blockquote. Cleanup leading symbols:
      text = text.replace(/^[\s>⚠️*]+/, "").trim();
      
      if (!text) {
          text = "I apologize, but I am having trouble forming a response right now. Please ask again!";
      }
      
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "ai", content: text }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "ai", content: "Sorry, I am having trouble connecting right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-elegant flex items-center justify-center hover:scale-110 transition-smooth z-50 ${open ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        aria-label="Open AI Chat Assistant"
      >
        <MessageSquare className="h-6 w-6" />
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 w-80 sm:w-96 rounded-2xl bg-card border border-border shadow-elegant flex flex-col overflow-hidden transition-all duration-500 z-50 origin-bottom-right ${open ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 pointer-events-none translate-y-8'}`} style={{ height: '500px', maxHeight: 'calc(100vh - 48px)' }}>
        
        {/* Header */}
        <div className="bg-primary px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-primary-foreground/20 p-1.5 rounded-full">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-primary-foreground leading-tight">CameMark AI</h3>
              <p className="text-[10px] text-primary-foreground/80">Always here to help</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 p-1 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-2 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
              <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${m.role === 'user' ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'}`}>
                {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={`p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-card border border-border rounded-tl-sm shadow-sm'}`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2 max-w-[85%]">
              <div className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-primary text-primary-foreground">
                <Bot className="h-4 w-4" />
              </div>
              <div className="p-3 rounded-2xl text-sm bg-card border border-border rounded-tl-sm shadow-sm flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <form onSubmit={sendMessage} className="p-3 bg-card border-t border-border flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about regions, wallets..."
            className="flex-1 h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="h-10 w-10 shrink-0 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-glow transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </>
  );
};

export default ChatAssistant;
