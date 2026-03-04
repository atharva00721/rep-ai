import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Globe, Loader2, XCircle, Search } from "lucide-react";
import type { AgentConfigState } from "./types";
import Image from "next/image";
import { useState } from "react";
import { UpgradeRequiredModal } from "@/components/upgrade-required-modal";
import { useRouter } from "next/navigation";

interface AgentIntegrationsTabProps {
  config: AgentConfigState;
  isDisconnectingCalendar: boolean;
  handleCalendarDisconnect: () => Promise<void>;
  isDisconnectingCalendly: boolean;
  handleCalendlyDisconnect: () => Promise<void>;
  plan: string;
}

export function AgentIntegrationsTab({
  config,
  isDisconnectingCalendar,
  handleCalendarDisconnect,
  isDisconnectingCalendly,
  handleCalendlyDisconnect,
  plan
}: AgentIntegrationsTabProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [activeFeature, setActiveFeature] = useState("");
  const router = useRouter();

  const handleConnect = (feature: string, connectUrl: string) => {
    if (plan === "free") {
      setActiveFeature(feature);
      setShowUpgradeModal(true);
    } else {
      window.location.href = connectUrl;
    }
  };

  return (
    <div className="space-y-6 pt-5">
      <UpgradeRequiredModal
        isOpen={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        featureName={activeFeature}
      />
      <div className="grid gap-6 md:grid-cols-2">
        {/* Google Calendar */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <Image src="/Integrations/g_calender.svg" alt="Google Calendar" width={70} height={70} className="-ml-2" />
              <Badge variant={config.googleCalendarEnabled ? "default" : "secondary"}>{config.googleCalendarEnabled ? <span className="flex items-center gap-1"><CheckCircle2 className="size-3" /> Connected</span> : "Not Connected"}</Badge>
            </div>
            <CardTitle className="text-xl">Google Calendar</CardTitle>
            <CardDescription>Allow your agent to see your availability and schedule meetings directly into your calendar.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {config.googleCalendarEnabled && config.googleCalendarAccountEmail && <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50 border border-border text-sm font-medium"><Globe className="size-4 text-muted-foreground" /><span className="truncate">{config.googleCalendarAccountEmail}</span></div>}
            {!config.googleCalendarEnabled && <p className="text-sm text-muted-foreground">Connect your Google account to sync your calendar with your AI assistant.</p>}
          </CardContent>
          <CardFooter className="bg-muted/30 border-t border-border mt-auto">
            {config.googleCalendarEnabled ? (
              <Button variant="outline" className="w-full text-destructive hover:text-destructive" onClick={handleCalendarDisconnect} disabled={isDisconnectingCalendar}>
                {isDisconnectingCalendar ? <Loader2 className="size-4 animate-spin mr-2" /> : <XCircle className="size-4 mr-2" />}Disconnect Calendar
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={() => handleConnect("Google Calendar integration", "/api/integrations/google-calendar/connect")}
              >
                Connect Google Calendar
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Calendly */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <Image src="/Integrations/calendly.png" alt="Calendly" width={70} height={70} className="-ml-2 rounded-md" />
              <Badge variant={config.calendlyEnabled ? "default" : "secondary"}>
                {config.calendlyEnabled ? <span className="flex items-center gap-1"><CheckCircle2 className="size-3" /> Connected</span> : "Not Connected"}
              </Badge>
            </div>
            <CardTitle className="text-xl">Calendly</CardTitle>
            <CardDescription>Let your agent schedule meetings using your Calendly links and manage your bookings.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {config.calendlyEnabled && config.calendlyAccountEmail && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50 border border-border text-sm font-medium">
                <Globe className="size-4 text-muted-foreground" />
                <span className="truncate">{config.calendlyAccountEmail}</span>
              </div>
            )}
            {!config.calendlyEnabled && <p className="text-sm text-muted-foreground">Connect your Calendly account to allow your AI assistant to handle bookings.</p>}
          </CardContent>
          <CardFooter className="bg-muted/30 border-t border-border mt-auto">
            {config.calendlyEnabled ? (
              <Button variant="outline" className="w-full text-destructive hover:text-destructive" onClick={handleCalendlyDisconnect} disabled={isDisconnectingCalendly}>
                {isDisconnectingCalendly ? <Loader2 className="size-4 animate-spin mr-2" /> : <XCircle className="size-4 mr-2" />}Disconnect Calendly
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={() => handleConnect("Calendly integration", "/api/integrations/calendly/connect")}
              >
                Connect Calendly
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Lead Enrichment (The Spy) */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <div className="flex h-[70px] w-[70px] items-center justify-center rounded-md bg-primary/10">
                <Search className="size-8 text-primary" />
              </div>
              <Badge variant="default">
                <span className="flex items-center gap-1"><CheckCircle2 className="size-3" /> Active</span>
              </Badge>
            </div>
            <CardTitle className="text-xl">The Spy (Lead Enrichment)</CardTitle>
            <CardDescription>Automatically researches your leads in the background to enrich your notification emails with their LinkedIn profile, company size, and recent news.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              This feature is active and runs automatically whenever a new lead is detected. Wait for the magic to happen in your inbox!
            </p>
          </CardContent>
          <CardFooter className="bg-muted/30 border-t border-border mt-auto">
            <Button variant="outline" className="w-full" disabled>
              Running in Background
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
