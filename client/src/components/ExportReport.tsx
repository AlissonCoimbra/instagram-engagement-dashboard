import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function ExportReport() {
  const metricsQuery = trpc.engagement.metrics.list.useQuery({ period: undefined });
  const engagementDataQuery = trpc.engagement.data.list.useQuery({ period: undefined });
  const interactionsQuery = trpc.engagement.interactions.list.useQuery({ type: undefined });
  const sentimentQuery = trpc.engagement.analytics.sentiment.useQuery();

  const handleExportCSV = () => {
    try {
      const metrics = metricsQuery.data || [];
      const data = engagementDataQuery.data || [];
      const interactions = interactionsQuery.data || [];

      let csv = "RELATÓRIO DE ENGAJAMENTO INSTAGRAM\n\n";

      // Métricas
      csv += "MÉTRICAS PRINCIPAIS\n";
      csv += "Período,Seguidores,Crescimento,Alcance,Impressões,Taxa de Engajamento\n";
      metrics.forEach((m) => {
        csv += `${m.period},${m.followers},${m.followerGrowth},${m.totalReach},${m.totalImpressions},${m.engagementRate}\n`;
      });

      csv += "\n\nDADOS DE ENGAJAMENTO\n";
      csv += "Período,DMs Recebidas,DMs Respondidas,Comentários Recebidos,Comentários Respondidos,Tempo Médio Resposta,Salvamentos,Compartilhamentos\n";
      data.forEach((d) => {
        csv += `${d.period},${d.dmsReceived},${d.dmsResponded},${d.commentsReceived},${d.commentsResponded},${d.avgResponseTime},${d.saves},${d.shares}\n`;
      });

      csv += "\n\nINTERAÇÕES REGISTRADAS\n";
      csv += "Tipo,Sentimento,Respondida,Tempo Resposta,Conteúdo\n";
      interactions.forEach((i) => {
        const content = (i.content || "").replace(/,/g, ";").replace(/\n/g, " ");
        csv += `${i.type},${i.sentiment},${i.isResponded ? "Sim" : "Não"},${i.responseTime || "N/A"},"${content}"\n`;
      });

      // Download
      const element = document.createElement("a");
      element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csv));
      element.setAttribute("download", `relatorio_engajamento_${new Date().toISOString().slice(0, 10)}.csv`);
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      toast.success("Relatório exportado em CSV com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar relatório: " + (error as Error).message);
    }
  };

  const handleExportJSON = () => {
    try {
      const metrics = metricsQuery.data || [];
      const data = engagementDataQuery.data || [];
      const interactions = interactionsQuery.data || [];
      const sentiment = sentimentQuery.data;

      const report = {
        exportedAt: new Date().toISOString(),
        metrics,
        engagementData: data,
        interactions,
        sentiment,
        summary: {
          totalMetrics: metrics.length,
          totalInteractions: interactions.length,
          totalDMs: interactions.filter((i) => i.type === "dm").length,
          totalComments: interactions.filter((i) => i.type === "comment").length,
          positiveComments: sentiment?.positive || 0,
          negativeComments: sentiment?.negative || 0,
          neutralComments: sentiment?.neutral || 0,
        },
      };

      const element = document.createElement("a");
      element.setAttribute("href", "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2)));
      element.setAttribute("download", `relatorio_engajamento_${new Date().toISOString().slice(0, 10)}.json`);
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      toast.success("Relatório exportado em JSON com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar relatório: " + (error as Error).message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Exportar Relatório
        </CardTitle>
        <CardDescription>Baixe seus dados de engajamento em diferentes formatos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={handleExportCSV} variant="outline" className="w-full justify-start">
          <FileText className="w-4 h-4 mr-2" />
          Exportar como CSV
        </Button>
        <Button onClick={handleExportJSON} variant="outline" className="w-full justify-start">
          <FileText className="w-4 h-4 mr-2" />
          Exportar como JSON
        </Button>
      </CardContent>
    </Card>
  );
}
