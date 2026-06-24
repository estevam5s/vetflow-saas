"use client"

import { CrudPage } from "@/components/crud-page"

export default function PetsPage() {
  return (
    <CrudPage
      type="pets"
      title="Pets"
      subtitle="Pacientes da clínica e seus dados clínicos."
      emptyText="Nenhum pet cadastrado ainda."
      selectSources={{ owner_id: "owners" }}
      fields={[
        { key: "name", label: "Nome", required: true, placeholder: "Rex" },
        { key: "owner_id", label: "Tutor", type: "select" },
        { key: "species", label: "Espécie", type: "select", options: [
          { value: "Cão", label: "Cão" }, { value: "Gato", label: "Gato" }, { value: "Ave", label: "Ave" }, { value: "Roedor", label: "Roedor" }, { value: "Outro", label: "Outro" },
        ] },
        { key: "breed", label: "Raça", placeholder: "SRD" },
        { key: "sex", label: "Sexo", type: "select", options: [{ value: "M", label: "Macho" }, { value: "F", label: "Fêmea" }] },
        { key: "birth_date", label: "Nascimento", type: "date" },
        { key: "weight", label: "Peso (kg)", type: "number" },
        { key: "notes", label: "Observações", type: "textarea" },
      ]}
      columns={[
        { key: "name", label: "Nome" },
        { key: "species", label: "Espécie" },
        { key: "breed", label: "Raça" },
        { key: "owner_name", label: "Tutor" },
      ]}
    />
  )
}
