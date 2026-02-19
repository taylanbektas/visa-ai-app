
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User, Paperclip, Loader2, X, Check, File as FileIcon, Image as ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

type Message = {
    id: string;
    sender_id: string;
    recipient_id: string;
    content: string;
    attachments?: any[]; // JSONB field
    created_at: string;
    read?: boolean;
};

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
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(false);

    useEffect(() => {
        if (!currentUserId || !targetUserId) return;

        const fetchMessages = async () => {
            setLoading(true);
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

        const channel = supabase
            .channel(`msg_${targetUserId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `recipient_id=eq.${currentUserId}`,
                },
                (payload) => {
                    if (payload.new.sender_id === targetUserId) {
                        setMessages((prev) => [...prev, payload.new as Message]);
                    }
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "messages",
                    filter: `sender_id=eq.${currentUserId}`,
                },
                (payload) => {
                    setMessages((prev) => prev.map(m => m.id === payload.new.id ? { ...m, ...payload.new } : m));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUserId, targetUserId]);

    useEffect(() => {
        if (!targetUserId) return;

        const fetchPresence = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('updated_at')
                .eq('user_id', targetUserId)
                .maybeSingle();

            if (data?.updated_at) {
                const lastSeenDate = new Date(data.updated_at);
                const now = new Date();
                setIsOnline(now.getTime() - lastSeenDate.getTime() < 120000);
            }
        };

        fetchPresence();
        const interval = setInterval(fetchPresence, 30000);

        const markAsRead = async () => {
            await supabase
                .from('messages')
                .update({ read: true } as any)
                .eq('recipient_id', currentUserId)
                .eq('sender_id', targetUserId)
                .eq('read', false);
        };

        markAsRead();

        return () => clearInterval(interval);
    }, [targetUserId, currentUserId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        const msgData = {
            sender_id: currentUserId,
            recipient_id: targetUserId,
            content: newMessage,
            read: false
        };

        const { data: insertedMsg } = await supabase
            .from("messages")
            .insert(msgData as any)
            .select()
            .single();

        if (insertedMsg) {
            setMessages(prev => [...prev, insertedMsg as Message]);
            setNewMessage("");
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${currentUserId}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('message_attachments')
            .upload(fileName, file);

        if (uploadError) {
            setIsUploading(false);
            return;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('message_attachments')
            .getPublicUrl(fileName);

        const attachment = {
            url: publicUrl,
            type: file.type,
            name: file.name
        };

        const msgData = {
            sender_id: currentUserId,
            recipient_id: targetUserId,
            content: file.type.startsWith('image/') ? 'Görsel' : file.name,
            attachments: [attachment],
            read: false
        };

        const { data: insertedMsg } = await supabase.from("messages").insert(msgData as any).select().single();
        if (insertedMsg) {
            setMessages(prev => [...prev, insertedMsg as Message]);
        }
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="flex flex-col h-full bg-white relative">
            {/* Header */}
            <div className="p-4 px-6 border-b bg-white flex items-center justify-between shadow-sm z-10 relative">
                <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 border-2 border-slate-50 shadow-sm">
                        <AvatarImage src={targetUserPhoto || `https://ui-avatars.com/api/?name=${targetUserName || 'User'}`} />
                        <AvatarFallback><User size={24} /></AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-black text-xl text-slate-800 tracking-tight">{targetUserName || "Sohbet"}</h3>
                        <p className="text-[12px] font-bold">
                            {isOnline ? (
                                <span className="text-emerald-500 font-bold flex items-center gap-1.5 mt-0.5">
                                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                    çevrimiçi
                                </span>
                            ) : (
                                <span className="text-slate-400">çevrimdışı</span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div
                className="flex-1 p-6 bg-[#E5DDD5] overflow-y-auto scroll-smooth"
                style={{ backgroundImage: 'url("https://w7.pngwing.com/pngs/351/181/png-transparent-whatsapp-background-thumbnail.png")', backgroundBlendMode: 'overlay', backgroundColor: 'rgba(229, 221, 213, 0.95)' }}
            >
                <div className="space-y-4 flex flex-col justify-end min-h-full">
                    {messages.length === 0 && !loading && (
                        <div className="text-center w-full py-10 flex flex-col items-center">
                            <div className="bg-[#FFF5C4] text-gray-700 text-sm px-6 py-3 rounded-2xl shadow-sm text-center max-w-sm font-medium">
                                Uçtan uca şifrelenmiş mesajlaşma başladı. Görüşmeleriniz güvenle saklanmaktadır.
                            </div>
                        </div>
                    )}
                    {messages.map((msg) => {
                        const isMe = msg.sender_id === currentUserId;
                        const hasAttachments = msg.attachments && msg.attachments.length > 0;
                        const firstAttachment = hasAttachments ? msg.attachments![0] : null;
                        const isImage = firstAttachment?.type?.startsWith('image/');

                        return (
                            <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[75%] md:max-w-[65%] flex flex-col rounded-[1.25rem] px-4 pt-2.5 pb-2 shadow-sm relative ${isMe
                                        ? 'bg-[#dcf8c6] text-[#111b21] rounded-tr-none'
                                        : 'bg-white text-[#111b21] rounded-tl-none'
                                        }`}
                                >
                                    {/* Attachment rendering */}
                                    {hasAttachments && (
                                        <div className="mb-2 -mx-2 -mt-1 overflow-hidden rounded-t-[1rem] rounded-b-sm">
                                            {isImage ? (
                                                <div className="relative group">
                                                    <img
                                                        src={firstAttachment.url}
                                                        alt="Attachment"
                                                        className="w-full h-auto max-h-[450px] object-cover hover:opacity-95 transition-opacity cursor-pointer shadow-inner"
                                                        onClick={() => window.open(firstAttachment.url, '_blank')}
                                                    />
                                                </div>
                                            ) : (
                                                <a
                                                    href={firstAttachment.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-4 p-4 bg-black/5 hover:bg-black/10 transition-colors"
                                                >
                                                    <div className="p-3 bg-white rounded-xl shadow-sm">
                                                        <FileIcon size={24} className="text-emerald-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-base font-black truncate pr-4">{firstAttachment.name || 'Dosya'}</p>
                                                        <p className="text-[11px] opacity-60 uppercase font-black tracking-widest mt-0.5">EKLİ DOSYA</p>
                                                    </div>
                                                </a>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex flex-col relative pb-3">
                                        {(!isImage || (msg.content && msg.content !== 'Görsel')) && (
                                            <p className="text-[17px] md:text-[18px] leading-[1.5] whitespace-pre-wrap break-words pr-14 font-medium">
                                                {msg.content}
                                            </p>
                                        )}
                                        <div className="absolute bottom-[-1px] right-[-4px] flex items-center gap-1.5 pl-4 bg-transparent">
                                            <span className="text-[11px] text-gray-500 font-bold uppercase">
                                                {format(new Date(msg.created_at || Date.now()), 'HH:mm')}
                                            </span>
                                            {isMe && (
                                                <div className="flex items-center ml-0.5">
                                                    <Check
                                                        size={16}
                                                        className={`${msg.read ? "text-[#53bdeb]" : "text-gray-400"} -mr-2.5`}
                                                    />
                                                    <Check
                                                        size={16}
                                                        className={`${msg.read ? "text-[#53bdeb]" : "text-gray-400"}`}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#f0f2f5] flex items-center gap-3">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                />

                <div className="flex items-center gap-1.5">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-500 hover:text-emerald-600 hover:bg-gray-200 h-14 w-14 rounded-2xl transition-all"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <ImageIcon size={30} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-500 hover:text-emerald-600 hover:bg-gray-200 h-14 w-14 rounded-2xl transition-all"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Paperclip size={28} />
                    </Button>
                </div>

                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    autoComplete="off"
                    placeholder="Bir mesaj yazın..."
                    className="flex-1 border-none bg-white shadow-sm rounded-2xl h-14 px-6 focus-visible:ring-1 focus-visible:ring-emerald-500/30 font-bold text-xl transition-all"
                />

                <Button
                    onClick={handleSendMessage}
                    size="icon"
                    className="h-14 w-14 shrink-0 bg-[#00a884] hover:bg-[#06cf9c] text-white rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center p-0"
                    disabled={(!newMessage.trim() && !isUploading) || isUploading}
                >
                    {isUploading ? <Loader2 size={24} className="animate-spin" /> : <Send size={30} className="translate-x-[2px]" />}
                </Button>
            </div>
        </div>
    );
}
