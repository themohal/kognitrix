"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SERVICES_CONFIG } from "@/types";
import {
  FileText, Code, FileSearch, ImageIcon, Database, Languages, Search, ArrowRight,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  FileText, Code, FileSearch, ImageIcon, Database, Languages, Search,
};

export default function ServicesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">AI Services</h1>
        <p className="text-muted-foreground">
          Choose a service to use. All services are available via Web, API, and MCP.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {SERVICES_CONFIG.map((service) => {
          const Icon = iconMap[service.icon] || FileText;
          return (
            <Card
              key={service.slug}
              className="group hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant="outline">{service.credit_cost} credits</Badge>
                </div>
                <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {service.description}
                </p>
                <Link href={`/dashboard/services/${service.slug}`}>
                  <Button variant="gradient" className="w-full">
                    Use Service <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
