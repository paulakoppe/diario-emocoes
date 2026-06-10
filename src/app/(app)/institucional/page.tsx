import { Info, Shield, Mail } from "lucide-react";

export default function InstitucionalPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-display font-bold">Sobre</h1>
        <p className="text-soft font-display text-sm mt-1">
          O app, a privacidade e quem está por trás.
        </p>
      </header>

      <div className="space-y-4">
        <section className="card">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-blush-400" />
            <h2 className="text-lg font-display font-bold">
              O que é o Diário de Emoções
            </h2>
          </div>
          <div className="space-y-3 text-sm font-display text-soft leading-relaxed">
            <p>
              Um espaço pessoal para registrar como você se sente, emoção,
              intensidade e contexto, ao longo do tempo.
            </p>
            <p>
              Foi pensado para apoiar o processo terapêutico e o autoconhecimento.
              Não é um app de diagnóstico, não substitui acompanhamento médico
              ou psicológico e não oferece aconselhamento clínico.
            </p>
            <p>
              Se você está em sofrimento, procure um profissional de saúde
              mental. Em situações de risco, o CVV atende 24h pelo telefone
              188 ou em cvv.org.br.
            </p>
          </div>
        </section>

        <section className="card">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-blush-400" />
            <h2 className="text-lg font-display font-bold">
              Privacidade e LGPD
            </h2>
          </div>
          <div className="space-y-3 text-sm font-display text-soft leading-relaxed">
            <p>
              Seus registros são pessoais e ficam vinculados à sua conta.
              Ninguém além de você acessa o conteúdo do seu diário.
            </p>
            <div>
              <p className="font-semibold text-ink-600 mb-1">
                Dados tratados
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Perfil: nome, telefone, email e avatar (opcional).</li>
                <li>
                  Registros do diário: emoção, intensidade, texto livre e data.
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-ink-600 mb-1">
                Onde ficam armazenados
              </p>
              <p>
                Banco PostgreSQL gerenciado pelo Supabase, com Row Level
                Security ativa, cada usuário só consegue ler e escrever os
                próprios dados. O avatar fica em bucket privado por usuário.
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink-600 mb-1">
                Base legal
              </p>
              <p>
                Tratamento amparado no consentimento, conforme a Lei nº
                13.709/2018 (LGPD). O consentimento é manifestado no momento
                do cadastro e pode ser revogado a qualquer tempo.
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink-600 mb-1">
                Seus direitos
              </p>
              <p>
                Você pode solicitar acesso, correção, portabilidade ou
                exclusão dos seus dados, além da revogação do consentimento
                e da eliminação da conta. Para exercer, use o contato abaixo.
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink-600 mb-1">
                Compartilhamento
              </p>
              <p>
                Os dados não são vendidos, alugados ou compartilhados com
                terceiros para fins comerciais. Operadores envolvidos no
                funcionamento do app (Supabase, para banco e storage; Resend,
                quando você opta por enviar um PDF por email) tratam dados
                estritamente para a finalidade contratada.
              </p>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-5 h-5 text-blush-400" />
            <h2 className="text-lg font-display font-bold">
              Contato e autoria
            </h2>
          </div>
          <div className="space-y-3 text-sm font-display text-soft leading-relaxed">
            <p>
              Desenvolvido por Paula Koppe.
            </p>
            <p>
              Software depositado no Instituto Nacional da Propriedade
              Industrial (INPI) em 09/06/2026, processo nº 512026004317-4
              , categoria AP04, campo de aplicação SD01 (Saúde).
            </p>
            <p>
              Para dúvidas, solicitações de LGPD ou suporte, escreva para{" "}
              <a
                href="mailto:paula.c.koppe@gmail.com"
                className="text-blush-500 hover:underline"
              >
                paula.c.koppe@gmail.com
              </a>
              .
            </p>
          </div>
        </section>

        <p className="text-xs font-display text-soft text-center pt-2 pb-4">
          Última atualização: junho de 2026
        </p>
      </div>
    </div>
  );
}
