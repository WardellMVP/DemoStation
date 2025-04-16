import { ScriptDetailView } from "@/components/scripts/script-detail";
import { useParams } from "wouter";

export default function ScriptDetail() {
  const { id } = useParams();
  
  if (!id) {
    return <div>Invalid script ID</div>;
  }
  
  return <ScriptDetailView id={id} />;
}
