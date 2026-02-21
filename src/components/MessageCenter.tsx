
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User, Paperclip, Loader2, X, Check, File as FileIcon, Image as ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import AIMessageSuggest from "@/components/AIMessageSuggest";

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

    const markAsRead = async () => {
        if (!targetUserId || !currentUserId) return;
        await supabase
            .from('messages')
            .update({ read: true } as any)
            .eq('recipient_id', currentUserId)
            .eq('sender_id', targetUserId)
            .eq('read', false);
    };

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
            markAsRead(); // Mark existing as read when opening conversation
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
                        markAsRead(); // Mark incoming as read if we are in this chat
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
        // Use auto for initial load (when loading is false) and smooth for new messages if already loaded
        const behavior = loading ? 'auto' : 'smooth';
        messagesEndRef.current?.scrollIntoView({ behavior });
    }, [messages, loading]);

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

        // Use signed URL instead of public URL for private bucket
        const { data: signedUrlData } = await supabase.storage
            .from('message_attachments')
            .createSignedUrl(fileName, 86400); // 24 hour expiry

        const fileUrl = signedUrlData?.signedUrl || '';

        const attachment = {
            url: fileUrl,
            type: file.type,
            name: file.name
        };

        const msgData = {
            sender_id: currentUserId,
            recipient_id: targetUserId,
            content: `FILE::${JSON.stringify([attachment])}`,
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
        <div className="flex flex-col flex-1 w-full h-full bg-white relative">
            {/* Header */}
            <div className="p-4 px-6 border-b bg-white flex items-center justify-between shadow-sm z-10 relative">
                <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 border-2 border-slate-50 shadow-sm">
                        <AvatarImage src={targetUserPhoto || `https://ui-avatars.com/api/?name=${targetUserName || 'User'}`} />
                        <AvatarFallback><User size={24} /></AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-black text-xl text-slate-800 tracking-tight">{targetUserName || "Sohbet"}</h3>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div
                className="flex-1 p-6 bg-slate-50 overflow-y-auto"
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
                        let actualContent = msg.content;
                        let inlineAttachments: any[] | undefined = msg.attachments;

                        if (actualContent && actualContent.startsWith('FILE::')) {
                            try {
                                const parsed = JSON.parse(actualContent.replace('FILE::', ''));
                                inlineAttachments = parsed;
                                actualContent = parsed[0]?.type?.startsWith('image/') ? 'Görsel' : parsed[0]?.name;
                            } catch (e) {
                                // Ignore
                            }
                        }

                        const hasAttachments = inlineAttachments && inlineAttachments.length > 0;
                        const firstAttachment = hasAttachments ? inlineAttachments![0] : null;
                        const isImage = (firstAttachment?.type?.startsWith('image/') ||
                            (firstAttachment?.url && /\.(jpeg|jpg|gif|png|webp|svg|bmp|ico)$/i.test(firstAttachment.url)) ||
                            (actualContent && actualContent.includes('Görsel')));

                        return (
                            <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[75%] md:max-w-[65%] flex flex-col rounded-[1.5rem] px-5 pt-3 pb-2.5 shadow-sm relative ${isMe
                                        ? 'bg-emerald-500 text-white rounded-tr-sm'
                                        : 'bg-white text-navy-dark border border-slate-100 rounded-tl-sm'
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
                                        {(!isImage || (actualContent && !actualContent.includes('Görsel')) || (isImage && !hasAttachments)) && (
                                            <p className="text-[16px] md:text-[17px] leading-relaxed whitespace-pre-wrap break-words pr-14 font-medium mb-1.5">
                                                {actualContent === 'Görsel' ? '📸 Görsel (Eski Mesaj)' : actualContent}
                                            </p>
                                        )}
                                        <div className="absolute bottom-[-2px] right-[-4px] flex items-center gap-1.5 pl-4 bg-transparent">
                                            <span className={`text-[11px] font-bold uppercase ${isMe ? 'text-emerald-100' : 'text-slate-400'}`}>
                                                {format(new Date(msg.created_at || Date.now()), 'HH:mm')}
                                            </span>
                                            {isMe && (
                                                <div className="flex items-center ml-0.5">
                                                    <Check
                                                        size={14}
                                                        className={`${msg.read ? "text-blue-200" : "text-emerald-200"} -mr-2.5`}
                                                    />
                                                    <Check
                                                        size={14}
                                                        className={`${msg.read ? "text-blue-200" : "text-emerald-200"}`}
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
            <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-2 sm:gap-4 px-4 sm:px-6">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                />

                <div className="flex items-center gap-1">
                    <AIMessageSuggest onSelect={(msg) => setNewMessage(msg)} />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 h-12 w-12 sm:h-14 sm:w-14 rounded-full transition-all"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <ImageIcon size={26} strokeWidth={2.5} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 h-12 w-12 sm:h-14 sm:w-14 rounded-full transition-all"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Paperclip size={24} strokeWidth={2.5} />
                    </Button>
                </div>

                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    autoComplete="off"
                    placeholder="Mesajınızı yazın..."
                    className="flex-1 bg-slate-50 border-none shadow-inner rounded-full h-12 sm:h-14 px-6 focus-visible:ring-1 focus-visible:ring-emerald-500/30 font-semibold text-lg sm:text-lg transition-all"
                />

                <Button
                    onClick={handleSendMessage}
                    size="icon"
                    className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-md shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center p-0"
                    disabled={(!newMessage.trim() && !isUploading) || isUploading}
                >
                    {isUploading ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} strokeWidth={2.5} className="mr-0.5" />}
                </Button>
            </div>
        </div>
    );
}
