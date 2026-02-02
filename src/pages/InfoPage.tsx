import { HelpCircle, AlertCircle, Phone, Mail, FileText, Users, Shield, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../api/client';

type Content = {
  id: string;
  type: string;
  title: string;
  content: string;
  order: number;
};

export function InfoPage() {
  const [faqs, setFaqs] = useState<Content[]>([]);
  const [instructions, setInstructions] = useState<Content[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const { data } = await api.get('/institutional-content?isActive=true');
      const content = data.content || [];
      setFaqs(content.filter((c: Content) => c.type === 'FAQ').sort((a: Content, b: Content) => a.order - b.order));
      setInstructions(content.filter((c: Content) => c.type === 'INSTRUCOES').sort((a: Content, b: Content) => a.order - b.order));
      setEmergencyContacts(content.filter((c: Content) => c.type === 'CONTACTO_EMERGENCIA').sort((a: Content, b: Content) => a.order - b.order));
    } catch (error) {
      console.error('Erro ao carregar conteúdo institucional:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Informações Gerais
        </h1>
        <p className="text-lg text-slate-600">
          Guia completo sobre como agir quando alguém desaparece
        </p>
      </div>

      {/* Instruções (do backend) */}
      {instructions.length > 0 && (
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-slate-900">
              Instruções
            </h2>
          </div>
          <div className="space-y-4">
            {instructions.map((instruction) => (
              <div key={instruction.id} className="border-l-4 border-blue-600 pl-4">
                <h3 className="font-semibold text-slate-900 mb-2">{instruction.title}</h3>
                <div className="prose max-w-none text-slate-600 whitespace-pre-wrap">{instruction.content}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* O que fazer quando alguém desaparece (fallback se não houver instruções do backend) */}
      {instructions.length === 0 && (
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-slate-900">
              O que fazer quando alguém desaparece
            </h2>
          </div>

          <div className="space-y-6">
          <div className="border-l-4 border-blue-600 pl-4">
            <h3 className="font-semibold text-slate-900 mb-2">1. Aja rapidamente</h3>
            <p className="text-slate-600">
              Não espere 24 horas para reportar um desaparecimento. Quanto mais rápido você agir, maiores são as chances de encontrar a pessoa.
            </p>
          </div>

          <div className="border-l-4 border-green-600 pl-4">
            <h3 className="font-semibold text-slate-900 mb-2">2. Reúna informações importantes</h3>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>Nome completo e apelidos</li>
              <li>Idade e data de nascimento</li>
              <li>Fotos recentes e claras</li>
              <li>Descrição física detalhada (altura, peso, cor dos olhos, cabelo, marcas distintivas)</li>
              <li>Roupas que estava usando quando desapareceu</li>
              <li>Último local onde foi visto</li>
              <li>Horário aproximado do desaparecimento</li>
              <li>Informações médicas relevantes</li>
            </ul>
          </div>

          <div className="border-l-4 border-amber-600 pl-4">
            <h3 className="font-semibold text-slate-900 mb-2">3. Entre em contato com as autoridades</h3>
            <p className="text-slate-600 mb-2">
              Registre o desaparecimento imediatamente:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>Polícia Nacional de Angola - Emergência: 113</li>
              <li>Delegacia mais próxima</li>
              <li>Linha direta de desaparecimentos (se disponível)</li>
            </ul>
          </div>

          <div className="border-l-4 border-red-600 pl-4">
            <h3 className="font-semibold text-slate-900 mb-2">4. Use esta plataforma</h3>
            <p className="text-slate-600 mb-2">
              Reporte o desaparecimento nesta plataforma para:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>Alcançar mais pessoas rapidamente</li>
              <li>Receber notificações de avistamentos</li>
              <li>Manter a comunidade informada</li>
              <li>Colaborar com autoridades</li>
            </ul>
          </div>

          <div className="border-l-4 border-purple-600 pl-4">
            <h3 className="font-semibold text-slate-900 mb-2">5. Mobilize sua rede</h3>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>Compartilhe nas redes sociais</li>
              <li>Avise amigos, familiares e conhecidos</li>
              <li>Distribua panfletos com foto e informações</li>
              <li>Mantenha um ponto de contato centralizado</li>
            </ul>
          </div>
          </div>
        </section>
      )}

      {/* FAQs (do backend) */}
      {faqs.length > 0 ? (
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-slate-900">
              Perguntas Frequentes (FAQs)
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="border-b border-slate-200 pb-4 last:border-b-0">
                <h3 className="font-semibold text-slate-900 mb-2">{faq.title}</h3>
                <div className="prose max-w-none text-slate-600 whitespace-pre-wrap">{faq.content}</div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-slate-900">
              Perguntas Frequentes (FAQs)
            </h2>
          </div>
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                Quanto tempo devo esperar antes de reportar um desaparecimento?
              </h3>
              <p className="text-slate-600">
                Não espere! Reporte imediatamente. Não existe um período de espera obrigatório para reportar um desaparecimento, especialmente em casos de crianças, idosos ou pessoas com condições médicas.
              </p>
            </div>
            <div className="border-b border-slate-200 pb-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                Posso reportar um desaparecimento mesmo sem ser familiar?
              </h3>
              <p className="text-slate-600">
                Sim, qualquer pessoa que tenha conhecimento de um desaparecimento pode reportar. No entanto, casos reportados por não-familiares passam por uma verificação adicional antes de serem publicados.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Contatos de Emergência (do backend) */}
      {emergencyContacts.length > 0 ? (
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-6">
            <Phone className="h-6 w-6 text-red-600" />
            <h2 className="text-2xl font-semibold text-slate-900">
              Contatos de Emergência
            </h2>
          </div>
          <div className="space-y-4">
            {emergencyContacts.map((contact) => (
              <div key={contact.id} className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h3 className="font-semibold text-red-900 mb-2">{contact.title}</h3>
                <div className="prose max-w-none text-red-700 whitespace-pre-wrap">{contact.content}</div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-6">
            <Phone className="h-6 w-6 text-red-600" />
            <h2 className="text-2xl font-semibold text-slate-900">
              Contatos de Emergência
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-900 mb-2">Emergência</h3>
              <p className="text-red-700 font-mono text-lg">113</p>
              <p className="text-sm text-red-600">Polícia Nacional de Angola</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Bombeiros</h3>
              <p className="text-blue-700 font-mono text-lg">115</p>
              <p className="text-sm text-blue-600">Serviço de Bombeiros</p>
            </div>
          </div>
        </section>
      )}

      {/* Recursos Adicionais */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-semibold text-slate-900">
            Recursos Adicionais
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <Users className="h-8 w-8 text-blue-600 mb-2" />
            <h3 className="font-semibold text-slate-900 mb-2">Rede Colaborativa</h3>
            <p className="text-sm text-slate-600">
              Conecte-se com outros usuários e forme uma rede de apoio para ajudar a encontrar pessoas desaparecidas.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <Shield className="h-8 w-8 text-green-600 mb-2" />
            <h3 className="font-semibold text-slate-900 mb-2">Verificação</h3>
            <p className="text-sm text-slate-600">
              Usuários verificados têm maior credibilidade e acesso a funcionalidades avançadas da plataforma.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <Clock className="h-8 w-8 text-amber-600 mb-2" />
            <h3 className="font-semibold text-slate-900 mb-2">Notificações em Tempo Real</h3>
            <p className="text-sm text-slate-600">
              Receba notificações instantâneas sobre avistamentos, atualizações de casos e mensagens importantes.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

