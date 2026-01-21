import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, FileBarChart, Calendar, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Reports() {
  const { toast } = useToast();

  const handleExport = (reportName: string) => {
    toast({
      title: "Export Started",
      description: `Downloading ${reportName}...`,
    });
  };

  const reports = [
    { 
      title: "Inventory Stock Report", 
      desc: "Detailed list of all items, locations, and current stock levels.",
      type: "Daily"
    },
    { 
      title: "Low Stock Alert Report", 
      desc: "Items below minimum threshold requiring re-ordering.",
      type: "Alert"
    },
    { 
      title: "Inward Movement Log", 
      desc: "Complete history of all GRN entries for the selected period.",
      type: "Weekly"
    },
    { 
      title: "Outward Dispatch Log", 
      desc: "Record of all customer shipments and delivery statuses.",
      type: "Weekly"
    },
    { 
      title: "Inventory Valuation", 
      desc: "Financial report of current inventory asset value.",
      type: "Monthly"
    },
  ];

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">MIS Reports</h1>
          <p className="text-muted-foreground">Generate and export system reports</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Calendar className="w-4 h-4" /> Select Period
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report, idx) => (
          <Card key={idx} className="group hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <FileBarChart className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded bg-secondary">
                  {report.type}
                </span>
              </div>
              <CardTitle className="mt-4">{report.title}</CardTitle>
              <CardDescription>{report.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button 
                  className="flex-1 gap-2" 
                  onClick={() => handleExport(report.title)}
                >
                  <Download className="w-4 h-4" /> Export CSV
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleExport(`${report.title} (PDF)`)}
                >
                  <Printer className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Layout>
  );
}
