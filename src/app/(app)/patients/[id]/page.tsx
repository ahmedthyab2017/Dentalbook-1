"use client";

import { use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { DantalPage } from "@/components/layout/DantalPage";
import { useDbStore } from "@/stores/useDbStore";
import { DantalProfileHeader } from "@/components/patients/DantalProfileHeader";
import { ProfileTabs } from "@/components/patients/ProfileTabs";
import { InfoTab } from "@/components/patients/tabs/InfoTab";
import { PlansTab } from "@/components/patients/tabs/PlansTab";
import { AppointmentsTab } from "@/components/patients/tabs/AppointmentsTab";
import { RxTab } from "@/components/patients/tabs/RxTab";
import { PaymentsTab } from "@/components/patients/tabs/PaymentsTab";
import { ChartTab } from "@/components/patients/tabs/ChartTab";
import { PortalTab } from "@/components/patients/tabs/PortalTab";
import { AuditTab } from "@/components/patients/tabs/AuditTab";

export default function PatientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const patient = useDbStore((s) => s.db.patients.find((p) => p.id === id));

  const tab = searchParams.get("tab") || "info";

  useEffect(() => {
    if (!patient) router.replace("/patients");
  }, [patient, router]);

  if (!patient) return null;

  function setTab(next: string) {
    router.push(`/patients/${id}?tab=${next}`);
  }

  return (
    <DantalPage title={patient.name}>
        <DantalProfileHeader patient={patient} />
        <ProfileTabs active={tab} onChange={setTab} />
        <div className="legacy-ui">
          {tab === "info" && <InfoTab patient={patient} />}
          {tab === "plans" && <PlansTab patient={patient} />}
          {tab === "appts" && <AppointmentsTab patient={patient} />}
          {tab === "rx" && <RxTab patient={patient} />}
          {tab === "pays" && <PaymentsTab patient={patient} />}
          {tab === "chart" && <ChartTab patient={patient} />}
          {tab === "portal" && <PortalTab ptId={patient.id} ptName={patient.name} />}
          {tab === "audit" && <AuditTab patient={patient} />}
        </div>
      </DantalPage>
  );
}
