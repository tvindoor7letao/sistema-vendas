export default function TermosDeUso() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-[#1e3a5f] mb-6">Termos de Uso</h1>
        
        <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">1. Aceitação dos Termos</h2>
            <p>Ao se cadastrar e utilizar o Sistema Vendas, o usuário declara ter lido, compreendido e aceito integralmente estes Termos de Uso.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">2. Cadastro e Conta</h2>
            <p>2.1. O lojista é responsável pela veracidade das informações fornecidas no cadastro.</p>
            <p>2.2. O acesso à conta é de responsabilidade exclusiva do lojista.</p>
            <p>2.3. O lojista deve manter seus dados sempre atualizados.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">3. Responsabilidades do Lojista</h2>
            <p>3.1. O lojista é integralmente responsável pelos produtos anunciados.</p>
            <p>3.2. O lojista é responsável pela definição de preços e cumprimento das negociações.</p>
            <p>3.3. O lojista deve cumprir todas as obrigações fiscais e legais.</p>
            <p>3.4. O lojista não pode anunciar produtos ilegais ou proibidos.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">4. Limitação de Responsabilidade da Plataforma</h2>
            <p>4.1. A plataforma é uma ferramenta tecnológica de gestão de vendas.</p>
            <p>4.2. Não nos responsabilizamos por transações comerciais entre lojistas e clientes.</p>
            <p>4.3. Não garantimos que o serviço será isento de erros.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">5. Cancelamento e Suspensão</h2>
            <p>5.1. O lojista pode cancelar sua conta a qualquer momento.</p>
            <p>5.2. A plataforma pode suspender contas que violem estes termos.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">6. Alterações nos Termos</h2>
            <p>Reservamo-nos o direito de modificar estes termos a qualquer momento.</p>
          </div>

          <div className="border-t pt-4 mt-4 text-xs text-gray-400">
            <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
