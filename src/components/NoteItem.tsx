
"use client";

import { useState } from "react";
import { Edit, Trash2, MessageSquareReply, Link } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import NoteForm from "./forms/NoteForm";
import { Note } from "@/lib/types";

interface NoteItemProps {
  date: string;
  note: Note;
}

export default function NoteItem({ date, note }: NoteItemProps) {
  const { role, deleteNote, getExerciseById } = useAppContext();
  const [isNoteFormOpen, setNoteFormOpen] = useState(false);
  const [isFeedbackFormOpen, setFeedbackFormOpen] = useState(false);

  const linkedExercise = note.exerciseId ? getExerciseById(note.exerciseId) : null;

  return (
    <li className="rounded-lg border bg-card p-3 text-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
            <p className="whitespace-pre-wrap">{note.content}</p>
            {linkedExercise && (
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Link className="h-3 w-3" /> 
                    <span>Linked to: {linkedExercise.name}</span>
                </div>
            )}
        </div>
        <div className="flex items-center gap-1">
          {role === "player" && (
            <>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setNoteFormOpen(true)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteNote(date, note.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </>
          )}
          {role === 'coach' && (
             <>
                {!note.feedback && (
                     <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setFeedbackFormOpen(true)}>
                        <MessageSquareReply className="h-4 w-4 text-primary" />
                    </Button>
                )}
                 <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteNote(date, note.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
             </>
          )}
        </div>
      </div>
      {note.feedback && (
        <div className="mt-2 rounded-md border border-dashed border-accent bg-accent/10 p-2">
            <p className="font-semibold text-accent">Coach's Feedback:</p>
            <p className="text-muted-foreground whitespace-pre-wrap">{note.feedback}</p>
        </div>
      )}
      
      <NoteForm
        isOpen={isNoteFormOpen}
        setIsOpen={setNoteFormOpen}
        date={date}
        note={note}
      />
      <NoteForm
        isOpen={isFeedbackFormOpen}
        setIsOpen={setFeedbackFormOpen}
        date={date}
        note={note}
        isFeedback
      />
    </li>
  );
}
