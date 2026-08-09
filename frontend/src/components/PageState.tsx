import { AlertCircle, LoaderCircle } from "lucide-react";

export function LoadingState({ label = "Unearthing projects…" }: { label?: string }) {
  return <div className="page-state"><LoaderCircle className="spin" size={24} /><p>{label}</p></div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="page-state error-state">
      <AlertCircle size={24} />
      <p>{message}</p>
      {onRetry && <button className="button button-secondary" onClick={onRetry}>Try again</button>}
    </div>
  );
}

