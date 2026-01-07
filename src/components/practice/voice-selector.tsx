"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VOICES, type VoiceInfo } from "@/lib/constants/voices";
import type { VoiceOption } from "@/types";

interface VoiceSelectorProps {
  value: VoiceOption;
  onChange: (value: VoiceOption) => void;
  className?: string;
}

export function VoiceSelector({ value, onChange, className }: VoiceSelectorProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Voice</CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={value} onValueChange={(v) => onChange(v as VoiceOption)}>
          <SelectTrigger className="w-full" aria-label="Select voice">
            <SelectValue placeholder="Select a voice" />
          </SelectTrigger>
          <SelectContent>
            {VOICES.map((voice: VoiceInfo) => (
              <SelectItem key={voice.id} value={voice.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{voice.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {voice.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
