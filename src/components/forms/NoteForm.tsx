
"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

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
import { Textarea } from "@/components/ui/textarea";
import { useAppContext } from "@/context/AppContext";
import { Note } from "@/lib/types";

const noteSchema = z.object({
  content: z.string().min(3, { message: "Note must be at least 3 characters." }),
});

const feedbackSchema = z.object({
    feedback: z.string().min(3, { message: "Feedback must be at least 3 characters." }),
});

interface NoteFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  date: string;
  note?: Note;
  exerciseId?: string;
  isFeedback?: boolean;
}

export default function NoteForm({ isOpen, setIsOpen, date, note, exerciseId, isFeedback }: NoteFormProps) {
  const { addNote, updateNote, addFeedback } = useAppContext();

  const form = useForm<z.infer<typeof noteSchema>>({
    resolver: zodResolver(noteSchema),
    defaultValues: { content: "" },
  });

  const feedbackForm = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { feedback: "" },
  });

  useEffect(() => {
    if (isOpen) {
        if(isFeedback && note) {
            feedbackForm.reset({ feedback: note.feedback || "" });
        } else {
            form.reset({ content: note?.content || "" });
        }
    }
  }, [note, isOpen, form, feedbackForm, isFeedback]);

  function onNoteSubmit(values: z.infer<typeof noteSchema>) {
    if (note) {
      updateNote(date, { ...note, ...values });
    } else {
      const newNote: Omit<Note, 'id' | 'feedback'> = { content: values.content };
      if (exerciseId) {
        newNote.exerciseId = exerciseId;
      }
      addNote(date, newNote);
    }
    setIsOpen(false);
  }

  function onFeedbackSubmit(values: z.infer<typeof feedbackSchema>) {
    if (note) {
        addFeedback(date, note.id, values.feedback);
    }
    setIsOpen(false);
  }

  if (isFeedback) {
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Feedback</DialogTitle>
              <DialogDescription>Provide feedback on the player's note.</DialogDescription>
            </DialogHeader>
            <Form {...feedbackForm}>
              <form onSubmit={feedbackForm.handleSubmit(onFeedbackSubmit)} className="space-y-4 py-4">
                <FormField
                  control={feedbackForm.control}
                  name="feedback"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Feedback</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., Great observation! Try focusing on..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Save Feedback</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{note ? "Edit Note" : "Add Note"}</DialogTitle>
          <DialogDescription>
            {note ? "Update your note." : "Add a new note for this day."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onNoteSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Felt a pinch in my shoulder..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">{note ? "Save Changes" : "Add Note"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
