/** Navegação por fragmento: URLs compartilháveis, histórico nativo e nenhuma dependência de roteamento. */
import { useEffect, useRef, useState } from "react";
import { Leaf } from "./components/AtlasUI";
import { HomePage } from "./pages/HomePage";
import { CatalogoPage } from "./pages/CatalogoPage";
import { EspecieDetalhePage } from "./pages/EspecieDetalhePage";
import { MapaPage } from "./pages/MapaPage";
import { SobrePage } from "./pages/SobrePage";
import { EspeciesPage } from "./pages/EspeciesPage";
import { RegioesPage } from "./pages/RegioesPage";
import { ObservacoesPage } from "./pages/ObservacoesPage";

const links = [
  ["/", "Início"],
  ["/mapa", "Mapa"],
  ["/especies", "Espécies"],
  ["/regioes", "Regiões"],
  ["/observacoes", "Observações"],
  ["/sobre", "Sobre"],
];
export default function App() {
  const [route, setRoute] = useState(
    () => window.location.hash.slice(1) || "/",
  );
  const [menu, setMenu] = useState(false);
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    const change = () => {
      setRoute(window.location.hash.slice(1) || "/");
      setMenu(false);
      main.current?.focus();
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  const [path, query] = route.split("?");
  const detail = path.match(/^\/especies\/(\d+)$/);
  const active =
    path.startsWith("/especies/") || path === "/gerenciar-especies"
      ? "/especies"
      : path;
  useEffect(() => {
    document.title = `${detail ? "Ficha da espécie" : links.find(([url]) => url === active)?.[1] || "Registrar observação"} | GeoLife`;
  }, [active, detail?.[1]]);
  let page;
  if (path === "/") page = <HomePage />;
  else if (path === "/especies") page = <CatalogoPage />;
  else if (detail)
    page = <EspecieDetalhePage key={detail[1]} id={Number(detail[1])} />;
  else if (path === "/mapa") page = <MapaPage />;
  else if (path === "/sobre") page = <SobrePage />;
  else if (path === "/regioes")
    page = (
      <div className="container section">
        <RegioesPage />
      </div>
    );
  else if (path === "/gerenciar-especies")
    page = (
      <div className="container section">
        <a className="text-link" href="#/especies">
          ← Voltar ao catálogo
        </a>
        <EspeciesPage />
      </div>
    );
  else if (path === "/observacoes" || path === "/cadastro")
    page = (
      <div className="container section">
        <ObservacoesPage
          key={route}
          initialSpeciesId={
            Number(new URLSearchParams(query).get("especie")) || undefined
          }
        />
      </div>
    );
  else
    page = (
      <div className="container section empty-state">
        <h1>Página não encontrada</h1>
        <a href="#/">Voltar ao início</a>
      </div>
    );
  return (
    <>
      <a
        className="skip-link"
        href="#conteudo"
        onClick={(e) => {
          e.preventDefault();
          main.current?.focus();
        }}
      >
        Pular para o conteúdo
      </a>
      <header className="site-header">
        <div className="container nav-shell">
          <a className="brand" href="#/">
            <Leaf />
            GeoLife
          </a>
          <button
            className="menu-button button secondary"
            aria-expanded={menu}
            aria-controls="main-nav"
            onClick={() => setMenu(!menu)}
          >
            Menu {menu ? "−" : "+"}
          </button>
          <nav
            id="main-nav"
            aria-label="Navegação principal"
            className={menu ? "site-nav open" : "site-nav"}
          >
            {links.map(([url, label]) => (
              <a
                key={url}
                href={`#${url}`}
                aria-current={active === url ? "page" : undefined}
              >
                {label}
              </a>
            ))}
            <a
              className="nav-register"
              href="#/cadastro"
              aria-current={path === "/cadastro" ? "page" : undefined}
            >
              + Registrar
            </a>
          </nav>
        </div>
      </header>
      <main id="conteudo" ref={main} tabIndex={-1}>
        {page}
      </main>
      <footer className="site-footer">
        <div className="container footer-content">
          <div>
            <a className="brand" href="#/">
              <Leaf />
              GeoLife
            </a>
            <p>Atlas Digital da Biodiversidade Local</p>
              <p>O banco inicial contém dados de exemplo para fins didáticos.</p>
          </div>
          <p>
            Prática Profissional Articulada
            <br />
            IFBA · Campus Euclides da Cunha
          </p>
          <a href="#/sobre">Conheça o projeto →</a>
        </div>
      </footer>
    </>
  );
}
