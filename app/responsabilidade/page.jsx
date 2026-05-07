export default function Responsabilidade() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-[#1e3a5f] mb-6">Termo de Responsabilidade</h1>
        
        <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-semibold">⚠️ Leia atentamente antes de utilizar a plataforma</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">1. Natureza da Plataforma</h2>
            <p>O Sistema Vendas é uma ferramenta tecnológica de gestão de vendas. Não atuamos como intermediário de pagamentos.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">2. Responsabilidade do Lojista</h2>
            <p>O lojista assume integral responsabilidade por:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Produtos anunciados (qualidade, procedência, veracidade)</li>
              <li>Preços praticados e promoções</li>
              <li>Prazos e condições de entrega</li>
              <li>Cumprimento das obrigações com clientes</li>
              <li>Questões fiscais e tributárias</li>
              <li>Conteúdo das imagens e descrições dos produtos</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">3. Isenção de Responsabilidade da Plataforma</h2>
            <p>O Sistema Vendas NÃO se responsabiliza por:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Transações comerciais entre lojistas e clientes</li>
              <li>Pagamentos realizados diretamente entre as partes</li>
              <li>Produtos danificados ou extraviados</li>
              <li>Descrições incorretas de produtos</li>
              <li>Conflitos entre lojistas e clientes</li>
              <li>Multas ou processos decorrentes da atividade do lojista</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">4. Aceitação do Termo</h2>
            <p>Ao se cadastrar, o lojista declara que leu, compreendeu e aceita este termo, isentando a plataforma de qualquer reclamação.</p>
          </div>

          <div className="bg-gray-50 p-4 rounded border">
            <p className="font-semibold">Importante:</p>
            <p className="text-xs text-gray-500 mt-1">Este termo é parte integrante dos Termos de Uso da plataforma.</p>
          </div>

          <div className="border-t pt-4 mt-4 text-xs text-gray-400">
            <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
