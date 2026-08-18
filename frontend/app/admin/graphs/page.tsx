"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler
);

const COLORS = {
  primary: "#17c788",
  navy: "#0d1432",
  green2: "#4ade88",
  amber: "#f59e0b",
  red: "#ef4444",
  purple: "#8b5cf6",
  cyan: "#06b6d4",
};

const cardClass = "rounded-xl bg-white shadow-sm border border-gray-100 p-6";

export default function GraphsPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: () => api.get("/admin/dashboard/stats").then((r) => r.data),
  });

  const { data: charts, isLoading: chartsLoading } = useQuery({
    queryKey: ["admin-dashboard-charts"],
    queryFn: () => api.get("/admin/dashboard/charts").then((r) => r.data),
  });

  const loading = statsLoading || chartsLoading;

  const statusDistribution = {
    labels: ["Available", "Sold Out"],
    datasets: [
      {
        data: [
          charts?.available ?? stats?.available ?? 0,
          charts?.sold ?? stats?.sold ?? 0,
        ],
        backgroundColor: [COLORS.primary, COLORS.navy],
        borderWidth: 0,
      },
    ],
  };

  const typeDistribution = {
    labels: ["For Rent", "For Sale"],
    datasets: [
      {
        label: "Properties",
        data: [
          charts?.forRent ?? stats?.forRent ?? 0,
          charts?.forSale ?? stats?.forSale ?? 0,
        ],
        backgroundColor: [COLORS.cyan, COLORS.primary],
        borderRadius: 6,
      },
    ],
  };

  const userDistribution = {
    labels: ["Users", "Agents", "Builders"],
    datasets: [
      {
        data: [
          charts?.users ?? stats?.users ?? 0,
          charts?.agents ?? stats?.agents ?? 0,
          charts?.builders ?? stats?.builders ?? 0,
        ],
        backgroundColor: [COLORS.primary, COLORS.purple, COLORS.amber],
        borderWidth: 0,
      },
    ],
  };

  const propertyOverview = {
    labels: ["Total", "Available", "Sold", "For Rent", "For Sale", "Pending"],
    datasets: [
      {
        label: "Properties",
        data: [
          charts?.total ?? stats?.total ?? 0,
          charts?.available ?? stats?.available ?? 0,
          charts?.sold ?? stats?.sold ?? 0,
          charts?.forRent ?? stats?.forRent ?? 0,
          charts?.forSale ?? stats?.forSale ?? 0,
          charts?.pending ?? stats?.pending ?? 0,
        ],
        backgroundColor: [
          COLORS.navy,
          COLORS.primary,
          COLORS.red,
          COLORS.cyan,
          COLORS.green2,
          COLORS.amber,
        ],
        borderRadius: 6,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" as const, labels: { padding: 16, usePointStyle: true } },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: "#f3f4f6" } },
      x: { grid: { display: false } },
    },
  };

  if (loading) {
    return (
      <div className="bg-gray-50 p-6 min-h-screen">
        <div className="flex justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#17c788] border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <h1 className="text-2xl font-bold text-[#0d1432] mb-6">Analytics &amp; Graphs</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={cardClass}>
          <h2 className="text-lg font-semibold text-[#0d1432] mb-4">Property Status Distribution</h2>
          <div className="h-[300px] flex items-center justify-center">
            <Doughnut data={statusDistribution} options={doughnutOptions} />
          </div>
        </div>

        <div className={cardClass}>
          <h2 className="text-lg font-semibold text-[#0d1432] mb-4">Properties by Type</h2>
          <div className="h-[300px]">
            <Bar data={typeDistribution} options={barOptions} />
          </div>
        </div>

        <div className={cardClass}>
          <h2 className="text-lg font-semibold text-[#0d1432] mb-4">User Distribution</h2>
          <div className="h-[300px] flex items-center justify-center">
            <Doughnut data={userDistribution} options={doughnutOptions} />
          </div>
        </div>

        <div className={cardClass}>
          <h2 className="text-lg font-semibold text-[#0d1432] mb-4">Property Overview</h2>
          <div className="h-[300px]">
            <Bar data={propertyOverview} options={barOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}