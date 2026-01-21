interface CepResponse {
    cep: string;
    state: string;
    city: string;
    neighborhood: string;
    street: string;
}

interface CnpjResponse {
    cnpj: string;
    razao_social: string;
    nome_fantasia: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    municipio: string;
    uf: string;
    cep: string;
    ddd_telefone_1: string;
}

export const brasilApi = {
    fetchCep: async (cep: string): Promise<CepResponse | null> => {
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length !== 8) return null;
        try {
            const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${cleanCep}`);
            if (!res.ok) throw new Error('CEP not found');
            return await res.json();
        } catch (e) {
            console.error(e);
            return null;
        }
    },

    fetchCnpj: async (cnpj: string): Promise<CnpjResponse | null> => {
        const cleanCnpj = cnpj.replace(/\D/g, '');
        if (cleanCnpj.length !== 14) return null;
        try {
            const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
            if (!res.ok) throw new Error('CNPJ not found');
            return await res.json();
        } catch (e) {
            console.error(e);
            return null;
        }
    }
};
