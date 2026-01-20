import jsPDF from 'jspdf';

export const generateManual = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    let y = 20;

    // Helper for centered text
    const centerText = (text: string, yPos: number, size = 12) => {
        doc.setFontSize(size);
        const textWidth = doc.getStringUnitWidth(text) * size / doc.internal.scaleFactor;
        const x = (pageWidth - textWidth) / 2;
        doc.text(text, x, yPos);
    };

    // Helper for adding paragraphs with word wrap
    const addParagraph = (text: string) => {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(text, contentWidth);
        doc.text(lines, margin, y);
        y += (lines.length * 7) + 5;
    };

    // Helper for section headers
    const addSection = (title: string) => {
        if (y > 250) { // New page if near bottom
            doc.addPage();
            y = 20;
        }
        y += 5;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(title, margin, y);
        y += 10;
        doc.setTextColor(60, 60, 60);
    };

    // --- TITLE PAGE ---
    doc.setFillColor(79, 70, 229); // Indigo 600
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    centerText("MANUAL DO SISTEMA", 25, 22);

    doc.setFontSize(10);
    centerText("Precificação Estratégica & Gestão", 32, 12);

    y = 60;
    doc.setTextColor(0, 0, 0);

    // --- Content ---

    addSection("1. Introdução");
    addParagraph("Bem-vindo ao seu sistema de precificação. Este software foi desenhado para garantir que cada centavo do seu custo seja contabilizado, permitindo que você encontre o preço de venda ideal para ter lucro real.");
    addParagraph("O sistema opera em fluxo lógico: Cadastros Básicos -> Criação de Produtos -> Precificação -> Vendas (Orçamentos).");

    addSection("2. Configurações Iniciais");
    addParagraph("Antes de tudo, acesse a aba 'Configurações' para definir:");
    addParagraph("• Pro-Labore: Quanto você quer retirar de salário mensalmente.");
    addParagraph("• Horas de Trabalho: Quantos dias por mês e horas por dia você dedica à produção.");
    addParagraph("Isso é fundamental para calcular o custo da sua hora de trabalho.");

    addSection("3. Custos Fixos");
    addParagraph("Acesse a aba 'Custos Fixos' e cadastre todas as despesas mensais recorrentes (Aluguel, Luz, Internet, Software, etc.).");
    addParagraph("O sistema soma tudo e divide pelas suas horas úteis para encontrar a 'Taxa de Rateio'. Cada produto vai pagar uma parte dessas contas baseado no tempo que leva para ser feito.");

    addSection("4. Materiais");
    addParagraph("Na aba 'Materiais', cadastre tudo que você compra para produzir.");
    addParagraph("Use a calculadora integrada para converter preços de pacotes em preço unitário (Ex: Pacote de 500 folhas custa R$ 20,00 -> Custo unitário R$ 0,04).");

    doc.addPage();
    y = 20;

    addSection("5. Criando Produtos");
    addParagraph("Em 'Produtos', clique em 'Novo Produto'. O formulário é dividido em 4 partes:");
    addParagraph("1. Informações: Nome, categoria e unidade.");
    addParagraph("2. Material de Produção: Selecione os materiais usados e a quantidade.");
    addParagraph("3. Processo (Mão de Obra): Liste as etapas (Ex: Cortar, Colar) e o tempo gasto.");
    addParagraph("4. Precificação: Onde a mágica acontece. O sistema soma Material + Mão de Obra + Custo Fixo.");

    addSection("6. Precificação Perfeita");
    addParagraph("Na seção final do produto, você verá o 'Custo Direto'.");
    addParagraph("Você deve preencher:");
    addParagraph("• Margem de Lucro (%): Quanto você quer de lucro líquido.");
    addParagraph("• Impostos (%): Sua alíquota de imposto (DAS/MEI).");
    addParagraph("• Taxas (%): Taxa do cartão ou comissão do Marketplace (Ex: 16% ML).");
    addParagraph("O sistema calculará automaticamente o Preço de Venda Sugerido para garantir que, após pagar impostos e taxas, sobre exatamente a sua margem de lucro.");

    addSection("7. Orçamentos");
    addParagraph("Use a aba 'Orçamentos' para formalizar vendas.");
    addParagraph("Selecione o cliente, adicione os produtos e o sistema gera o total.");
    addParagraph("Ao salvar, clique no ícone de impressora na lista para gerar um PDF profissional pronto para enviar ao cliente.");

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text('Página ' + i + ' de ' + pageCount, pageWidth - margin - 20, doc.internal.pageSize.getHeight() - 10);
    }

    doc.save("Manual_do_Sistema.pdf");
};
