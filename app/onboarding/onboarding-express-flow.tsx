"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { CheckCircle2, Copy, Linkedin, Mail, Upload, WandSparkles } from "lucide-react";

type FlowStage = "upload" | "processing" | "live";

const PROCESS_STEPS = [
  "Analyzing your experience",
  "Building your first-person bio",
  "Selecting the best template for your niche",
  "Activating your AI agent",
] as const;

const SHARE_COPY =
  "I just launched my AI-powered consulting portfolio with Rep AI. Take a look:";

export function OnboardingExpressFlow() {
  const [stage, setStage] = useState<FlowStage>("upload");
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [copied, setCopied] = useState(false);

  const portfolioUrl = useMemo(() => "https://yourname.rep.ai", []);

  const startGeneration = () => {
    if (!resumeName && !linkedInUrl.trim()) {
      toast.error("Upload a PDF resume or paste your LinkedIn URL to continue.");
      return;
    }

    setStage("processing");
    setProgress(10);
    setActiveStep(0);

    let tick = 0;
    const timer = window.setInterval(() => {
      tick += 1;
      const nextProgress = Math.min(100, 10 + tick * 15);
      setProgress(nextProgress);
      setActiveStep(Math.min(PROCESS_STEPS.length - 1, Math.floor((nextProgress / 100) * PROCESS_STEPS.length)));

      if (nextProgress >= 100) {
        window.clearInterval(timer);
        setStage("live");
      }
    }, 600);
  };

  const handleResumePick = (file: File | null) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      return;
    }
    setResumeName(file.name);
  };

  const copyPortfolioLink = async () => {
    await navigator.clipboard.writeText(portfolioUrl);
    setCopied(true);
    toast.success("Portfolio link copied.");
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header className="text-center">
          <p className="text-muted-foreground text-sm">2-minute launch flow</p>
          <h1 className="mt-2 font-serif text-4xl font-medium">Launch your consulting portfolio in minutes</h1>
          <p className="text-muted-foreground mt-3 text-sm">
            For independent consultants and coaches selling high-ticket services.
          </p>
        </header>

        {stage === "upload" ? (
          <Card className="space-y-5 p-6">
            <div>
              <h2 className="text-xl font-semibold">Step 1: Drop resume or LinkedIn URL</h2>
              <p className="text-muted-foreground text-sm">No forms. No setup wizard. Just one input to get your first live version.</p>
            </div>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center hover:bg-muted/40">
              <Upload className="text-muted-foreground mb-3 size-6" />
              <p className="font-medium">Drag and drop your resume PDF</p>
              <p className="text-muted-foreground text-xs">or click to browse</p>
              {resumeName ? <p className="mt-2 text-xs">Selected: {resumeName}</p> : null}
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(event) => handleResumePick(event.target.files?.[0] ?? null)}
              />
            </label>

            <div className="space-y-2">
              <p className="text-muted-foreground text-xs uppercase">or</p>
              <Input
                placeholder="https://www.linkedin.com/in/your-profile"
                value={linkedInUrl}
                onChange={(event) => setLinkedInUrl(event.target.value)}
              />
            </div>

            <Button onClick={startGeneration} className="w-full">
              <WandSparkles className="mr-2 size-4" />
              Build my live portfolio
            </Button>
          </Card>
        ) : null}

        {stage === "processing" ? (
          <Card className="space-y-5 p-6">
            <div>
              <h2 className="text-xl font-semibold">Step 2: Building your site now</h2>
              <p className="text-muted-foreground text-sm">Your AI is doing the setup in the background.</p>
            </div>

            <Progress value={progress} />

            <ul className="space-y-2 text-sm">
              {PROCESS_STEPS.map((step, index) => (
                <li key={step} className="flex items-center gap-2">
                  {index <= activeStep ? <CheckCircle2 className="size-4 text-green-600" /> : <div className="size-4 rounded-full border" />}
                  <span className={index <= activeStep ? "text-foreground" : "text-muted-foreground"}>{step}...</span>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        {stage === "live" ? (
          <Card className="space-y-6 p-6">
            <div>
              <h2 className="text-xl font-semibold">Step 3: Your portfolio is live</h2>
              <p className="text-muted-foreground text-sm">Share first, then customize. Commitment starts with distribution.</p>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4 text-sm">
              <p className="font-medium">Live URL</p>
              <p className="text-primary mt-1">{portfolioUrl}</p>
              <p className="text-muted-foreground mt-2 text-xs">
                Includes a first-person bio, highlighted projects, an industry-matched template, and an active AI agent widget.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button onClick={copyPortfolioLink}>
                <Copy className="mr-2 size-4" />
                {copied ? "Copied" : "Copy portfolio link"}
              </Button>
              <Button variant="outline" asChild>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(portfolioUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Linkedin className="mr-2 size-4" />
                  Share on LinkedIn
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${SHARE_COPY} ${portfolioUrl}`)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Share on WhatsApp
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href={`mailto:?subject=${encodeURIComponent("My live consulting portfolio")}&body=${encodeURIComponent(`${SHARE_COPY} ${portfolioUrl}`)} `}>
                  <Mail className="mr-2 size-4" />
                  Share by email
                </a>
              </Button>
            </div>

            <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground text-xs">Next week: unlock edits, template tuning, and AI training through micro-goals.</p>
              <Button variant="ghost" asChild>
                <Link href="/onboarding/chat">Customize now instead</Link>
              </Button>
            </div>
          </Card>
        ) : null}
      </div>
    </main>
  );
}
