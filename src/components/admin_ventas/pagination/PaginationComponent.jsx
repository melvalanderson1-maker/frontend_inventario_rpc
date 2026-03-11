import React, { useState, useEffect } from "react";
import "./PaginationComponent.css";

export default function PaginationComponent({
  currentPage = 1,
  totalPages = 1,
  itemsPerPage = 12,
  itemsPerPageOptions = [20, 50, 100],
  totalItems = 0,
  onPageChange = () => {},
  onItemsPerPageChange = () => {},
  isSticky = true,
  position = "both" // "top", "bottom", or "both"
}) {
  const [visiblePages, setVisiblePages] = useState([]);

  // Calcular páginas visibles (máximo 7 botones)
useEffect(() => {
  const pages = [];
  const maxVisible = 7; // máximo botones visibles sin contar 1 y totalPages
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  // Asegurarse que siempre hay espacio para el botón final
  if (endPage === totalPages) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  // Asegurarse que siempre hay espacio para el botón inicial
  if (startPage === 1) {
    endPage = Math.min(totalPages, startPage + maxVisible - 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  setVisiblePages(pages);
}, [currentPage, totalPages]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
      // Scroll al top del contenedor
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const paginationContent = (
    <div className="pagination-wrapper">
      {/* Información de resultados */}
      <div className="pagination-info">
        {totalItems > 0 ? (
          <>
            <span className="info-text">
              Mostrando <strong>{startItem}</strong> a <strong>{endItem}</strong> de{" "}
              <strong>{totalItems}</strong> resultados
            </span>
            <span className="info-divider">•</span>
            <span className="info-page">
              Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
            </span>
          </>
        ) : (
          <span className="info-text no-results">No hay resultados</span>
        )}
      </div>

      {/* Selector compacto dentro del contenedor */}
      <div className="pagination-per-page">
        <label className="per-page-label">
          <span className="per-page-text">Mostrar</span>
          <select
            className="items-per-page-select"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            aria-label="Mostrar por página"
          >
            {itemsPerPageOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Controles de paginación */}
      <div className="pagination-controls">
        {/* Botón Anterior */}
        <button
          className="pagination-btn pagination-arrow"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || totalPages === 0}
          title="Página anterior"
          aria-label="Página anterior"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        {/* Contenedor reservado para “Primera página” */}
        <div className="pagination-first-placeholder">
        {(() => {
            const firstVisible = visiblePages[0];
            const showStartEllipsis = firstVisible > 2;
            if (firstVisible > 1) {
                return (
                    <>
                    <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(1)}
                        title="Primera página"
                        aria-label="Primera página"
                    >
                        1
                    </button>
                    {showStartEllipsis && <span className="pagination-ellipsis">...</span>}
                    </>
                );
            } else {
                return <div style={{ width: "4.5rem" }} />;
            }
        })()}
        </div>

        {/* Números de página */}
        {visiblePages.map((page) => (
          <button
            key={page}
            className={`pagination-btn ${
              page === currentPage ? "active" : ""
            }`}
            onClick={() => handlePageChange(page)}
            title={`Ir a página ${page}`}
            aria-label={`Página ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        ))}

        <div className="pagination-last-placeholder">
        {(() => {
            const lastVisible = visiblePages[visiblePages.length - 1];
            const showEndEllipsis = lastVisible < totalPages - 1;

            if (lastVisible < totalPages) {
            return (
                <>
                {showEndEllipsis && (
                    <span className="pagination-ellipsis">...</span>
                )}
                <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(totalPages)}
                    title="Última página"
                    aria-label="Última página"
                >
                    {totalPages}
                </button>
                </>
            );
            } else {
                return <div style={{ width: "4.5rem" }} />;
            }
        })()}
        </div>

        {/* Botón Siguiente */}
        <button
          className="pagination-btn pagination-arrow"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          title="Página siguiente"
          aria-label="Página siguiente"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
        
      </div>
    </div>
  );

  if (totalPages <= 1) {
    return null; // No mostrar paginación si hay 1 o 0 páginas
  }

  if (!isSticky) {
    return <nav className="pagination">{paginationContent}</nav>;
  }

  // Versión sticky
  return (
    <>
      {(position === "top" || position === "both") && (
        <nav className="pagination pagination-top pagination-sticky">
          {paginationContent}
        </nav>
      )}
      {(position === "bottom" || position === "both") && (
        <nav className="pagination pagination-bottom pagination-sticky">
          {paginationContent}
        </nav>
      )}
    </>
  );
}
