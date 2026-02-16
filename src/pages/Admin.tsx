import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Eye,
  Settings,
  Users,
} from "lucide-react";

const statusOptions = ["Received", "In Review", "Submitted", "Approved", "Rejected", "Action Required"];

const initialApps = [
  { id: "VP-A1B2", name: "Ayşe Karagöz", destination: "France", type: "Tourist", plan: "Navigator", status: "In Review", date: "2026-02-10", email: "ayse@example.com" },
  { id: "VP-C3D4", name: "Mehmet Yilmaz", destination: "United States", type: "Business", plan: "Concierge", status: "Submitted", date: "2026-02-08", email: "mehmet@example.com" },
  { id: "VP-E5F6", name: "Elena Petrov", destination: "United Kingdom", type: "Tourist", plan: "Navigator", status: "Approved", date: "2026-01-28", email: "elena@example.com" },
  { id: "VP-G7H8", name: "Ahmed Hassan", destination: "Germany", type: "Student", plan: "Pathfinder", status: "Received", date: "2026-02-14", email: "ahmed@example.com" },
  { id: "VP-I9J0", name: "Fatma Demir", destination: "Canada", type: "Tourist", plan: "Concierge", status: "In Review", date: "2026-02-12", email: "fatma@example.com" },
  { id: "VP-K1L2", name: "Omar Farooq", destination: "Australia", type: "Business", plan: "Navigator", status: "Action Required", date: "2026-02-09", email: "omar@example.com" },
  { id: "VP-M3N4", name: "Sofia Rossi", destination: "Japan", type: "Tourist", plan: "Pathfinder", status: "Received", date: "2026-02-15", email: "sofia@example.com" },
  { id: "VP-O5P6", name: "Ali Özkan", destination: "UAE", type: "Business", plan: "Navigator", status: "Approved", date: "2026-02-01", email: "ali@example.com" },
];

const statusColors: Record<string, string> = {
  Received: "bg-muted text-muted-foreground",
  "In Review": "bg-gold/10 text-gold-dark",
  Submitted: "bg-blue-500/10 text-blue-700",
  Approved: "bg-success/10 text-success",
  Rejected: "bg-destructive/10 text-destructive",
  "Action Required": "bg-orange-500/10 text-orange-700",
};

export default function Admin() {
  const [apps, setApps] = useState(initialApps);
  const [selectedApp, setSelectedApp] = useState<typeof initialApps[0] | null>(null);

  const updateStatus = (id: string, newStatus: string) => {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Manage all visa applications</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users size={16} />
            <span>{apps.length} applications</span>
          </div>
        </motion.div>

        <motion.div
          className="bg-card border rounded-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium">Ref</th>
                  <th className="text-left p-4 font-medium">Name</th>
                  <th className="text-left p-4 font-medium hidden md:table-cell">Destination</th>
                  <th className="text-left p-4 font-medium hidden md:table-cell">Type</th>
                  <th className="text-left p-4 font-medium hidden lg:table-cell">Plan</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium hidden lg:table-cell">Date</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((app) => (
                  <tr key={app.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-mono text-xs">{app.id}</td>
                    <td className="p-4 font-medium">{app.name}</td>
                    <td className="p-4 hidden md:table-cell text-muted-foreground">{app.destination}</td>
                    <td className="p-4 hidden md:table-cell text-muted-foreground">{app.type}</td>
                    <td className="p-4 hidden lg:table-cell text-muted-foreground">{app.plan}</td>
                    <td className="p-4">
                      <Select value={app.status} onValueChange={(v) => updateStatus(app.id, v)}>
                        <SelectTrigger className="h-7 w-[140px] text-xs">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[app.status] || ""}`}>
                            {app.status}
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-4 hidden lg:table-cell text-muted-foreground text-xs">{app.date}</td>
                    <td className="p-4">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedApp(app)}>
                            <Eye size={14} />
                          </Button>
                        </SheetTrigger>
                        <SheetContent>
                          <SheetHeader>
                            <SheetTitle>Application {app.id}</SheetTitle>
                          </SheetHeader>
                          <div className="mt-6 space-y-4">
                            {[
                              { label: "Name", value: app.name },
                              { label: "Email", value: app.email },
                              { label: "Destination", value: app.destination },
                              { label: "Visa Type", value: app.type },
                              { label: "Plan", value: app.plan },
                              { label: "Status", value: app.status },
                              { label: "Submitted", value: app.date },
                            ].map((item) => (
                              <div key={item.label}>
                                <p className="text-xs text-muted-foreground">{item.label}</p>
                                <p className="text-sm font-medium">{item.value}</p>
                              </div>
                            ))}
                          </div>
                        </SheetContent>
                      </Sheet>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
