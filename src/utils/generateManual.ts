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
        const height = lines.length * 6;

        if (y + height > 280) {
            doc.addPage();
            y = 20;
        }

        doc.text(lines, margin, y);
        y += height + 4;
    };

    // Helper for subsections
    const addSubHeader = (title: string) => {
        if (y > 260) {
            doc.addPage();
            y = 20;
        }
        y += 3;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(title, margin, y);
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
    };

    // Helper for section headers
    const addSection = (title: string) => {
        if (y > 250) { // New page if near bottom
            doc.addPage();
            y = 20;
        }
        y += 8;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(79, 70, 229); // Indigo
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
    centerText("Precificação Avançada & Gestão Estratégica", 32, 12);

    y = 60;
    doc.setTextColor(0, 0, 0);

    // --- Content ---

    addSection("1. Introdução");
    addParagraph("Este sistema não é apenas uma planilha; é uma ferramenta de engenharia de preços. Ele utiliza o conceito de 'Markup Divisor' para garantir que você tenha lucro real (líquido) após pagar todos os custos, impostos e comissões.");

    addSection("2. Os 3 Pilares do Custo");
    addParagraph("Antes de vender, precisamos saber exatamente quanto custa produzir. O sistema soma automaticamente três fatores:");

    addSubHeader("A) Custo Variável (Materiais)");
    addParagraph("É a soma de toda a matéria-prima usada. O sistema calcula o valor proporcional (Ex: se um pote de tinta custa R$ 50 e você usa 10%, o custo é R$ 5).");

    addSubHeader("B) Mão de Obra (Seu Tempo)");
    addParagraph("Você define seu Pro-Labore e Jornada na aba Configurações. O sistema calcula quanto vale seu minuto de trabalho. Se um produto leva 30 minutos para ser feito, ele custará '30 x Valor do Minuto'.");

    addSubHeader("C) Custos Fixos (Rateio)");
    addParagraph("Suas contas mensais (Aluguel, Luz, Internet) precisam ser pagas pela produção. O sistema pega o total dos custos fixos mensais e divide pela sua capacidade total de horas produtivas.");
    addParagraph("Exemplo: Se seus custos fixos são R$ 1.000,00 e você trabalha 160h/mês, cada hora produzida carrega R$ 6,25 de custo fixo para pagar as contas da empresa.");

    doc.addPage();
    y = 20;

    addSection("3. A Fórmula do Preço Perfeito");
    addParagraph("Muitas pessoas erram ao somar custos e adicionar uma porcentagem em cima. Isso está errado. A forma correta é dividir pelo fator inverso.");

    addSubHeader("A Lógica Matemática");
    addParagraph("Imagine que você quer vender por um PREÇO FINAL (100%). Esse preço será fatiado em pedaços:");
    addParagraph("• Uma fatia vai para o Imposto (Ex: 6%)");
    addParagraph("• Uma fatia vai para o Cartão/Marketplace (Ex: 10%)");
    addParagraph("• Uma fatia vai para o seu Lucro Líquido (Ex: 20%)");
    addParagraph("• O que sobrar (64%) TEM que ser suficiente para pagar o Custo de Produção.");

    addSubHeader("A Fórmula que o Sistema usa:");
    doc.setFont('courier', 'bold');
    doc.setFontSize(10);
    doc.text("Preço Venda = Custo Total / (1 - (Imposto% + Taxas% + Lucro%))", margin, y);
    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);

    addParagraph("Exemplo Prático:");
    addParagraph("Custo Total de Produção: R$ 50,00");
    addParagraph("Taxas Totais (Imposto + Cartão + Lucro): 40% (ou 0.40)");
    addParagraph("O sistema faz: R$ 50,00 / (1 - 0.40) -> R$ 50,00 / 0.60 = R$ 83,33");
    addParagraph("Se você vendesse por R$ 50 + 40% (R$ 70,00), teria prejuízo. Por isso usamos essa fórmula.");

    addSection("4. Guia Rápido de Uso");
    addSubHeader("Passo 1: Configurações");
    addParagraph("Defina seu salário e jornada para o sistema calcular o valor da sua hora.");

    addSubHeader("Passo 2: Custos Fixos");
    addParagraph("Lance todas as contas do mês. Elas serão rateadas automaticamente.");

    addSubHeader("Passo 3: Materiais");
    addParagraph("Cadastre insumos pelo preço de compra (pacote/caixa).");

    addSubHeader("Passo 4: Produtos (A Mágica)");
    addParagraph("Crie o produto, informe os materiais e o tempo de cada etapa. No final, ajuste a Margem de Lucro e veja o Preço Sugerido aparecer na hora.");

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text('Página ' + i + ' de ' + pageCount, pageWidth - margin - 20, doc.internal.pageSize.getHeight() - 10);
    }

    doc.save("Manual_Precificacao_Avancada.pdf");
};
