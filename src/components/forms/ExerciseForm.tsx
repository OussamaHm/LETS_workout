
"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Image from "next/image";

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
import { useEffect } from "react";
import { cn } from "@/lib/utils";

const exerciseSchema = z.object({
  name: z.string().min(2, { message: "Exercise name must be at least 2 characters." }),
  targetSets: z.coerce.number().min(1, { message: "Sets must be at least 1." }),
  targetReps: z.coerce.number().min(1, { message: "Reps must be at least 1." }),
  targetWeight: z.coerce.number().min(0, { message: "Weight cannot be negative." }).optional(),
  imageUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

interface ExerciseFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  dayOfWeek?: number; // Day to assign to if creating a new exercise
  exercise?: Exercise; // Existing exercise to edit
  log?: Log;
}

export default function ExerciseForm({ isOpen, setIsOpen, dayOfWeek, exercise, log }: ExerciseFormProps) {
  const { addExercise, updateExercise, assignExerciseToDay } = useAppContext();
  const form = useForm<z.infer<typeof exerciseSchema>>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: "",
      targetSets: 3,
      targetReps: 10,
      targetWeight: 0,
      imageUrl: "",
    },
  });
  
  useEffect(() => {
    if (exercise) {
      form.reset(exercise);
    } else {
      form.reset({
        name: "",
        targetSets: 3,
        targetReps: 10,
        targetWeight: 0,
        imageUrl: "",
      });
    }
  }, [exercise, isOpen, form]);


  function onSubmit(values: z.infer<typeof exerciseSchema>) {
    if (exercise) {
      // Editing an existing exercise definition
      updateExercise({ ...exercise, ...values });
    } else {
      // Creating a new exercise definition and assigning it to the current day
      const newExercise = addExercise(values);
      if(dayOfWeek !== undefined) {
          assignExerciseToDay(newExercise.id, dayOfWeek);
      }
    }
    setIsOpen(false);
  }

  const imageUrl = form.watch("imageUrl");

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className={cn("sm:max-w-[425px]", imageUrl && "sm:max-w-md")}>
        <DialogHeader>
          <DialogTitle>{exercise ? "Edit Exercise" : "Add Exercise"}</DialogTitle>
          <DialogDescription>
            {exercise ? "Update the definition for this exercise. This will not affect past logs." : "Add a new exercise to the library. It will be assigned to this day."}
          </DialogDescription>
        </DialogHeader>

        {imageUrl && imageUrl.match(/\.(jpeg|jpg|gif|png)$/) != null && (
            <div className="relative w-full h-48">
                 <Image data-ai-hint="exercise fitness" src={imageUrl} alt="Exercise image" fill className="rounded-md object-cover"/>
            </div>
        )}

        {log && (
          <div className="rounded-lg border bg-muted p-3 text-sm">
            <h4 className="font-semibold mb-1">Player's Log for Today</h4>
            <p>
              Logged: {log.actualSets} sets of {log.actualReps} reps
            </p>
             {log.weights.length > 0 && (
                <p className="text-xs">Weights: {log.weights.join("kg, ")}kg</p>
            )}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exercise Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Bench Press" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/exercise.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="targetSets"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sets</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetReps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reps</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
             <FormField
              control={form.control}
              name="targetWeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Weight (kg, Optional)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">{exercise ? "Save Changes" : "Add Exercise"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
