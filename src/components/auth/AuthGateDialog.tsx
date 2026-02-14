import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Save, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface AuthGateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
}

export function AuthGateDialog({ open, onOpenChange, message }: AuthGateDialogProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader className="items-center space-y-4">
          <div className="h-14 w-14 rounded-xl gradient-primary flex items-center justify-center mx-auto">
            <Save className="h-7 w-7 text-primary-foreground" />
          </div>
          <DialogTitle className="text-xl">
            Create an account to save your work
          </DialogTitle>
          <DialogDescription className="text-base">
            {message || "You're exploring Focus in demo mode. Sign up to save your notes, classes, and progress — it's free!"}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-4">
          <Button
            variant="glow"
            size="lg"
            onClick={() => {
              onOpenChange(false);
              navigate('/auth?signup=true');
            }}
            className="group"
          >
            Create Free Account
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              onOpenChange(false);
              navigate('/auth');
            }}
          >
            I already have an account
          </Button>
          <button
            onClick={() => onOpenChange(false)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors pt-1"
          >
            Continue exploring
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
