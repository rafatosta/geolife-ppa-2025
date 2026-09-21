import { IllustrationNotice, Leaf, PageHeader } from "../components/AtlasUI";
export function SobrePage() {
  return (
    <div className="container section">
      <PageHeader
        title="Sobre o GeoLife"
        description="Ciência, tecnologia e linguagem conectadas à biodiversidade local."
      />
      <section
        className="panel about-content"
        aria-labelledby="autoria-geolife"
      >
        <p className="eyebrow">AUTORIA E PARTICIPAÇÃO DOS ESTUDANTES</p>
        <h2 id="autoria-geolife">
          Uma apresentação ilustrativa do trabalho dos alunos
        </h2>
        <p>
          <strong>
            Este site foi desenvolvido pelo professor Rafael Tosta Santos apenas
            para fins ilustrativos
          </strong>
          , como apoio à apresentação do projeto GeoLife e à visualização das
          informações organizadas na PPA.
        </p>
        <p>
          <strong>
            Os alunos implementaram todo o banco de dados e seu povoamento.
          </strong>{" "}
          Também realizaram os estudos das disciplinas envolvidas, articulando
          conhecimentos de Geografia, Biologia, Inglês, Linguagem de Programação
          I e Banco de Dados. A interface apresentada aqui não é atribuída aos
          estudantes.
        </p>
      </section>
      <div className="mission-grid section">
        <article className="panel">
          <Leaf />
          <h2>Conhecer</h2>
          <p>
            Organizar informações sobre a fauna e a flora do entorno do campus e
            das comunidades dos estudantes.
          </p>
        </article>
        <article className="panel">
          <Leaf />
          <h2>Aprender juntos</h2>
          <p>
            Relacionar observações de campo, dados biológicos e território em
            uma experiência de aprendizagem integrada.
          </p>
        </article>
        <article className="panel">
          <Leaf />
          <h2>Valorizar a Caatinga</h2>
          <p>
            Ampliar o olhar sobre a biodiversidade e a educação ambiental no
            contexto regional.
          </p>
        </article>
      </div>
      <article className="panel about-content">
        <p className="eyebrow">PRÁTICA PROFISSIONAL ARTICULADA · 2º ANO</p>
        <h2>GeoLife: Atlas Digital da Biodiversidade Local</h2>
        <p>
          O projeto integra a Prática Profissional Articulada (PPA) do 2º ano do
          Curso Técnico em Informática do IFBA — Campus Euclides da Cunha. Seu
          tema é biodiversidade e georreferenciamento digital, com foco no
          registro, na catalogação e na visualização da fauna e da flora do
          entorno do campus.
        </p>
        <p>
          A questão que orienta o trabalho é como integrar conhecimentos
          científicos, tecnológicos e linguísticos em um sistema que registre e
          divulgue a biodiversidade local, promovendo a conscientização
          ambiental e o uso ético da tecnologia na ciência.
        </p>
        <p>
          A proposta pedagógica prevê um atlas bilíngue, em português e inglês,
          com informações biológicas e geográficas, uma aplicação fundamentada
          em Programação Orientada a Objetos e um banco de dados relacional. O
          caráter bilíngue é um objetivo do projeto; esta interface ilustrativa
          está disponível em português.
        </p>
        <p>
          O catálogo desta versão inclui dados iniciais de exemplo para
          atividades didáticas. Esses registros não constituem uma base de
          pesquisa validada.
        </p>
      </article>
      <section className="panel about-content" aria-labelledby="estudos-ppa">
        <p className="eyebrow">80 HORAS DE TRABALHO INTERDISCIPLINAR</p>
        <h2 id="estudos-ppa">Equipe docente e contribuições das disciplinas</h2>
        <p>
          O projeto destina 16 horas a cada uma das cinco disciplinas. Os
          estudos dos alunos relacionam a investigação da biodiversidade à
          organização dos dados e à comunicação científica, com acompanhamento
          dos professores em todas as etapas.
        </p>
        <dl className="ppa-disciplines">
          <dt>Geografia · 16h</dt>
          <dd>
            <strong>Prof. Edcassio Nivaldo Avelino.</strong> Cartografia,
            georreferenciamento e análise espacial; orientação para coleta de
            coordenadas, mapeamento das espécies e interpretação do território.
          </dd>
          <dt>Biologia · 16h</dt>
          <dd>
            <strong>Profa. Isabela Mayara dos Santos.</strong> Biodiversidade,
            ecossistemas locais e taxonomia; orientação para identificação
            científica das espécies e registro de suas características
            biológicas.
          </dd>
          <dt>Inglês · 16h</dt>
          <dd>
            <strong>Prof. Amarilson Gordiano de Oliveira.</strong> Tradução
            científica, nomenclatura e vocabulário ambiental; orientação para
            elaboração de descrições em português e inglês, tradução técnica e
            escrita científica.
          </dd>
          <dt>Linguagem de Programação I · 16h</dt>
          <dd>
            <strong>Prof. Rafael Tosta Santos.</strong> Fundamentos de
            Programação Orientada a Objetos, modelagem de software,
            componentização, interface e boas práticas de desenvolvimento;
            orientação para modelagem de classes, implementação e testes da
            aplicação prevista na PPA.
          </dd>
          <dt>Banco de Dados · 16h</dt>
          <dd>
            <strong>Prof. Everaldo Costa Silva Neto.</strong> Modelagem
            conceitual e relacional, normalização, SQL e persistência;
            orientação para estruturação do banco de dados, implementação,
            povoamento e integração dos registros.
          </dd>
        </dl>
      </section>
      <section className="panel about-content" aria-labelledby="percurso-ppa">
        <h2 id="percurso-ppa">Percurso de aprendizagem</h2>
        <p>
          A metodologia prevista reúne trabalho em equipes, aprendizagem baseada
          em projetos e investigação científica, com aulas de campo, oficinas de
          programação e atividades no laboratório de informática.
        </p>
        <ol className="ppa-list">
          <li>
            <strong>1ª unidade — levantamento e mapeamento (26h):</strong>{" "}
            Geografia e Biologia integram a coleta de coordenadas às observações
            e características das espécies locais.
          </li>
          <li>
            <strong>2ª unidade — estruturação e desenvolvimento (26h):</strong>{" "}
            Linguagem de Programação I e Banco de Dados articulam a modelagem de
            classes, a criação do banco e a integração dos dados. O plano
            original prevê o desenvolvimento de uma aplicação Java.
          </li>
          <li>
            <strong>3ª unidade — tradução e apresentação (28h):</strong> Inglês
            e as demais disciplinas integram a tradução das descrições, os
            testes e a preparação da apresentação do atlas.
          </li>
        </ol>
        <p>
          A avaliação considera a participação, as entregas parciais, a
          qualidade técnica e científica dos registros, a correção das versões
          em inglês e a apresentação final. O projeto prevê uma apresentação
          pública no campus, com demonstração do produto e banners explicativos.
        </p>
      </section>
      <section className="panel about-content illustrative-section">
        <h2>Entre em contato</h2>
        <IllustrationNotice />
        <p>O envio de mensagens ainda não está disponível.</p>
        <fieldset disabled className="form-grid">
          <label>
            Nome
            <input name="contact-name" />
          </label>
          <label>
            E-mail
            <input type="email" name="contact-email" />
          </label>
          <label className="full-width">
            Mensagem
            <textarea rows={4} />
          </label>
          <button className="button" type="button">
            Enviar mensagem
          </button>
        </fieldset>
        <div className="social-examples">
          <p>Redes sociais — links ainda não informados.</p>
          <button disabled className="button secondary">
            Facebook
          </button>
          <button disabled className="button secondary">
            Instagram
          </button>
          <button disabled className="button secondary">
            LinkedIn
          </button>
        </div>
      </section>
    </div>
  );
}
