"use client"

import { CrudPage } from "@/components/crud-page"

export default function OwnersPage() {
  return (
    <CrudPage
      type="owners"
      title="Tutores"
      subtitle="Cadastro de tutores (responsáveis pelos pets)."
      emptyText="Nenhum tutor cadastrado ainda."
      fields={[
        { key: "name", label: "Nome", required: true, placeholder: "Maria Silva" },
        { key: "phone", label: "Telefone", type: "tel", placeholder: "(11) 90000-0000" },
        { key: "email", label: "E-mail", type: "email", placeholder: "maria@email.com" },
        { key: "cpf", label: "CPF", placeholder: "000.000.000-00" },
        { key: "address", label: "Endereço", full: true },
        { key: "notes", label: "Observações", type: "textarea" },
      ]}
      columns={[
        { key: "name", label: "Nome" },
        { key: "phone", label: "Telefone" },
        { key: "email", label: "E-mail" },
      ]}
    />
  )
}
