export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate min-h-screen w-full overflow-x-hidden bg-background">
      {children}
    </div>
  );
}
