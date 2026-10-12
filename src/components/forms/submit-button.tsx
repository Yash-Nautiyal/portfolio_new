import { Spinner } from "@/components/ui/spinner";

export function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-w-36 items-center justify-center rounded-full bg-(--ink) px-6 py-3 text-sm font-medium text-(--paper) transition-opacity hover:opacity-85 disabled:opacity-70"
    >
      {pending ? <Spinner /> : "Send message"}
    </button>
  );
}
