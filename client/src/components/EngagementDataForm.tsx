import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function EngagementDataForm() {
  const [formData, setFormData] = useState({
    period: new Date().toISOString().slice(0, 7),
    dmsReceived: "",
    dmsResponded: "",
    commentsReceived: "",
    commentsResponded: "",
    avgResponseTime: "",
    saves: "",
    shares: "",
  });

  const createDataMutation = trpc.engagement.data.create.useMutation({
    onSuccess: () => {
      toast.success("Dados de engajamento salvos com sucesso!");
      setFormData({
        period: new Date().toISOString().slice(0, 7),
        dmsReceived: "",
        dmsResponded: "",
        commentsReceived: "",
        commentsResponded: "",
        avgResponseTime: "",
        saves: "",
        shares: "",
      });
    },
    onError: (error) => {
      toast.error("Erro ao salvar dados: " + error.message);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDataMutation.mutate({
      period: formData.period,
      dmsReceived: formData.dmsReceived ? parseInt(formData.dmsReceived) : undefined,
      dmsResponded: formData.dmsResponded ? parseInt(formData.dmsResponded) : undefined,
      commentsReceived: formData.commentsReceived ? parseInt(formData.commentsReceived) : undefined,
      commentsResponded: formData.commentsResponded ? parseInt(formData.commentsResponded) : undefined,
      avgResponseTime: formData.avgResponseTime ? parseInt(formData.avgResponseTime) : undefined,
      saves: formData.saves ? parseInt(formData.saves) : undefined,
      shares: formData.shares ? parseInt(formData.shares) : undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Dados de Engajamento</CardTitle>
        <CardDescription>Adicione dados quantitativos de DMs e comentários</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="period">Período (YYYY-MM)</Label>
            <Input
              id="period"
              name="period"
              type="month"
              value={formData.period}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dmsReceived">DMs Recebidas</Label>
              <Input
                id="dmsReceived"
                name="dmsReceived"
                type="number"
                placeholder="0"
                value={formData.dmsReceived}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="dmsResponded">DMs Respondidas</Label>
              <Input
                id="dmsResponded"
                name="dmsResponded"
                type="number"
                placeholder="0"
                value={formData.dmsResponded}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="commentsReceived">Comentários Recebidos</Label>
              <Input
                id="commentsReceived"
                name="commentsReceived"
                type="number"
                placeholder="0"
                value={formData.commentsReceived}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="commentsResponded">Comentários Respondidos</Label>
              <Input
                id="commentsResponded"
                name="commentsResponded"
                type="number"
                placeholder="0"
                value={formData.commentsResponded}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="avgResponseTime">Tempo Médio de Resposta (min)</Label>
              <Input
                id="avgResponseTime"
                name="avgResponseTime"
                type="number"
                placeholder="0"
                value={formData.avgResponseTime}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="saves">Salvamentos</Label>
              <Input
                id="saves"
                name="saves"
                type="number"
                placeholder="0"
                value={formData.saves}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="shares">Compartilhamentos</Label>
            <Input
              id="shares"
              name="shares"
              type="number"
              placeholder="0"
              value={formData.shares}
              onChange={handleChange}
            />
          </div>

          <Button type="submit" className="w-full" disabled={createDataMutation.isPending}>
            {createDataMutation.isPending ? "Salvando..." : "Salvar Dados"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
