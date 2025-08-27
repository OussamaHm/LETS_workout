
"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { useEffect } from "react";
import Image from "next/image";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAppContext } from "@/context/AppContext";
import { Exercise, Log } from "@/lib/types";
import { cn } from "@/lib/utils";

const logSchema = z.object({
  weights: z.array(z.coerce.number().min(0, { message: "Weight cannot be negative." })),
});

interface LogFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  date: Date;
  exercise: Exercise;
  log?: Log;
}

export default function LogForm({ isOpen, setIsOpen, date, exercise, log }: LogFormProps) {
  const { addLog } = useAppContext();
  const dateString = format(date, "yyyy-MM-dd");

  const form = useForm<z.infer<typeof logSchema>>({
    resolver: zodResolver(logSchema),
    defaultValues: {
      weights: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "weights"
  });

  useEffect(() => {
    if (isOpen) {
      // If there's an existing log, use its weights.
      // Otherwise, create an array based on the exercise's target sets.
      const defaultWeights = log?.weights || Array(exercise.targetSets).fill(exercise.targetWeight ?? 0);
      form.reset({ weights: defaultWeights });
    }
  }, [log, exercise, isOpen, form]);


  function onSubmit(values: z.infer<typeof logSchema>) {
    // Create a snapshot of the exercise details at the time of logging
    const logData: Omit<Log, 'id'> = {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        targetSets: exercise.targetSets,
        targetReps: exercise.targetReps,
        targetWeight: exercise.targetWeight,
        actualSets: values.weights.length,
        actualReps: exercise.targetReps, // Assuming reps are constant as per plan
        weights: values.weights,
    }

    addLog(dateString, logData);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className={cn("sm:max-w-md", exercise.imageUrl && "sm:max-w-lg")}>
        <DialogHeader>
          <DialogTitle>{log ? "Edit Log" : "Log Performance"}</DialogTitle>
          <DialogDescription>Log your weight for each set of {exercise.name}.</DialogDescription>
        </DialogHeader>

        {exercise.imageUrl && exercise.imageUrl.match(/\.(jpeg|jpg|gif|png)$/) != null && (
            <div className="relative w-full h-48">
                 <Image data-ai-hint="exercise fitness" src={exercise.imageUrl} alt={exercise.name} fill className="rounded-md object-cover"/>
            </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
                {fields.map((field, index) => (
                    <FormField
                    key={field.id}
                    control={form.control}
                    name={`weights.${index}`}
                    render={({ field }) => (
                        <FormItem className="flex items-center gap-4 space-y-0">
                            <FormLabel className="w-16">Set {index + 1}</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.5" {...field} className="flex-1" />
                            </FormControl>
                            <span className="text-sm text-muted-foreground">kg</span>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                ))}
            </div>
             <div className="flex justify-between gap-2">
                <Button type="button" variant="outline" onClick={() => append(exercise.targetWeight ?? 0)}>Add Set</Button>
                <Button type="button" variant="destructive" onClick={() => remove(fields.length - 1)} disabled={fields.length === 0}>Remove Set</Button>
            </div>
            <DialogFooter>
              <Button type="submit">{log ? "Save Changes" : "Log"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
