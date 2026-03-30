import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { trpc } from "@/lib/trpc";
import { Users, MessageSquare, Heart, Share2, TrendingUp } from "lucide-react";
import MetricsForm from "@/components/MetricsForm";
import InteractionsForm from "@/components/InteractionsForm";
import EngagementDataForm from "@/components/EngagementDataForm";
import ExportReport from "@/components/ExportReport";

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899"];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Queries
  const metricsQuery = trpc.engagement.metrics.list.useQuery({ period: undefined });
  const interactionsQuery = trpc.engagement.interactions.list.useQuery({ type: undefined });
  const engagementDataQuery = trpc.engagement.data.list.useQuery({ period: undefined });
  const sentimentQuery = trpc.engagement.analytics.sentiment.useQuery();
  const statsQuery = trpc.engagement.analytics.stats.useQuery();
  const categoriesQuery = trpc.engagement.categories.list.useQuery();
  const faqsQuery = trpc.engagement.faqs.list.useQuery();

  const metrics = metricsQuery.data?.[0];
  const sentiment = sentimentQuery.data;
  const stats = statsQuery.data;
  const engagementData = engagementDataQuery.data?.[0];

  // Prepare sentiment data for chart
  const sentimentData = sentiment
    ? [
        { name: "Positivo", value: sentiment.positive },
        { name: "Neutro", value: sentiment.neutral },
        { name: "Negativo", value: sentiment.negative },
      ]
    : [];

  // Prepare interaction highlights
  const highlights = interactionsQuery.data?.filter((i) => i.isHighlight === 1) || [];
  const positiveComments = highlights.filter((i) => i.sentiment === "positive");
  const negativeComments = highlights.filter((i) => i.sentiment === "negative");

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard de Engajamento Instagram</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Monitore suas métricas de engajamento em tempo real</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="quantitative">Quantitativo</TabsTrigger>
              <TabsTrigger value="qualitative">Qualitativo</TabsTrigger>
              <TabsTrigger value="sentiment">Sentimento</TabsTrigger>
              <TabsTrigger value="input">Entrada de Dados</TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Seguidores
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics?.followers?.toLocaleString() || "0"}</div>
                    <p className="text-xs text-green-600 mt-1">
                      +{metrics?.followerGrowth?.toLocaleString() || "0"} este período
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Alcance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics?.totalReach?.toLocaleString() || "0"}</div>
                    <p className="text-xs text-gray-500 mt-1">Contas únicas alcançadas</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Impressões
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics?.totalImpressions?.toLocaleString() || "0"}</div>
                    <p className="text-xs text-gray-500 mt-1">Total de visualizações</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      Taxa de Engajamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics?.engagementRate || "0%"}</div>
                    <p className="text-xs text-gray-500 mt-1">Engajamento médio</p>
                  </CardContent>
                </Card>
              </div>

              {/* Sentiment Overview */}
              {sentimentData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Análise de Sentimento Geral</CardTitle>
                    <CardDescription>Distribuição de sentimentos nos comentários</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={sentimentData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {sentimentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* QUANTITATIVE TAB */}
            <TabsContent value="quantitative" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Mensagens Diretas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Recebidas</p>
                      <p className="text-3xl font-bold">{engagementData?.dmsReceived || "0"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Respondidas</p>
                      <p className="text-3xl font-bold text-green-600">{engagementData?.dmsResponded || "0"}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      Comentários
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Recebidos</p>
                      <p className="text-3xl font-bold">{engagementData?.commentsReceived || "0"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Respondidos</p>
                      <p className="text-3xl font-bold text-green-600">{engagementData?.commentsResponded || "0"}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tempo Médio de Resposta</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{engagementData?.avgResponseTime || "0"} min</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Tempo médio para responder</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Share2 className="w-4 h-4" />
                      Interações
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Salvamentos</p>
                      <p className="text-2xl font-bold">{engagementData?.saves || "0"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Compartilhamentos</p>
                      <p className="text-2xl font-bold">{engagementData?.shares || "0"}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Interaction Stats */}
              {stats && (
                <Card>
                  <CardHeader>
                    <CardTitle>Estatísticas de Interação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">DMs</p>
                        <p className="text-2xl font-bold">{stats.dms}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Comentários</p>
                        <p className="text-2xl font-bold">{stats.comments}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Respondidas</p>
                        <p className="text-2xl font-bold text-green-600">{stats.responded}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Não Respondidas</p>
                        <p className="text-2xl font-bold text-red-600">{stats.notResponded}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* QUALITATIVE TAB */}
            <TabsContent value="qualitative" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dúvidas Frequentes (FAQ)</CardTitle>
                  <CardDescription>Principais perguntas dos seus seguidores</CardDescription>
                </CardHeader>
                <CardContent>
                  {faqsQuery.data && faqsQuery.data.length > 0 ? (
                    <div className="space-y-3">
                      {faqsQuery.data.map((faq) => (
                        <div key={faq.id} className="border-l-4 border-blue-500 pl-4 py-2">
                          <p className="font-medium text-gray-900 dark:text-white">{faq.question}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Frequência: {faq.frequency} vezes
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Nenhuma FAQ registrada ainda</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Categorias de Temas</CardTitle>
                </CardHeader>
                <CardContent>
                  {categoriesQuery.data && categoriesQuery.data.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {categoriesQuery.data.map((cat) => (
                        <div
                          key={cat.id}
                          className="p-3 rounded-lg border"
                          style={{ borderLeftColor: cat.color || "#3b82f6", borderLeftWidth: "4px" }}
                        >
                          <p className="font-medium">{cat.name}</p>
                          {cat.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{cat.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Nenhuma categoria criada ainda</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* SENTIMENT TAB */}
            <TabsContent value="sentiment" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Comentários Positivos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-600">{sentiment?.positive || "0"}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Comentários Neutros</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-gray-600">{sentiment?.neutral || "0"}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Comentários Negativos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-red-600">{sentiment?.negative || "0"}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Positive Comments */}
              {positiveComments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600">Elogios e Comentários Positivos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {positiveComments.map((comment) => (
                      <div key={comment.id} className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-sm text-gray-900 dark:text-white">{comment.content}</p>
                        {comment.authorName && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Por: {comment.authorName}</p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Negative Comments */}
              {negativeComments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">Críticas e Comentários Negativos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {negativeComments.map((comment) => (
                      <div key={comment.id} className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="text-sm text-gray-900 dark:text-white">{comment.content}</p>
                        {comment.authorName && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Por: {comment.authorName}</p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* INPUT TAB */}
            <TabsContent value="input" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MetricsForm />
                <EngagementDataForm />
              </div>
              <InteractionsForm />
              <ExportReport />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
