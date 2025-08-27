
"use client";

import { useRef } from "react";
import { Download, Upload, Undo2,FileUp, FileDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { FullAppData, PlanData } from "@/lib/types";

export default function DataManager() {
  const { 
    role, 
    getFullData, 
    loadImportedData, 
    resetToLocalData, 
    isViewingImportedData,
    getPlanData,
    loadPlanData
  } = useAppContext();
  const { toast } = useToast();
  const playerDataInputRef = useRef<HTMLInputElement>(null);
  const planDataInputRef = useRef<HTMLInputElement>(null);

  const handleExportPlayerData = () => {
    try {
      const data = getFullData();
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const safePlayerName = data.playerName.replace(/\s+/g, '_');
      const date = new Date().toISOString().split('T')[0];
      link.download = `ProgressPad_data_${safePlayerName}_${date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: "Export Successful",
        description: "Your data has been downloaded.",
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Could not export your data. Check the console for details.",
      });
    }
  };

  const handleExportPlanData = () => {
    try {
      const data = getPlanData();
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const date = new Date().toISOString().split('T')[0];
      link.download = `ProgressPad_plan_${date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: "Plan Exported",
        description: "The workout plan has been downloaded.",
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Could not export the plan. Check the console for details.",
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fileType: 'player' | 'plan') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
            throw new Error("File could not be read as text.");
        }
        
        if (fileType === 'player') {
          const parsedData = JSON.parse(text) as FullAppData;
          if (parsedData.playerName && parsedData.dailyLogs && parsedData.exercises && parsedData.assignments) {
              loadImportedData(parsedData);
          } else {
              throw new Error("Invalid player data format in JSON file.");
          }
        } else if (fileType === 'plan') {
            const parsedData = JSON.parse(text) as PlanData;
            if (parsedData.exercises && parsedData.assignments) {
                loadPlanData(parsedData);
            } else {
                throw new Error("Invalid plan data format in JSON file.");
            }
        }

      } catch (error) {
        console.error("Import failed:", error);
        toast({
          variant: "destructive",
          title: "Import Failed",
          description: "The selected file is not valid. Please check the file format and try again.",
        });
      }
    };
    reader.readAsText(file);
    // Reset file input to allow re-uploading the same file
    if(event.target) {
        event.target.value = "";
    }
  };

  if (role === "player") {
    return (
      <div className="flex flex-col items-center gap-2">
        <input
          type="file"
          ref={planDataInputRef}
          className="hidden"
          accept="application/json"
          onChange={(e) => handleFileChange(e, 'plan')}
        />
        <Button variant="secondary" onClick={() => planDataInputRef.current?.click()}>
            <FileUp className="mr-2 h-4 w-4" /> Import Plan
        </Button>
        <Button variant="outline" onClick={handleExportPlayerData}>
            <Download className="mr-2 h-4 w-4" /> Export My Data
        </Button>
      </div>
    );
  }

  if (role === "coach") {
    return (
      <div className="flex flex-col items-center gap-2">
        <Button variant="secondary" onClick={handleExportPlanData}>
          <FileDown className="mr-2 h-4 w-4" /> Export Plan
        </Button>

        <input
          type="file"
          ref={playerDataInputRef}
          className="hidden"
          accept="application/json"
          onChange={(e) => handleFileChange(e, 'player')}
        />
        <Button variant="outline" onClick={() => playerDataInputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" /> Import Player Data
        </Button>

        {isViewingImportedData && (
          <Button variant="secondary" onClick={resetToLocalData}>
            <Undo2 className="mr-2 h-4 w-4" /> Reset to My Data
          </Button>
        )}
      </div>
    );
  }

  return null;
}
