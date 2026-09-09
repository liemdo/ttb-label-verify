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
import type { BeverageType, OcrEngine } from "@/types";
import { Bot, Cpu, KeyRound, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { testOpenAIConnection } from "@/lib/openai";

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
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-zinc-400 mt-1">Configure extraction engines and application preferences</p>
      </div>

      {/* OCR Engine Selection */}
      <Card className="p-6 bg-zinc-900 border-zinc-800 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">OCR Engine</h2>
          <p className="text-sm text-zinc-400 mt-1">Select the technology used to extract text from labels.</p>
        </div>

        <RadioGroup 
          value={settings.ocrEngine} 
          onValueChange={(v) => setOcrEngine(v as OcrEngine)}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* AI Mode */}
          <div className="relative">
            <RadioGroupItem value="openai" id="openai" className="peer sr-only" />
            <Label
              htmlFor="openai"
              className="flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500/10 peer-data-[state=unchecked]:border-zinc-800 peer-data-[state=unchecked]:bg-zinc-950 peer-data-[state=unchecked]:hover:border-zinc-700"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                  <Bot className="h-5 w-5" />
                </div>
                <span className="font-semibold text-zinc-200">AI Vision (OpenAI)</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Uses GPT-4o to analyze images. High accuracy, handles curved text and glare well. Requires API key.
              </p>
            </Label>
          </div>

          {/* Tesseract Mode */}
          <div className="relative">
            <RadioGroupItem value="tesseract" id="tesseract" className="peer sr-only" />
            <Label
              htmlFor="tesseract"
              className="flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all peer-data-[state=checked]:border-amber-500 peer-data-[state=checked]:bg-amber-500/10 peer-data-[state=unchecked]:border-zinc-800 peer-data-[state=unchecked]:bg-zinc-950 peer-data-[state=unchecked]:hover:border-zinc-700"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                  <Cpu className="h-5 w-5" />
                </div>
                <span className="font-semibold text-zinc-200">Offline OCR (Tesseract)</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Runs entirely in your browser. <strong>Works behind firewalls. No API key needed.</strong> Lower accuracy.
              </p>
            </Label>
          </div>
        </RadioGroup>

        {/* OpenAI Config */}
        {settings.ocrEngine === "openai" && (
          <div className="pt-6 border-t border-zinc-800 space-y-4">
            <h3 className="text-sm font-medium text-zinc-300">OpenAI Configuration</h3>
            
            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">API Key</Label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    type="password"
                    placeholder="sk-..."
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    className="pl-9 bg-zinc-950 border-zinc-800"
                  />
                </div>
                <Button 
                  onClick={handleTestKey} 
                  disabled={!apiKeyInput || isTesting}
                  variant="outline"
                  className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 w-24"
                >
                  {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Test Key"}
                </Button>
                <Button 
                  onClick={handleSaveKey}
                  disabled={apiKeyInput === settings.openaiApiKey}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save
                </Button>
              </div>
              
              {/* Fallback note */}
              {!settings.openaiApiKey && (
                <p className="text-[10px] text-zinc-500">
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
              <Label className="text-xs text-zinc-400">Model</Label>
              <Select 
                value={settings.openaiModel} 
                onValueChange={(v) => updateSettings({ openaiModel: v as any })}
              >
                <SelectTrigger className="w-[200px] bg-zinc-950 border-zinc-800">
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

      {/* Preferences */}
      <Card className="p-6 bg-zinc-900 border-zinc-800 space-y-4">
        <h2 className="text-lg font-semibold text-zinc-100 mb-2">Preferences</h2>
        
        <div className="space-y-2">
          <Label className="text-xs text-zinc-400">Default Beverage Type</Label>
          <Select 
            value={settings.defaultBeverageType} 
            onValueChange={(v) => updateSettings({ defaultBeverageType: v as BeverageType })}
          >
            <SelectTrigger className="w-[200px] bg-zinc-950 border-zinc-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spirits">Distilled Spirits</SelectItem>
              <SelectItem value="wine">Wine</SelectItem>
              <SelectItem value="beer">Malt Beverage (Beer)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[10px] text-zinc-500">
            Pre-selected type when verifying new labels.
          </p>
        </div>
      </Card>
    </div>
  );
}
