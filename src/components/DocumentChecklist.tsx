
import React, { useState, useEffect } from "react";
import { Upload, FileText, CheckCircle, Clock, AlertCircle, Paperclip, Loader2, X, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getRequirements, Requirement } from "@/data/visaRequirements";

interface DocumentChecklistProps {
    applicationId: string;
    userId: string;
    destination: string;
    visaType: string;
    status?: string;
    onStatusChange?: (newStatus: string) => void;
}

interface UploadedDoc {
    name: string;
    url: string;
    requirementId: string;
}

const DocumentChecklist: React.FC<DocumentChecklistProps> = ({ applicationId, userId, destination, visaType, status, onStatusChange }) => {
    const [requirements, setRequirements] = useState<Requirement[]>([]);
    const [uploadedDocs, setUploadedDocs] = useState<Record<string, UploadedDoc>>({});
    const [uploadingId, setUploadingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setRequirements(getRequirements(destination, visaType));
        fetchUploadedDocuments();
    }, [applicationId, destination, visaType]);

    const fetchUploadedDocuments = async () => {
        // In a real app, we would fetch from a 'application_documents' table
        // For now, let's use the local storage pattern or simulate from Supabase storage list
        setLoading(true);
        try {
            const { data, error } = await supabase.storage
                .from('documents')
                .list(`${userId}/${applicationId}`);

            if (error) throw error;

            if (data) {
                const docs: Record<string, UploadedDoc> = {};
                for (const file of data) {
                    const parts = file.name.split('_');
                    if (parts.length >= 3) {
                        const reqId = parts[0];
                        const originalName = parts.slice(2).join('_');
                        const { data: signedUrlData } = await supabase.storage
                            .from('documents')
                            .createSignedUrl(`${userId}/${applicationId}/${file.name}`, 3600);
                        docs[reqId] = { name: originalName, url: signedUrlData?.signedUrl || '', requirementId: reqId };
                    }
                }
                setUploadedDocs(docs);
            }
        } catch (err) {
            console.error("Error fetching docs:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (reqId: string, file: File) => {
        if (!file) return;
        setUploadingId(reqId);

        const fileName = `${reqId}_${Date.now()}_${file.name}`;
        const filePath = `${userId}/${applicationId}/${fileName}`;

        try {
            const { error } = await supabase.storage.from('documents').upload(filePath, file);
            if (error) throw error;

            const { data: signedUrlData } = await supabase.storage
                .from('documents')
                .createSignedUrl(filePath, 3600);
            const fileUrl = signedUrlData?.signedUrl || '';

            const { error: dbError } = await (supabase as any)
                .from('application_documents')
                .insert({
                    application_id: applicationId,
                    name: file.name,
                    url: fileUrl
                });

            if (dbError) throw dbError;

            setUploadedDocs(prev => ({
                ...prev,
                [reqId]: { name: file.name, url: fileUrl, requirementId: reqId }
            }));

            toast.success(`${file.name} başarıyla yüklendi.`);
        } catch (err) {
            console.error(err);
            toast.error("Yükleme başarısız oldu.");
        } finally {
            setUploadingId(null);
        }
    };

    const handleDelete = async (reqId: string) => {
        const doc = uploadedDocs[reqId];
        if (!doc) return;

        // This is complex because we don't have the exact file path easily from meta info
        // In a real app, this would be a DB entry deletion which triggers storage cleanup
        toast.error("Silme işlemi için yönetici ile iletişime geçin.");
    };

    const handleSendForReview = async () => {
        if (!applicationId) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('applications')
                .update({ status: 'İnceleniyor' } as any)
                .eq('id', applicationId);

            if (error) throw error;

            toast.success("Belgeleriniz danışman incelemesine gönderildi.");
            if (onStatusChange) {
                onStatusChange('İnceleniyor');
            }
        } catch (err) {
            console.error("Error updating status:", err);
            toast.error("İşlem sırasında bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-slate-300" /></div>;

    const allUploaded = requirements.length > 0 && Object.keys(uploadedDocs).length === requirements.length;
    const canSendForReview = allUploaded && (status === 'Alındı' || status === 'İşlem Gerekli');

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-black text-navy-dark">Gerekli Belgeler</h3>
                    <p className="text-sm text-slate-500 font-medium">Lütfen aşağıdaki belgeleri hazırlayıp sisteme yükleyin.</p>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-black text-emerald-500">{Object.keys(uploadedDocs).length}/{requirements.length}</span>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Tamamlandı</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {requirements.map((req) => {
                    const isUploaded = !!uploadedDocs[req.id];
                    const isUploading = uploadingId === req.id;

                    return (
                        <div
                            key={req.id}
                            className={`p-6 rounded-[2rem] border transition-all duration-300 ${isUploaded ? 'bg-emerald-50/30 border-emerald-100' : 'bg-white border-slate-100 hover:border-blue-200 shadow-sm'}`}
                        >
                            <div className="flex flex-col md:flex-row md:items-center gap-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${isUploaded ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                    {isUploaded ? <CheckCircle size={24} /> : <FileText size={24} />}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-navy-dark text-lg">{req.name}</h4>
                                        {req.required && <span className="text-[10px] bg-rose-50 text-rose-500 font-black px-2 py-0.5 rounded-full uppercase">Zorunlu</span>}
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium">{req.description}</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    {isUploaded ? (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-xl border-slate-200 h-10 px-4 font-bold text-slate-600 hover:bg-slate-50"
                                                asChild
                                            >
                                                <a href={uploadedDocs[req.id].url} target="_blank" rel="noopener noreferrer">
                                                    <Eye size={16} className="mr-2" /> Görüntüle
                                                </a>
                                            </Button>
                                            <input
                                                id={`file-reupload-${req.id}`}
                                                type="file"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleUpload(req.id, file);
                                                    e.target.value = ''; // Reset for re-upload
                                                }}
                                            />
                                            <Button
                                                onClick={() => document.getElementById(`file-reupload-${req.id}`)?.click()}
                                                variant="ghost"
                                                size="sm"
                                                className="rounded-xl h-10 w-10 p-0 text-slate-400 hover:text-navy-dark hover:bg-slate-100"
                                            >
                                                <Upload size={16} />
                                            </Button>
                                        </>
                                    ) : (
                                        <div className={isUploading ? "pointer-events-none opacity-70" : ""}>
                                            <input
                                                id={`file-upload-${req.id}`}
                                                type="file"
                                                className="hidden"
                                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                disabled={isUploading}
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleUpload(req.id, file);
                                                    e.target.value = ''; // Reset for re-upload
                                                }}
                                            />
                                            <Button
                                                onClick={() => document.getElementById(`file-upload-${req.id}`)?.click()}
                                                className="bg-navy-dark hover:bg-navy-light text-white font-black px-6 h-11 rounded-xl shadow-lg shadow-navy-dark/10 transition-all flex items-center gap-2"
                                                disabled={isUploading}
                                            >
                                                {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                                {isUploading ? "Yükleniyor..." : "Dosya Seç"}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {canSendForReview && (
                <div className="mt-8 p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4">
                    <div>
                        <h4 className="font-black text-navy-dark text-lg mb-1">Tüm Belgeler Tamam</h4>
                        <p className="text-sm text-emerald-700 font-medium">Belgelerinizi danışmanınızın kontrol etmesi için gönderebilirsiniz.</p>
                    </div>
                    <Button
                        onClick={handleSendForReview}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-8 h-12 rounded-xl shadow-lg shadow-emerald-200 w-full sm:w-auto transition-all"
                    >
                        Danışman İncelemesine Gönder
                    </Button>
                </div>
            )}
        </div>
    );
};

export default DocumentChecklist;
