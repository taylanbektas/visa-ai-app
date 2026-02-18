
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Message = {
    id: string;
    sender_id: string;
    recipient_id: string;
    content: string;
    created_at: string;
};

// Simple chat component
export function MessageCenter({
    currentUserId,
    targetUserId,
    targetUserName
}: {
    currentUserId: string;
    targetUserId: string;
    targetUserName?: string;
}) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUserId || !targetUserId) return;

        // Fetch initial messages
        const fetchMessages = async () => {
            setLoading(true);
            const { data } = await (supabase as any)
                .from("messages")
                .select("*")
                .or(`sender_id.eq.${currentUserId},recipient_id.eq.${currentUserId}`)
                .or(`sender_id.eq.${targetUserId},recipient_id.eq.${targetUserId}`)
                .order("created_at", { ascending: true });

            // Filter logic in JS because .or with multiple fields can be tricky in one go if not careful with parentheses
            // Simpler: fetch all messages where (sender=me AND recipient=them) OR (sender=them AND recipient=me)
            // Supabase raw filter:
            // sender_id.eq.me,recipient_id.eq.them
            // sender_id.eq.them,recipient_id.eq.me

            // Re-fetching with precise query
            const { data: conversation } = await (supabase as any)
                .from("messages")
                .select("*")
                .or(`and(sender_id.eq.${currentUserId},recipient_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},recipient_id.eq.${currentUserId})`)
                .order("created_at", { ascending: true });

            if (conversation) {
                setMessages(conversation as Message[]);
            }
            setLoading(false);
        };

        fetchMessages();

        // Subscribe to new messages
        const channel = supabase
            .channel("messages_channel")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `recipient_id=eq.${currentUserId}`, // Listen for incoming messages
                },
                (payload) => {
                    // Only add if it's from the target user
                    if (payload.new.sender_id === targetUserId) {
                        setMessages((prev) => [...prev, payload.new as Message]);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUserId, targetUserId]);

    useEffect(() => {
        // Auto-scroll to bottom
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        const msg = {
            sender_id: currentUserId,
            recipient_id: targetUserId,
            content: newMessage,
        };

        // Optimistic update
        const tempMsg = { ...msg, id: Date.now().toString(), created_at: new Date().toISOString() };
        setMessages((prev) => [...prev, tempMsg]);
        setNewMessage("");

        const { error } = await (supabase as any)
            .from("messages")
            .insert(msg);

        if (error) {
            console.error("Error sending message:", error);
            // Remove optimistic msg or show error - for now ignoring
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex items-center gap-3">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://ui-avatars.com/api/?name=${targetUserName || 'User'}`} />
                    <AvatarFallback><User /></AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-bold text-sm text-navy-dark">{targetUserName || "Sohbet"}</h3>
                    <p className="text-xs text-green-600 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Çevrimiçi</p>
                </div>
            </div>

            <ScrollArea className="flex-1 p-4 bg-slate-50">
                <div className="space-y-4">
                    {messages.length === 0 && !loading && (
                        <div className="text-center text-muted-foreground py-10 text-sm">
                            Henüz mesaj yok. İlk mesajı gönder!
                        </div>
                    )}
                    {messages.map((msg) => {
                        const isMe = msg.sender_id === currentUserId;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isMe ? 'bg-navy-dark text-white rounded-br-none' : 'bg-white border shadow-sm text-gray-800 rounded-bl-none'}`}>
                                    <p>{msg.content}</p>
                                    <span className={`text-[10px] block mt-1 ${isMe ? 'text-white/60 text-right' : 'text-gray-400'}`}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            <div className="p-3 bg-white border-t flex gap-2">
                <Input
                    placeholder="Mesajınızı yazın..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 border-gray-200 focus-visible:ring-offset-0 focus-visible:ring-[#00D69E]"
                />
                <Button onClick={handleSendMessage} size="icon" className="bg-[#00D69E] hover:bg-[#00D69E]/90 text-white rounded-lg">
                    <Send size={18} />
                </Button>
            </div>
        </div>
    );
}
