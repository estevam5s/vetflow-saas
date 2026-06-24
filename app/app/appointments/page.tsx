"use client"

import { CrudPage } from "@/components/crud-page"

export default function AppointmentsPage() {
  return (
    <CrudPage
      type="appointments"
      title="Agenda"
      subtitle="Consultas agendadas da clínica."
      emptyText="Nenhuma consulta agendada ainda."
      selectSources={{ pet_id: "pets" }}
      fields={[
        { key: "pet_id", label: "Pet", type: "select", required: true },
        { key: "scheduled_at", label: "Data e hora", type: "datetime-local", required: true },
        { key: "status", label: "Status", type: "select", options: [
          { value: "agendada", label: "Agendada" }, { value: "confirmada", label: "Confirmada" }, { value: "concluida", label: "Concluída" }, { value: "cancelada", label: "Cancelada" },
        ] },
        { key: "reason", label: "Motivo", full: true, placeholder: "Consulta de rotina, vacina…" },
        { key: "notes", label: "Observações", type: "textarea" },
      ]}
      columns={[
        { key: "pet_name", label: "Pet" },
        { key: "scheduled_at", label: "Quando", render: (r) => r.scheduled_at ? new Date(r.scheduled_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—" },
        { key: "reason", label: "Motivo" },
        { key: "status", label: "Status", render: (r) => <span className="capitalize">{r.status}</span> },
      ]}
    />
  )
}
