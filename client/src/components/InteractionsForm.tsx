import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function InteractionsForm() {
  const [formData, setFormData] = useState({
    type: "comment" as "dm" | "comment",
    content: "",
    authorName: "",
    sentiment: "neutral" as "positive" | "neutral" | "negative",
    isResponded: false,
    responseTime: "",
    tags: "",
    category: "",
    isHighlight: false,
  });

  const createInteractionMutation = trpc.engagement.interactions.create.useMutation({
    onSuccess: () => {
      toast.success("Interação registrada com sucesso!");
      setFormData({
        type: "comment",
        content: "",
        authorName: "",
        sentiment: "neutral",
        isResponded: false,
        responseTime: "",
        tags: "",
        category: "",
        isHighlight: false,
      });
    },
    onError: (error) => {
      toast.error("Erro ao registrar interação: " + error.message);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked ? 1 : 0,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim()) {
      toast.error("Por favor, adicione o conteúdo da interação");
      return;
    }

    createInteractionMutation.mutate({
      type: formData.type,
      content: formData.content,
      authorName: formData.authorName || undefined,
      sentiment: formData.sentiment,
      isResponded: formData.isResponded ? 1 : 0,
      responseTime: formData.responseTime ? parseInt(formData.responseTime) : undefined,
      tags: formData.tags || undefined,
      category: formData.category || undefined,
      isHighlight: formData.isHighlight ? 1 : 0,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Interação (DM ou Comentário)</CardTitle>
        <CardDescription>Adicione DMs e comentários individuais para análise qualitativa</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dm">Mensagem Direta (DM)</SelectItem>
                  <SelectItem value="comment">Comentário</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sentiment">Sentimento</Label>
              <Select value={formData.sentiment} onValueChange={(value) => handleSelectChange("sentiment", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">Positivo 😊</SelectItem>
                  <SelectItem value="neutral">Neutro 😐</SelectItem>
                  <SelectItem value="negative">Negativo 😞</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Digite o conteúdo da mensagem ou comentário..."
              value={formData.content}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="authorName">Nome do Autor (opcional)</Label>
              <Input
                id="authorName"
                name="authorName"
                placeholder="Nome do usuário"
                value={formData.authorName}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="category">Categoria (opcional)</Label>
              <Input
                id="category"
                name="category"
                placeholder="Ex: Dúvida sobre preço"
                value={formData.category}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tags">Tags (opcional)</Label>
              <Input
                id="tags"
                name="tags"
                placeholder="Ex: produto, entrega, atendimento"
                value={formData.tags}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="responseTime">Tempo de Resposta (min)</Label>
              <Input
                id="responseTime"
                name="responseTime"
                type="number"
                placeholder="0"
                value={formData.responseTime}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isResponded"
                checked={formData.isResponded}
                onCheckedChange={(checked) => handleCheckboxChange("isResponded", checked as boolean)}
              />
              <Label htmlFor="isResponded" className="font-normal cursor-pointer">
                Já foi respondida?
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isHighlight"
                checked={formData.isHighlight}
                onCheckedChange={(checked) => handleCheckboxChange("isHighlight", checked as boolean)}
              />
              <Label htmlFor="isHighlight" className="font-normal cursor-pointer">
                Marcar como destaque?
              </Label>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={createInteractionMutation.isPending}>
            {createInteractionMutation.isPending ? "Registrando..." : "Registrar Interação"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
