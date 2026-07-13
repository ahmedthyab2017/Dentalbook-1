import { Card, CardHeader, CardTitle, CardBody } from "@/components/ds";
import { cn } from "@/lib/cn";

export function DantalSettingsSection({
  title,
  children,
  className,
  danger,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  danger?: boolean;
}) {
  return (
    <Card className={cn("mb-6", className)}>
      <CardHeader>
        <CardTitle className={cn(danger && "text-danger")}>{title}</CardTitle>
      </CardHeader>
      <CardBody className="space-y-4">{children}</CardBody>
    </Card>
  );
}
