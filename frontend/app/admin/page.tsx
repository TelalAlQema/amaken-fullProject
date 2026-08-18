"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Users,
  Home,
  TrendingDown,
  Clock,
  FileText,
  CheckCircle,
  Shield,
  UserCheck,
  Building2,
  MessageSquare,
} from "lucide-react";
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
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
);

interface StatsData {
  adminCount: number;
  userCount: number;
  agentCount: number;
  builderCount: number;
  totalProperties: number;
  availableProperties: number;
  soldOutProperties: number;
  forRent: number;
  forSale: number;
  pendingApproval: number;
  totalLeads: number;
  totalContacts: number;
  totalFeedback: number;
  totalCities: number;
  totalStates: number;
  totalTeamMembers: number;
  totalAboutEntries: number;
}

interface ChartDataResponse {
  total: number;
  available: number;
  sold: number;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
}

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-7 w-16 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 h-5 w-40 animate-pulse rounded bg-gray-200" />
      <div className="h-64 animate-pulse rounded bg-gray-100" />
    </div>
  );
}

function StatCard({ title, value, icon, iconBg }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBg}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data: statsData, isLoading: statsLoading } = useQuery<StatsData>({
    queryKey: ["admin-stats"],
    queryFn: () =>
      api.get("/admin/dashboard/stats").then((r) => r.data.data),
  });

  const { data: chartData, isLoading: chartLoading } =
    useQuery<ChartDataResponse>({
      queryKey: ["admin-charts"],
      queryFn: () =>
        api.get("/admin/dashboard/charts").then((r) => r.data.data),
    });

  const isLoading = statsLoading || chartLoading;

  const doughnutData = chartData
    ? {
        labels: ["Available", "Sold"],
        datasets: [
          {
            data: [chartData.available, chartData.sold],
            backgroundColor: ["#17c788", "#ef4444"],
            borderWidth: 0,
          },
        ],
      }
    : null;

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyleWidth: 10,
          font: { size: 13 },
        },
      },
    },
    cutout: "65%",
  };

  const barData = statsData
    ? {
        labels: ["Available", "Sold", "For Rent", "For Sale"],
        datasets: [
          {
            label: "Properties",
            data: [
              statsData.availableProperties,
              statsData.soldOutProperties,
              statsData.forRent,
              statsData.forSale,
            ],
            backgroundColor: ["#17c788", "#ef4444", "#8b5cf6", "#f97316"],
            borderRadius: 6,
          },
        ],
      }
    : null;

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: { size: 12 },
        },
        grid: { color: "#f3f4f6" },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 12 } },
      },
    },
  };

  const stats = statsData
    ? [
        {
          title: "Total Users",
          value:
            (statsData.userCount || 0) +
            (statsData.agentCount || 0) +
            (statsData.builderCount || 0),
          icon: <Users className="h-6 w-6 text-green-600" />,
          iconBg: "bg-green-50",
        },
        {
          title: "Total Properties",
          value: statsData.totalProperties,
          icon: <Home className="h-6 w-6 text-blue-600" />,
          iconBg: "bg-blue-50",
        },
        {
          title: "Available",
          value: statsData.availableProperties,
          icon: <CheckCircle className="h-6 w-6 text-green-600" />,
          iconBg: "bg-green-50",
        },
        {
          title: "Sold Out",
          value: statsData.soldOutProperties,
          icon: <TrendingDown className="h-6 w-6 text-red-600" />,
          iconBg: "bg-red-50",
        },
        {
          title: "For Rent",
          value: statsData.forRent,
          icon: <Home className="h-6 w-6 text-purple-600" />,
          iconBg: "bg-purple-50",
        },
        {
          title: "For Sale",
          value: statsData.forSale,
          icon: <Home className="h-6 w-6 text-orange-600" />,
          iconBg: "bg-orange-50",
        },
        {
          title: "Pending Approval",
          value: statsData.pendingApproval,
          icon: <Clock className="h-6 w-6 text-yellow-600" />,
          iconBg: "bg-yellow-50",
        },
        {
          title: "Total Leads",
          value: statsData.totalLeads,
          icon: <FileText className="h-6 w-6 text-cyan-600" />,
          iconBg: "bg-cyan-50",
        },
      ]
    : [];

  const quickStats = statsData
    ? [
        {
          title: "Admins",
          value: statsData.adminCount,
          icon: <Shield className="h-5 w-5 text-primary" />,
          iconBg: "bg-green-50",
        },
        {
          title: "Agents",
          value: statsData.agentCount,
          icon: <UserCheck className="h-5 w-5 text-primary" />,
          iconBg: "bg-green-50",
        },
        {
          title: "Builders",
          value: statsData.builderCount,
          icon: <Building2 className="h-5 w-5 text-primary" />,
          iconBg: "bg-green-50",
        },
        {
          title: "Total Feedback",
          value: statsData.totalFeedback,
          icon: <MessageSquare className="h-5 w-5 text-primary" />,
          iconBg: "bg-green-50",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Overview of your platform
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          : stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {isLoading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Property Overview
              </h2>
              <div className="h-72">
                {doughnutData && (
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                )}
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Properties by Status &amp; Type
              </h2>
              <div className="h-72">
                {barData && <Bar data={barData} options={barOptions} />}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          : quickStats.map((stat) => (
              <div
                key={stat.title}
                className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${stat.iconBg}`}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{stat.title}</p>
                    <p className="text-lg font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
