import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function MetricsForm() {
  const [formData, setFormData] = useState({
    period: new Date().toISOString().slice(0, 7),
    followers: "",
    followerGrowth: "",
    totalReach: "",
    totalImpressions: "",
    engagementRate: "",
  });

  const createMetricsMutation = trpc.engagement.metrics.create.useMutation({
    onSuccess: () => {
      toast.success("Métricas salvas com sucesso!");
      setFormData({
        period: new Date().toISOString().slice(0, 7),
        followers: "",
        followerGrowth: "",
        totalReach: "",
        totalImpressions: "",
        engagementRate: "",
      });
    },
    onError: (error) => {
      toast.error("Erro ao salvar métricas: " + error.message);
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
    createMetricsMutation.mutate({
      period: formData.period,
      followers: formData.followers ? parseInt(formData.followers) : undefined,
      followerGrowth: formData.followerGrowth ? parseInt(formData.followerGrowth) : undefined,
      totalReach: formData.totalReach ? parseInt(formData.totalReach) : undefined,
      totalImpressions: formData.totalImpressions ? parseInt(formData.totalImpressions) : undefined,
      engagementRate: formData.engagementRate || undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Métricas Principais</CardTitle>
        <CardDescription>Adicione as métricas de visão geral do período</CardDescription>
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
              <Label htmlFor="followers">Seguidores</Label>
              <Input
                id="followers"
                name="followers"
                type="number"
                placeholder="0"
                value={formData.followers}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="followerGrowth">Crescimento</Label>
              <Input
                id="followerGrowth"
                name="followerGrowth"
                type="number"
                placeholder="0"
                value={formData.followerGrowth}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="totalReach">Alcance Total</Label>
              <Input
                id="totalReach"
                name="totalReach"
                type="number"
                placeholder="0"
                value={formData.totalReach}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="totalImpressions">Impressões</Label>
              <Input
                id="totalImpressions"
                name="totalImpressions"
                type="number"
                placeholder="0"
                value={formData.totalImpressions}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="engagementRate">Taxa de Engajamento (%)</Label>
            <Input
              id="engagementRate"
              name="engagementRate"
              placeholder="3.5%"
              value={formData.engagementRate}
              onChange={handleChange}
            />
          </div>

          <Button type="submit" className="w-full" disabled={createMetricsMutation.isPending}>
            {createMetricsMutation.isPending ? "Salvando..." : "Salvar Métricas"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
