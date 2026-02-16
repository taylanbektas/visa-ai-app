import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Bell,
  FileText,
  User,
  Settings,
  Upload,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

const applications = [
  { id: "VP-A1B2", destination: "France", type: "Schengen Tourist", status: "In Review", advisor: "Sarah Johnson", date: "Feb 10, 2026" },
  { id: "VP-X9Z8", destination: "United Kingdom", type: "Standard Visitor", status: "Action Required", advisor: "David Chen", date: "Jan 25, 2026" },
];

const notifications = [
  { text: "Your France visa application documents have been reviewed.", time: "2 hours ago", type: "info" },
  { text: "Action required: Please upload an updated bank statement for your UK application.", time: "1 day ago", type: "warning" },
  { text: "Welcome to VisaPath! Your account has been created successfully.", time: "3 days ago", type: "success" },
];

const statusIcons: Record<string, any> = {
  "In Review": Clock,
  Approved: CheckCircle,
  "Action Required": AlertCircle,
};

const statusColors: Record<string, string> = {
  "In Review": "bg-gold/10 text-gold-dark",
  Approved: "bg-success/10 text-success",
  "Action Required": "bg-orange-500/10 text-orange-700",
};

export default function Dashboard() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold mb-1">Welcome back, Ayşe</h1>
          <p className="text-muted-foreground">Here's an overview of your visa applications.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Applications */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <FileText size={18} /> Your Applications
              </h2>
              <div className="space-y-4">
                {applications.map((app) => {
                  const StatusIcon = statusIcons[app.status] || Clock;
                  return (
                    <div key={app.id} className="bg-card border rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="font-mono text-xs text-muted-foreground">{app.id}</span>
                          <h3 className="font-semibold">{app.destination} — {app.type}</h3>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[app.status] || ""}`}>
                          <StatusIcon size={12} />
                          {app.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User size={14} />
                          <span>Advisor: {app.advisor}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{app.date}</span>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Link to="/track">
                          <Button size="sm" variant="outline" className="text-xs">Track Status</Button>
                        </Link>
                        <Button size="sm" variant="ghost" className="text-xs">
                          <Upload size={12} className="mr-1" /> Upload Docs
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Start New */}
            <Link to="/apply" className="block">
              <div className="border-2 border-dashed border-accent/20 rounded-xl p-6 text-center hover:border-accent/40 transition-colors">
                <p className="text-sm font-medium text-muted-foreground">
                  + Start a New Application
                </p>
              </div>
            </Link>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notifications */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Bell size={18} /> Notifications
              </h2>
              <div className="bg-card border rounded-xl divide-y">
                {notifications.map((n, i) => (
                  <div key={i} className="p-4">
                    <p className="text-xs leading-relaxed">{n.text}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Account */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Settings size={18} /> Account
              </h2>
              <div className="bg-card border rounded-xl p-5 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="text-sm font-medium">Ayşe Karagöz</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">ayse@example.com</p>
                </div>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Edit Profile
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
