"use client";

import { useState, useCallback, createContext, useContext, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
}

interface AlertOptions {
  title: string;
  description: string;
  closeLabel?: string;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: AlertOptions) => Promise<void>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    open: boolean;
    options: (ConfirmOptions & { mode: "confirm" }) | (AlertOptions & { mode: "alert" });
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ open: true, options: { ...options, mode: "confirm" }, resolve });
    });
  }, []);

  const alert = useCallback((options: AlertOptions): Promise<void> => {
    return new Promise((resolve) => {
      setState({
        open: true,
        options: { ...options, mode: "alert" },
        resolve: () => resolve(),
      });
    });
  }, []);

  const handleClose = (confirmed: boolean) => {
    state?.resolve(confirmed);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm, alert }}>
      {children}
      <Dialog
        open={state?.open ?? false}
        onOpenChange={(open) => { if (!open) handleClose(false); }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{state?.options.title}</DialogTitle>
            <DialogDescription className="whitespace-pre-wrap">
              {state?.options.description}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            {state?.options.mode === "confirm" ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleClose(false)}
                >
                  {(state.options as ConfirmOptions).cancelLabel ?? "Cancel"}
                </Button>
                <Button
                  variant={(state.options as ConfirmOptions).variant ?? "default"}
                  size="sm"
                  onClick={() => handleClose(true)}
                >
                  {(state.options as ConfirmOptions).confirmLabel ?? "Confirm"}
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => handleClose(true)}
              >
                {(state?.options as AlertOptions).closeLabel ?? "OK"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
}
