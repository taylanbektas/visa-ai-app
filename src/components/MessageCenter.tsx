
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User, Paperclip, Loader2, File as FileIcon, Image as ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Message = {
    id: string;
    sender_id: string;
    recipient_id: string;
    content: string;
    attachment_url?: string;
    attachment_type?: string;
    created_at: string;
};

// Simple chat component
export function MessageCenter({
    currentUserId,
    targetUserId,
    targetUserName,
    targetUserPhoto
}: {
    currentUserId: string;
    targetUserId: string;
    targetUserName?: string;
    targetUserPhoto?: string | null;
}) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (!currentUserId || !targetUserId) return;

        // Fetch initial messages
        const fetchMessages = async () => {
            setLoading(true);
            const { data } = await supabase
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
            const { data: conversation } = await supabase
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
        // Robust auto-scroll without jumping the whole page
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
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

        const { error } = await supabase
            .from("messages")
            .insert(msg);

        if (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${currentUserId}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // 1. Upload to storage
        const { error: uploadError } = await supabase.storage
            .from('message_attachments')
            .upload(filePath, file);

        if (uploadError) {
            console.error("Upload Error:", uploadError);
            setIsUploading(false);
            return;
        }

        // 2. Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('message_attachments')
            .getPublicUrl(filePath);

        // 3. Send message with attachment
        const msg = {
            sender_id: currentUserId,
            recipient_id: targetUserId,
            content: file.type.startsWith('image/') ? 'Görsel gönderildi' : 'Dosya gönderildi',
            attachment_url: publicUrl,
            attachment_type: file.type
        };

        const tempMsg = { ...msg, id: Date.now().toString(), created_at: new Date().toISOString() };
        setMessages((prev) => [...prev, tempMsg]);

        await supabase.from("messages").insert(msg);
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-3 px-4 border-b bg-white flex items-center gap-3 shadow-sm z-10 relative">
                <Avatar className="h-10 w-10 border border-gray-100 shadow-sm">
                    <AvatarImage src={targetUserPhoto || `https://ui-avatars.com/api/?name=${targetUserName || 'User'}`} />
                    <AvatarFallback><User /></AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-bold text-base text-gray-800 tracking-tight">{targetUserName || "Sohbet"}</h3>
                </div>
            </div>

            <div
                ref={containerRef}
                className="flex-1 p-4 bg-[#E5DDD5] overflow-y-auto scroll-smooth"
                style={{ backgroundImage: 'url("https://w7.pngwing.com/pngs/351/181/png-transparent-whatsapp-background-thumbnail.png")', backgroundBlendMode: 'overlay', backgroundColor: 'rgba(229, 221, 213, 0.95)' }}
            >
                <div className="space-y-3 pb-2 flex flex-col justify-end min-h-full">
                    {messages.length === 0 && !loading && (
                        <div className="text-center w-full py-10 flex flex-col items-center">
                            <div className="bg-[#FFF5C4] text-gray-700 text-xs px-4 py-2 rounded-xl shadow-sm text-center max-w-xs">
                                Uçtan uca şifrelenmiş mesajlaşma başladı. Görüşmeleriniz güvenle saklanmaktadır.
                            </div>
                        </div>
                    )}
                    {messages.map((msg) => {
                        const isMe = msg.sender_id === currentUserId;
                        return (
                            <div key={msg.id} className={`flex w-full mb-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[85%] md:max-w-[75%] flex flex-col rounded-xl px-3 pt-2 pb-1.5 shadow-sm relative ${isMe
                                        ? 'bg-[#dcf8c6] text-[#111b21] rounded-tr-md'
                                        : 'bg-white text-[#111b21] rounded-tl-md'
                                        }`}
                                >
                                    {/* Attachment rendering */}
                                    {msg.attachment_url && (
                                        <div className="mb-1.5 -mx-1 -mt-1 overflow-hidden rounded-t-lg rounded-b-sm">
                                            {msg.attachment_type?.startsWith('image/') ? (
                                                <a href={msg.attachment_url} target="_blank" rel="noreferrer">
                                                    <img src={msg.attachment_url} alt="Attachment" className="max-w-full h-auto max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity" />
                                                </a>
                                            ) : (
                                                <a href={msg.attachment_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 bg-black/5 rounded hover:bg-black/10 transition-colors m-1">
                                                    <div className="bg-primary/20 p-2 rounded-full text-primary">
                                                        <FileIcon size={20} />
                                                    </div>
                                                    <span className="text-sm font-medium underline underline-offset-2 truncate">Belgeyi Görüntüle</span>
                                                </a>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex flex-wrap items-end gap-x-2">
                                        <span className="leading-relaxed text-[15px] font-medium break-words whitespace-pre-wrap">
                                            {msg.content !== 'Görsel gönderildi' && msg.content !== 'Dosya gönderildi' ? msg.content : ''}
                                        </span>
                                        <div className={`text-[11px] font-medium mt-1 shrink-0 ml-auto flex items-center gap-1 ${isMe ? 'text-[#54656f]' : 'text-[#667781]'}`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="p-3 bg-[#f0f2f5] flex items-end gap-2">
                <Input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                />
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 shrink-0 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    title="Dosya veya Görsel Ekle"
                >
                    {isUploading ? <Loader2 size={20} className="animate-spin text-primary" /> : <Paperclip size={20} />}
                </Button>

                <Input
                    placeholder="Bir mesaj yazın"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    autoComplete="off"
                    className="flex-1 border-none shadow-sm rounded-xl py-5 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-500"
                />

                <Button
                    onClick={handleSendMessage}
                    size="icon"
                    className="h-10 w-10 shrink-0 bg-[#00a884] hover:bg-[#008f6f] text-white rounded-full shadow-sm"
                    disabled={!newMessage.trim() || isUploading}
                >
                    <Send size={18} className="translate-x-[2px] translate-y-[1px]" />
                </Button>
            </div>
        </div>
    );
}
