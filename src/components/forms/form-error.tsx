export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-[#b3261e] dark:text-[#f2b8b5]" role="alert">
      {message}
    </p>;
}
