
import { useState, useEffect } from "react";
import { format, addDays, startOfDay, isSameDay, isBefore } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar as CalendarIcon, Check, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface BookingCalendarProps {
    advisorId: string;
    customerId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function BookingCalendar({ advisorId, customerId, isOpen, onClose }: BookingCalendarProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (selectedDate && advisorId) {
            fetchAvailableSlots(selectedDate);
        }
    }, [selectedDate, advisorId]);

    const fetchAvailableSlots = async (date: Date) => {
        setLoading(true);
        setSelectedSlot(null);

        // 1. Generate all possible slots from 08:00 to 20:00 (30 min intervals)
        const allSlots = [];
        for (let hour = 8; hour < 20; hour++) {
            allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
            allSlots.push(`${hour.toString().padStart(2, '0')}:30`);
        }

        // 2. Fetch advisor recurring availability
        const dayOfWeek = date.getDay();
        const { data: recurringAvailability } = await supabase
            .from('advisor_availability' as any)
            .select('*')
            .eq('advisor_id', advisorId)
            .eq('day_of_week', dayOfWeek) as { data: any[] | null };

        // 3. Fetch existing consultations for this day
        const dayStart = startOfDay(date).toISOString();
        const nextDay = addDays(startOfDay(date), 1).toISOString();

        const { data: bookings } = await supabase
            .from('consultations' as any)
            .select('start_time')
            .eq('advisor_id', advisorId)
            .gte('start_time', dayStart)
            .lt('start_time', nextDay)
            .in('status', ['pending', 'confirmed']) as { data: any[] | null };

        // 4. Fetch blocked slots
        const { data: blocked } = await supabase
            .from('advisor_blocked_slots' as any)
            .select('start_time, end_time')
            .eq('advisor_id', advisorId)
            .gte('start_time', dayStart)
            .lt('start_time', nextDay) as { data: any[] | null };

        // Filter slots
        const bookedTimes = bookings?.map(b => format(new Date(b.start_time), 'HH:mm')) || [];

        const finalSlots = allSlots.filter(slot => {
            // Check if in the past
            const [h, m] = slot.split(':').map(Number);
            const slotDate = new Date(date);
            slotDate.setHours(h, m, 0, 0);
            if (isBefore(slotDate, new Date())) return false;

            // Check recurring availability (if advisor has set any)
            if (recurringAvailability && recurringAvailability.length > 0) {
                const isAvailable = recurringAvailability.some(a => {
                    const start = a.start_time.substring(0, 5);
                    const end = a.end_time.substring(0, 5);
                    return slot >= start && slot < end;
                });
                if (!isAvailable) return false;
            }

            // Check if already booked
            if (bookedTimes.includes(slot)) return false;

            // Check blocked slots
            if (blocked && blocked.length > 0) {
                const isBlocked = blocked.some(b => {
                    const start = format(new Date(b.start_time), 'HH:mm');
                    const end = format(new Date(b.end_time), 'HH:mm');
                    return slot >= start && slot < end;
                });
                if (isBlocked) return false;
            }

            return true;
        });

        setAvailableSlots(finalSlots);
        setLoading(false);
    };

    const handleBooking = async () => {
        if (!selectedDate || !selectedSlot) return;

        setBookingLoading(true);
        const [h, m] = selectedSlot.split(':').map(Number);
        const startTime = new Date(selectedDate);
        startTime.setHours(h, m, 0, 0);
        const endTime = new Date(startTime.getTime() + 30 * 60000);

        const { error } = await supabase
            .from('consultations' as any)
            .insert({
                advisor_id: advisorId,
                customer_id: customerId,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                status: 'pending'
            });

        if (error) {
            toast({ title: "Hata", description: "Randevu oluşturulamadı: " + error.message, variant: "destructive" });
        } else {
            toast({ title: "Başarılı", description: "Randevu isteğiniz danışmana iletildi." });
            onClose();
        }
        setBookingLoading(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl">
                <div className="flex flex-col md:flex-row h-[600px]">
                    {/* Left Side - Calendar */}
                    <div className="w-full md:w-1/2 p-8 bg-slate-50 border-r border-slate-100 flex flex-col items-center">
                        <DialogHeader className="mb-8 text-center md:text-left w-full">
                            <div className="flex items-center gap-3 mb-2 text-primary">
                                <div className="p-2 bg-primary/10 rounded-xl">
                                    <CalendarIcon size={24} />
                                </div>
                                <DialogTitle className="text-2xl font-black text-navy-dark tracking-tight">Tarih Seçin</DialogTitle>
                            </div>
                            <DialogDescription className="text-slate-500 font-medium ml-11">
                                Görüşmek istediğiniz günü belirleyin.
                            </DialogDescription>
                        </DialogHeader>
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="rounded-2xl border-none bg-white shadow-xl shadow-slate-200/50 p-4"
                            disabled={(date) => date < startOfDay(new Date())}
                            locale={tr}
                        />
                    </div>

                    {/* Right Side - Slots */}
                    <div className="w-full md:w-1/2 p-8 flex flex-col bg-white overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3 text-emerald-600">
                                <div className="p-2 bg-emerald-50 rounded-xl">
                                    <Clock size={24} />
                                </div>
                                <h3 className="text-2xl font-black text-navy-dark tracking-tight">Saat Seçin</h3>
                            </div>
                            {selectedSlot && (
                                <Badge className="bg-emerald-500 text-white border-transparent px-4 py-1 rounded-full animate-in zoom-in duration-300">
                                    {selectedSlot}
                                </Badge>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {loading ? (
                                <div className="h-full flex items-center justify-center">
                                    <Loader2 className="animate-spin text-primary w-10 h-10" />
                                </div>
                            ) : availableSlots.length > 0 ? (
                                <div className="grid grid-cols-3 gap-3">
                                    {availableSlots.map((slot) => (
                                        <button
                                            key={slot}
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`h-12 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center ${selectedSlot === slot
                                                ? "bg-navy-dark text-white shadow-lg ring-2 ring-navy-dark/20 scale-105"
                                                : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100"
                                                }`}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                                    <div className="p-6 bg-slate-50 rounded-full mb-4">
                                        <X size={40} className="text-slate-400" />
                                    </div>
                                    <p className="font-bold text-slate-500">Seçilen tarihte uygun slot bulunamadı.</p>
                                </div>
                            )}
                        </div>

                        <div className="pt-8 border-t mt-auto">
                            <Button
                                onClick={handleBooking}
                                disabled={!selectedSlot || bookingLoading}
                                className="w-full h-16 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg shadow-xl shadow-emerald-200/50 transition-all active:scale-[0.98]"
                            >
                                {bookingLoading ? <Loader2 className="animate-spin mr-2" /> : <Check className="mr-2" size={20} />}
                                Randevu İsteği Gönder
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
