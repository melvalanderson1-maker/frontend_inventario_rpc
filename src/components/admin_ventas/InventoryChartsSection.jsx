import { useEffect, useState, useMemo } from "react";
import api from "../../api/api";
import { Line } from "react-chartjs-2";

import "./InventoryChartsSection.css";

import ChartDataLabels from "chartjs-plugin-datalabels";
import { Chart as ChartJS } from "chart.js";

ChartJS.register(ChartDataLabels);

export default function InventoryChartsSection() {

  const [resumenAnual, setResumenAnual] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentMonthIndex = new Date().getMonth();

  /* ================= FORMAT 🔥 ================= */
  const formatK = (value) => {
    if (value >= 1000) {
      return (value / 1000).toFixed(1).replace(".0", "") + "K";
    }
    return value;
  };

  /* ================= LOAD ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const year = new Date().getFullYear();
        const res = await api.get(`/api/dashboard/resumen-anual?anio=${year}`);
        setResumenAnual(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* ================= DATA ================= */
  const { labels, valores, entradas, salidas } = useMemo(() => {

    const ordenado = [...resumenAnual].sort((a, b) =>
      a.mes.localeCompare(b.mes)
    );

    const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

    return {
      labels: ordenado.map(r => {
        const i = Number(r.mes.split("-")[1]) - 1;
        return meses[i];
      }),
      valores: ordenado.map(r => Number(r.valor)),
      entradas: ordenado.map(r => Number(r.entradas)),
      salidas: ordenado.map(r => Number(r.salidas))
    };

  }, [resumenAnual]);

  /* ================= OPTIONS ================= */
  const baseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    layout: {
      padding: { top: 40 }
    },

    interaction: {
      mode: "index",
      intersect: false
    },

    plugins: {
      legend: {
        position: "bottom", // 🔥 MOVIDO ABAJO
        labels: {
          color: "#374151",
          font: { size: 13 },
          boxWidth: 20
        }
      },

      tooltip: {
        callbacks: {
          title: (items) => labels[items[0].dataIndex],
          label: (ctx) => {
            const isCurrent = ctx.dataIndex === currentMonthIndex;

            return `S/ ${
              isCurrent
                ? new Intl.NumberFormat("es-PE").format(ctx.raw)
                : formatK(ctx.raw)
            }`;
          }
        }
      },

      datalabels: {
        display: true,
        anchor: "end",
        align: "top",
        clamp: true,
        clip: false,

        offset: (ctx) =>
          ctx.dataIndex === currentMonthIndex ? 12 : 6,

        color: "#111827",

        font: (ctx) => {
          const isCurrent = ctx.dataIndex === currentMonthIndex;

          return {
            weight: "bold",
            size: isCurrent ? 16 : 10
          };
        },

        formatter: (value, ctx) => {
          const isCurrent = ctx.dataIndex === currentMonthIndex;

          return isCurrent
            ? new Intl.NumberFormat("es-PE").format(value)
            : formatK(value); // 🔥 SIEMPRE CON K
        }
      }
    },

    scales: {
      x: {
        grid: { display: false },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 6
        }
      },

      y: {
        grid: { color: "#e5e7eb" },
        ticks: {
          callback: (value) => formatK(value) // 🔥 TAMBIÉN AQUÍ
        }
      }
    }
  };

  if (loading) return <div className="charts-loading">Cargando gráficos...</div>;

  return (
    <div className="charts-layout">

      <div className="chart-card big">
        <h3> Valor inventario</h3>

        <div className="chart-body big-chart">
          <Line
            data={{
              labels,
              datasets: [{
                label: "Valor (S/)",
                data: valores,
                borderColor: "#16a34a",
                backgroundColor: "rgba(22,163,74,0.15)",
                borderWidth: 3,
                tension: 0.4,
                fill: true,

                pointRadius: (ctx) =>
                  ctx.dataIndex === currentMonthIndex ? 7 : 4
              }]
            }}
            options={baseChartOptions}
          />
        </div>
      </div>

      <div className="charts-right">

        <div className="chart-card small">
          <h3>Entradas</h3>
          <div className="chart-body small-chart">
            <Line
              data={{
                labels,
                datasets: [{
                  label: "Entradas",
                  data: entradas,
                  borderColor: "#2563eb",
                  backgroundColor: "rgba(37,99,235,0.15)",
                  tension: 0.4,
                  fill: true
                }]
              }}
              options={baseChartOptions}
            />
          </div>
        </div>

        <div className="chart-card small">
          <h3>Salidas</h3>
          <div className="chart-body small-chart">
            <Line
              data={{
                labels,
                datasets: [{
                  label: "Salidas",
                  data: salidas,
                  borderColor: "#dc2626",
                  backgroundColor: "rgba(220,38,38,0.15)",
                  tension: 0.4,
                  fill: true
                }]
              }}
              options={baseChartOptions}
            />
          </div>
        </div>

      </div>
    </div>
  );
}