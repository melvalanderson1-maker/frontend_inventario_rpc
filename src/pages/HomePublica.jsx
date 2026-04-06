// src/pages/HomePublica.jsx
import React from "react";
import PublicHeader from "../components/layout/PublicHeader";
import PublicFooter from "../components/layout/PublicFooter";
import { Link } from "react-router-dom";
import "./HomePublica.css";

export default function HomePublica() {
  return (
    <div className="page-wrapper">
      <PublicHeader />
      <main className="home">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <h1 className="hero-title">GRUPO RPC</h1>
            <p className="hero-subtitle">Distribuidores Líderes de Productos de Limpieza</p>
            <p className="hero-description">
              Ofrecemos una amplia gama de productos de limpieza de alta calidad con entrega garantizada,
              puntualidad y formalización completa de todos nuestros procesos. Su satisfacción es nuestra prioridad.
            </p>
            <Link to="/login" className="cta-button">Ver Catálogo de Productos</Link>
          </div>
          <div className="hero-image">
            <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Productos de limpieza GRUPO RPC" />
          </div>
        </section>

        {/* About Section */}
        <section className="about">
          <div className="container">
            <h2>¿Quiénes Somos?</h2>
            <p>
              GRUPO RPC es una empresa dedicada a la distribución y venta de productos de limpieza profesionales.
              Con años de experiencia en el mercado, nos especializamos en ofrecer soluciones integrales para
              hogares, oficinas, industrias y comercios. Nuestro compromiso es brindar productos de calidad
              con un servicio excepcional y garantías que respaldan cada entrega.
            </p>
            <div className="stats">
              <div className="stat">
                <h3>10+</h3>
                <p>Años de Experiencia</p>
              </div>
              <div className="stat">
                <h3>500+</h3>
                <p>Productos en Catálogo</p>
              </div>
              <div className="stat">
                <h3>100%</h3>
                <p>Satisfacción del Cliente</p>
              </div>
            </div>
          </div>
        </section>

        {/* Guarantees Section */}
        <section className="guarantees">
          <div className="container">
            <h2>Nuestras Garantías</h2>
            <div className="guarantees-grid">
              <div className="guarantee">
                <h3>Entrega Puntual</h3>
                <p>Garantizamos la entrega de sus productos en el tiempo acordado, con seguimiento en tiempo real.</p>
              </div>
              <div className="guarantee">
                <h3>Calidad Certificada</h3>
                <p>Todos nuestros productos cumplen con estándares de calidad nacionales e internacionales.</p>
              </div>
              <div className="guarantee">
                <h3>Devoluciones Sin Complicaciones</h3>
                <p>Política de devoluciones flexible con reembolso garantizado en caso de insatisfacción.</p>
              </div>
              <div className="guarantee">
                <h3>Soporte Técnico</h3>
                <p>Asesoría especializada para elegir los productos adecuados para sus necesidades específicas.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="services">
          <div className="container">
            <h2>Nuestros Servicios</h2>
            <div className="services-grid">
              <div className="service-card">
                <img src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Venta al por mayor" />
                <h3>Venta al Por Mayor</h3>
                <p>Precios competitivos para distribuidores y comercios. Descuentos por volumen y condiciones especiales.</p>
              </div>
              <div className="service-card">
                <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Venta al por menor" />
                <h3>Venta al Por Menor</h3>
                <p>Acceso directo para consumidores finales con entrega a domicilio y facilidades de pago.</p>
              </div>
              <div className="service-card">
                <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Distribución" />
                <h3>Distribución Nacional</h3>
                <p>Cobertura en todo el territorio con logística optimizada y entregas garantizadas.</p>
              </div>
            </div>
          </div>
        </section>

          {/* Product Categories */}
        <section className="categories">
          <h2>Categorías de Productos</h2>
          <div className="categories-wrapper">
            <div className="categories-grid">
              <div className="category">
                <img src="/images/1.jpg" alt="Limpieza del Hogar" />
                <h3>Limpieza del Hogar</h3>
              </div>
              <div className="category">
                <img src="/images/2.jpg" alt="Limpieza Industrial" />
                <h3>Limpieza Industrial</h3>
              </div>
              <div className="category">
                <img src="/images/3.jpg" alt="Desinfectantes" />
                <h3>Desinfectantes</h3>
              </div>
              <div className="category">
                <img src="/images/4.jpg" alt="Accesorios de Limpieza" />
                <h3>Accesorios de Limpieza</h3>
              </div>

              <div className="category">
                <img src="/images/6.jpg" alt="Productos Ecológicos" />
                <h3>Productos Ecológicos</h3>
              </div>
              <div className="category">
                <img src="/images/7.jpg" alt="Tachos de Basura" />
                <h3>Tachos de Basura</h3>
              </div>
              <div className="category">
                <img src="/images/9.jpg" alt="Toallas de Papel" />
                <h3>Toallas</h3>
              </div>
              <div className="category">
                <img src="/images/8.jpg" alt="Papel Higiénico" />
                <h3>Papel Higiénico</h3>
              </div>
              <div className="category">
                <img src="/images/10.jpg" alt="Paños de Limpieza" />
                <h3>Paños de Limpieza</h3>
              </div>
              <div className="category">
                <img src="/images/11.jpg" alt="Dispensadores" />
                <h3>Dispensadores</h3>
              </div>
              <div className="category">
                <img src="/images/12.jpg" alt="Escobas y Recogedores" />
                <h3>Escobas y Recogedores</h3>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="why-us">
          <div className="container">
            <h2>¿Por Qué Elegir GRUPO RPC?</h2>
            <div className="why-us-grid">
              <div className="reason">
                <h4>Precios Competitivos</h4>
                <p>Los mejores precios del mercado con ofertas exclusivas para clientes frecuentes.</p>
              </div>
              <div className="reason">
                <h4>Atención Personalizada</h4>
                <p>Asesores dedicados que entienden sus necesidades y ofrecen soluciones a medida.</p>
              </div>
              <div className="reason">
                <h4>Entrega Rápida</h4>
                <p>Sistema logístico propio que garantiza entregas en 24-48 horas en la mayoría de zonas.</p>
              </div>
              <div className="reason">
                <h4>Productos Originales</h4>
                <p>Solo distribuimos productos de marcas reconocidas con certificaciones de calidad.</p>
              </div>
              <div className="reason">
                <h4>Factura Electrónica</h4>
                <p>Todos nuestros procesos están formalizados con facturación electrónica y contratos.</p>
              </div>
              <div className="reason">
                <h4>Garantía de Satisfacción</h4>
                <p>Si no está satisfecho, le devolvemos su dinero sin preguntas.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="testimonials">
          <div className="container">
            <h2>Lo que dicen nuestros clientes</h2>
            <div className="testimonials-grid">
              <div className="testimonial">
                <p>"Excelente servicio y productos de calidad. La entrega fue puntual y el precio muy competitivo."</p>
                <cite>- Susel,Casimiro - Gerente de la Empresa</cite>
              </div>
              <div className="testimonial">
                <p>"GRUPO RPC nos ha abastecido durante años. Siempre cumplen con lo prometido."</p>
                <cite>- Carlos Rodríguez, Distribuidora LimpiaTodo</cite>
              </div>
              <div className="testimonial">
                <p>"Los productos son de primera calidad y el soporte post-venta es excepcional."</p>
                <cite>- Ana López, Clínica San José</cite>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="cta">
          <div className="container">
            <h2>¡Comience a Comprar Hoy!</h2>
            <Link to="/login" className="cta-button">Accede a nuestros productos</Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
