"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useSettings } from "@/context/settings-context";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { OcrEngine } from "@/types";
import { Bot, Cpu, KeyRound, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { testOpenAIConnection } from "@/lib/openai";
import { cn } from "cn";

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}

function SettingsContent() {
  const { settings, setOcrEngine, setOpenaiApiKey, updateSettings } = useSettings();
  const [apiKeyInput, setApiKeyInput] = useState(settings.openaiApiKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);

  const handleTestKey = async () => {
    if (!apiKeyInput) return;
    setIsTesting(true);
    setTestResult(null);
    try {
      const isValid = await testOpenAIConnection(apiKeyInput);
      setTestResult(isValid ? "success" : "error");
      if (isValid) {
        setOpenaiApiKey(apiKeyInput);
      }
    } catch {
      setTestResult("error");
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveKey = () => {
    setOpenaiApiKey(apiKeyInput);
    setTestResult(null);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure extraction engines</p>
      </div>

      {/* OCR Engine Selection */}
      <Card className="p-6 bg-muted border-border space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">OCR Engine</h2>
          <p className="text-sm text-muted-foreground mt-1">Select the technology used to extract text from labels.</p>
        </div>

        <RadioGroup 
          value={settings.ocrEngine} 
          onValueChange={(v) => setOcrEngine(v as OcrEngine)}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* AI Mode */}
          <div className="relative h-full">
            <RadioGroupItem value="openai" id="openai" className="peer sr-only" />
            <Label
              htmlFor="openai"
              className={engineCardClass(settings.ocrEngine === "openai")}
            >
              {settings.ocrEngine === "openai" && <SelectedMark />}
              <div className="flex items-center gap-3 mb-2 pr-16">
                <div className="p-2 rounded-lg bg-primary/20 text-primary">
                  <Bot className="h-5 w-5" />
                </div>
                <span className="font-semibold text-foreground">AI Vision (OpenAI)</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Uses GPT-4o to analyze images. High accuracy, handles curved text and glare well. Requires API key.
              </p>
            </Label>
          </div>

          {/* Tesseract Mode */}
          <div className="relative h-full">
            <RadioGroupItem value="tesseract" id="tesseract" className="peer sr-only" />
            <Label
              htmlFor="tesseract"
              className={engineCardClass(settings.ocrEngine === "tesseract")}
            >
              {settings.ocrEngine === "tesseract" && <SelectedMark />}
              <div className="flex items-center gap-3 mb-2 pr-16">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-500">
                  <Cpu className="h-5 w-5" />
                </div>
                <span className="font-semibold text-foreground">Offline OCR (Tesseract)</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Runs entirely in your browser. <strong>Works behind firewalls. No API key needed.</strong> Lower accuracy.
              </p>
            </Label>
          </div>
        </RadioGroup>

        {/* OpenAI Config */}
        {settings.ocrEngine === "openai" && (
          <div className="pt-6 border-t border-border space-y-4">
            <h3 className="text-sm font-medium text-foreground">OpenAI Configuration</h3>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">API Key</Label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="sk-..."
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    className="pl-9 bg-card border-border"
                  />
                </div>
                <Button 
                  onClick={handleTestKey} 
                  disabled={!apiKeyInput || isTesting}
                  variant="outline"
                  className="bg-muted border-border hover:bg-accent w-24"
                >
                  {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Test Key"}
                </Button>
                <Button 
                  onClick={handleSaveKey}
                  disabled={apiKeyInput === settings.openaiApiKey}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Save
                </Button>
              </div>
              
              {/* Fallback note */}
              {!settings.openaiApiKey && (
                <p className="text-[10px] text-muted-foreground">
                  If left empty, the app will attempt to use the OPENAI_API_KEY environment variable.
                </p>
              )}

              {/* Test Results */}
              {testResult === "success" && (
                <p className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Connection successful
                </p>
              )}
              {testResult === "error" && (
                <p className="text-xs text-red-400 flex items-center gap-1 mt-2">
                  <XCircle className="h-3.5 w-3.5" /> Invalid API key or connection failed
                </p>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <Label className="text-xs text-muted-foreground">Model</Label>
              <Select 
                value={settings.openaiModel} 
                onValueChange={(v) => updateSettings({ openaiModel: v as any })}
              >
                <SelectTrigger className="w-[200px] bg-card border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">GPT-4o (Recommended)</SelectItem>
                  <SelectItem value="gpt-4o-mini">GPT-4o-mini (Faster)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function engineCardClass(selected: boolean) {
  return cn(
    "relative flex h-full flex-col p-4 border-2 rounded-xl cursor-pointer transition-all",
    selected
      ? "border-primary bg-primary/10 ring-2 ring-primary/25"
      : "border-border bg-card hover:border-ring"
  );
}

function SelectedMark() {
  return (
    <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
      <CheckCircle2 className="h-4 w-4" />
      Selected
    </span>
  );
}
