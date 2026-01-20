-- Habilitar a extensão pgcrypto para gerar UUIDs (se necessário, mas o Prisma costuma gerar no client)
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela: Insumo (Materials)
CREATE TABLE "Insumo" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "unitCost" DECIMAL(65,30) NOT NULL,
    "lossPct" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "yieldNotes" TEXT,
    "supplier" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Insumo_pkey" PRIMARY KEY ("id")
);

-- Tabela: Produto (Products)
CREATE TABLE "Produto" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'UN',
    "description" TEXT,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);

-- Tabela: BOMItem (Bill of Materials - Receita)
CREATE TABLE "BOMItem" (
    "id" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "insumoId" TEXT NOT NULL,
    "qtyPerUnit" DECIMAL(65,30) NOT NULL,
    "appliesTo" TEXT NOT NULL, -- 'PRODUCT' ou 'PACKAGING'
    "notes" TEXT,

    CONSTRAINT "BOMItem_pkey" PRIMARY KEY ("id")
);

-- Tabela: ProcessoEtapa (Process Layout/Labor)
CREATE TABLE "ProcessoEtapa" (
    "id" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "setupMinutes" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "unitMinutes" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "laborRatePerHour" DECIMAL(65,30),

    CONSTRAINT "ProcessoEtapa_pkey" PRIMARY KEY ("id")
);

-- Tabela: Canal (Sales Channels)
CREATE TABLE "Canal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "percentFeesTotal" DECIMAL(65,30) NOT NULL,
    "fixedFeePerOrder" DECIMAL(65,30) NOT NULL,
    "taxIncluded" BOOLEAN NOT NULL DEFAULT false,
    "adsIncluded" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Canal_pkey" PRIMARY KEY ("id")
);

-- Tabela: FixosMensais (Fixed Costs)
CREATE TABLE "FixosMensais" (
    "id" TEXT NOT NULL,
    "month" TEXT NOT NULL, -- Formato 'YYYY-MM'
    "totalFixedCosts" DECIMAL(65,30) NOT NULL,
    "productiveHours" DECIMAL(65,30) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FixosMensais_pkey" PRIMARY KEY ("id")
);

-- Unique index para não repetir o mês
CREATE UNIQUE INDEX "FixosMensais_month_key" ON "FixosMensais"("month");

-- Tabela: Precificacao (Pricing Snapshots)
CREATE TABLE "Precificacao" (
    "id" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "canalId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "desiredMargin" DECIMAL(65,30) NOT NULL,
    "computedPrice" DECIMAL(65,30) NOT NULL,
    "breakdownJson" TEXT NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Precificacao_pkey" PRIMARY KEY ("id")
);

-- Foreign Keys (Relacionamentos)

ALTER TABLE "BOMItem" ADD CONSTRAINT "BOMItem_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BOMItem" ADD CONSTRAINT "BOMItem_insumoId_fkey" FOREIGN KEY ("insumoId") REFERENCES "Insumo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ProcessoEtapa" ADD CONSTRAINT "ProcessoEtapa_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Precificacao" ADD CONSTRAINT "Precificacao_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Precificacao" ADD CONSTRAINT "Precificacao_canalId_fkey" FOREIGN KEY ("canalId") REFERENCES "Canal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
