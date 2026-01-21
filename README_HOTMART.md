# Guia de Configuração Hotmart & Vercel

## 1. Variáveis de Ambiente (Vercel)
Vá nas configurações do seu projeto na Vercel (**Settings > Environment Variables**) e adicione:

- `SUPABASE_URL`: (Sua URL do Supabase)
- `SUPABASE_SERVICE_ROLE_KEY`: (A chave secreta `service_role` -> **Cuidado!** Nunca use a `anon` key aqui, e nunca mostre essa chave no frontend). Encontre em: *Project Settings > API*.
- `HOTMART_WEBHOOK_SECRET`: (Uma senha que você vai inventar agora, ex: `minha_senha_super_secreta_123`)
- `APP_BASE_URL`: `https://precificamaster.com.br`

## 2. Configuração na Hotmart
1. Acesse sua conta Hotmart.
2. Vá em **Ferramentas > Webhook (API e Notificações)**.
3. Clique em **Cadastrar Webhook**.
4. **Nome da Configuração:** PrecificaMaster.
5. **URL para envio de dados:** `https://precificamaster.com.br/api/webhooks/hotmart`
   - *Nota:* Se for perguntado sobre Token/Assinatura, configure para enviar no cabeçalho `x-hotmart-hottok` com o valor `minha_senha_super_secreta_123` (o mesmo que você colocou na Vercel).
6. **Eventos:** Selecione `Compra Aprovada` (ou Purchase Approved).

## 3. Testando (Simulação)
Você pode simular uma compra usando o comando `curl` no terminal (ou Postman):

```bash
curl -X POST https://precificamaster.com.br/api/webhooks/hotmart \
  -H "Content-Type: application/json" \
  -H "x-hotmart-hottok: minha_senha_super_secreta_123" \
  -d '{
    "event": "PURCHASE_APPROVED",
    "data": {
      "buyer": {
        "email": "cliente.teste@exemplo.com",
        "name": "Cliente Teste"
      },
      "purchase": {
        "transaction": "HP12345678"
      }
    }
  }'
```

Se der certo, você receberá um JSON: `{"success": true, "message": "Tenant setup complete"}`.

## 4. Verificar no Supabase
Após o teste, vá no Supabase e verifique:
1. Tabela `hotmart_events`: O evento deve estar gravado lá.
2. Tabela `tenants`: Deve ter uma nova linha "Empresa de cliente.teste@exemplo.com".
3. Tabela `profiles`: Deve ter vinculado o novo usuário a essa empresa.
