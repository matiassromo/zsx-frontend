'use client';

import InfoBar from "@/app/components/InfoBar";
import { CreateButton } from "../components/CreateButton";

export default function ClientesPage() {
  return (
    <div>
      <InfoBar title="Clientes" />
      <CreateButton label="Agregar cliente" onClick={()=>{}}></CreateButton>
    </div>
  );
}
