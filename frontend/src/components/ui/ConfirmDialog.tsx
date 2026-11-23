import { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { ApiError } from "@/lib/api";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  destructive = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant={destructive ? "danger" : "primary"}
            onClick={handleConfirm}
            isLoading={busy}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-[13px] text-muted">{message}</p>
      {error && <p className="mt-2 text-[12px] text-danger">{error}</p>}
    </Modal>
  );
}
