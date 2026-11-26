import 'dotenv/config';

// Configuração em um lugar só. Os valores padrão são dados de demonstração
// publicados pelos próprios sites, então o projeto roda sem .env.
export const env = {
  baseUrl: process.env.BASE_URL ?? 'https://practicesoftwaretesting.com',
  apiUrl: process.env.API_URL ?? 'https://restful-booker.herokuapp.com',

  cliente: {
    email: process.env.CUSTOMER_EMAIL ?? 'customer@practicesoftwaretesting.com',
    senha: process.env.CUSTOMER_PASSWORD ?? 'welcome01',
    senhaErrada: 'senha-errada',
    emailInexistente: 'fantasma@exemplo.com',
  },

  adminApi: {
    usuario: process.env.BOOKER_USERNAME ?? 'admin',
    senha: process.env.BOOKER_PASSWORD ?? 'password123',
    senhaErrada: 'senha-errada',
  },

  endereco: {
    cep: process.env.BILLING_POSTAL_CODE ?? '01310-100',
    numero: '100',
    rua: 'Av. Paulista',
    cidade: 'Sao Paulo',
    estado: 'SP',
    pais: 'Brazil',
  },

  cartao: {
    numeroValido: '4111-1111-1111-1111',
    validade: '12/2030',
    cvv: '123',
    titular: 'Jessica Sales',
    numeroInvalido: '1234',
    validadeVencida: '01/2020',
  },
} as const;
