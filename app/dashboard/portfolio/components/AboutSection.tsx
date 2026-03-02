"use client";

import { FileText, Pencil } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface AboutSectionProps {
    editMode: boolean; // Kept for prop compatibility
    content: {
        paragraph?: string;
    } | null;
    onUpdate: (value: string) => void;
    isVisible: boolean;
    onVisibilityChange?: (visible: boolean) => void;
}

export function AboutSection({ content, onUpdate, isVisible, onVisibilityChange }: AboutSectionProps) {
    return (
        <div className="space-y-6">
            <div className={cn("grid gap-6 transition-opacity", !isVisible && "opacity-50")}>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Label className="text-sm font-normal tracking-tight">Biography</Label>
                        <Pencil className="size-3 text-muted-foreground/50" />
                    </div>
                    <Textarea
                        value={content?.paragraph || ""}
                        onChange={(e) => onUpdate(e.target.value)}
                        placeholder="Write a brief introduction about yourself, your background, and your goals..."
                        rows={8}
                        className="text-base bg-background/50 border-primary/10 transition-all focus:border-primary/30 resize-none"
                    />
                </div>
            </div>
        </div>
    );
}
