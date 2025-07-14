"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Image from 'next/image';
import {
  yearlyAstronautCounts,
  spaceMilestones,
  getMaxPeopleInSpace,
  getTotalPeopleEverInSpace,
  getAverageByDecade
} from '@/services/historicalAstronautData';
import {
  History,
  Milestone,
  ChartBar,
  ChartLine,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Info
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Define types for chart data
interface ChartDataSet {
  line: ChartData<'line'>;
  bar: ChartData<'bar'>;
}

export function HistoricalAstronauts() {
  const [activeChart, setActiveChart] = useState<'line' | 'bar'>('line');
  const [showMilestones, setShowMilestones] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<number | null>(null);
  const [chartData, setChartData] = useState<ChartDataSet | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Chart options
  const chartOptions: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Número de personas',
          color: '#94a3b8',
        },
        grid: {
          color: 'rgba(71, 85, 105, 0.2)',
        },
        ticks: {
          color: '#94a3b8',
        }
      },
      x: {
        grid: {
          color: 'rgba(71, 85, 105, 0.2)',
        },
        ticks: {
          color: '#94a3b8',
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#e2e8f0'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        titleColor: '#f8fafc',
        bodyColor: '#f1f5f9',
        borderColor: '#0f172a',
        borderWidth: 1,
      }
    },
  };

  // Prepare chart data
  useEffect(() => {
    // Line chart data
    const lineChartData: ChartData<'line'> = {
      labels: yearlyAstronautCounts.map(year => year.year),
      datasets: [
        {
          label: 'Total',
          data: yearlyAstronautCounts.map(year => year.total),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          fill: true,
          tension: 0.2,
        },
        {
          label: 'ISS',
          data: yearlyAstronautCounts.map(year => year.iss),
          borderColor: '#22c55e',
          backgroundColor: 'transparent',
          tension: 0.2,
        },
        {
          label: 'Mir',
          data: yearlyAstronautCounts.map(year => year.mir || 0),
          borderColor: '#eab308',
          backgroundColor: 'transparent',
          tension: 0.2,
        },
        {
          label: 'Tiangong',
          data: yearlyAstronautCounts.map(year => year.tiangong || 0),
          borderColor: '#ef4444',
          backgroundColor: 'transparent',
          tension: 0.2,
        }
      ]
    };

    // Bar chart data (by decade)
    const decadeData = getAverageByDecade();
    const barChartData: ChartData<'bar'> = {
      labels: decadeData.map(item => item.decade),
      datasets: [
        {
          label: 'Promedio de astronautas por década',
          data: decadeData.map(item => item.average),
          backgroundColor: [
            'rgba(59, 130, 246, 0.7)',
            'rgba(139, 92, 246, 0.7)',
            'rgba(236, 72, 153, 0.7)',
            'rgba(234, 179, 8, 0.7)',
            'rgba(34, 197, 94, 0.7)',
            'rgba(239, 68, 68, 0.7)',
            'rgba(20, 184, 166, 0.7)',
          ],
          borderColor: 'rgba(15, 23, 42, 0.5)',
          borderWidth: 1,
        }
      ]
    };

    setChartData({
      line: lineChartData,
      bar: barChartData
    });
  }, []);

  // Scroll timeline to selected milestone
  useEffect(() => {
    if (selectedMilestone !== null && timelineRef.current) {
      const milestoneElement = document.getElementById(`milestone-${selectedMilestone}`);
      if (milestoneElement) {
        const containerRect = timelineRef.current.getBoundingClientRect();
        const milestoneRect = milestoneElement.getBoundingClientRect();

        // Calculate position to center the milestone
        const scrollPosition = (milestoneElement.offsetLeft + (milestoneRect.width / 2)) - (containerRect.width / 2);

        timelineRef.current.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedMilestone]);

  // Navigate through milestones
  const navigateMilestone = (direction: 'next' | 'prev') => {
    if (selectedMilestone === null) {
      setSelectedMilestone(0);
      return;
    }

    if (direction === 'next') {
      setSelectedMilestone(prev => (prev === spaceMilestones.length - 1) ? 0 : prev! + 1);
    } else {
      setSelectedMilestone(prev => (prev === 0) ? spaceMilestones.length - 1 : prev! - 1);
    }
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-blue-950 to-indigo-900 border-none shadow-xl">
      <div className="absolute w-full h-full top-0 left-0">
        <div className="stars"></div>
        <div className="stars2"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-blue-300" />
              Historia de Humanos en el Espacio
            </h2>
            <p className="text-blue-300 text-xs sm:text-sm mt-1">
              Datos históricos de personas en el espacio a lo largo del tiempo
            </p>
          </div>

          <div className="flex mt-2 sm:mt-0 space-x-2">
            <Button
              variant={activeChart === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveChart('line')}
              className={activeChart === 'line' ? 'bg-blue-600' : 'text-blue-300 border-blue-400/30'}
            >
              <ChartLine className="w-4 h-4 mr-1" />
              Línea
            </Button>

            <Button
              variant={activeChart === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveChart('bar')}
              className={activeChart === 'bar' ? 'bg-blue-600' : 'text-blue-300 border-blue-400/30'}
            >
              <ChartBar className="w-4 h-4 mr-1" />
              Barras
            </Button>

            <Button
              variant={showMilestones ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowMilestones(!showMilestones)}
              className={showMilestones ? 'bg-indigo-600' : 'text-blue-300 border-blue-400/30'}
            >
              <Milestone className="w-4 h-4 mr-1" />
              Hitos
            </Button>
          </div>
        </div>

        {/* Destacados estadísticos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-900/30 backdrop-blur-sm rounded-lg p-4 border border-blue-800/30">
            <div className="text-xs text-blue-300 mb-1">Personas en el espacio actualmente</div>
            <div className="flex items-baseline">
              <span className="text-white text-2xl font-bold">12</span>
              <span className="text-green-400 text-sm ml-2">Récord histórico</span>
            </div>
          </div>

          <div className="bg-blue-900/30 backdrop-blur-sm rounded-lg p-4 border border-blue-800/30">
            <div className="text-xs text-blue-300 mb-1">Personas que han viajado al espacio</div>
            <div className="flex items-baseline">
              <span className="text-white text-2xl font-bold">{getTotalPeopleEverInSpace()}</span>
              <span className="text-blue-300 text-sm ml-2">Aproximadamente</span>
            </div>
          </div>

          <div className="bg-blue-900/30 backdrop-blur-sm rounded-lg p-4 border border-blue-800/30">
            <div className="text-xs text-blue-300 mb-1">Presencia humana continua en el espacio</div>
            <div className="flex items-baseline">
              <span className="text-white text-2xl font-bold">23</span>
              <span className="text-blue-300 text-sm ml-2">Años</span>
            </div>
          </div>
        </div>

        {/* Área del gráfico */}
        <div className="bg-blue-900/20 backdrop-blur-sm rounded-lg border border-blue-800/30 p-4 mb-6">
          <div className="h-[300px] sm:h-[400px]">
            {chartData ? (
              activeChart === 'line' ? (
                <Line data={chartData.line} options={chartOptions} />
              ) : (
                <Bar data={chartData.bar} options={chartOptions} />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
        </div>

        {/* Hitos espaciales */}
        <AnimatePresence>
          {showMilestones && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <div className="bg-indigo-900/20 backdrop-blur-sm rounded-lg border border-indigo-800/30 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-md font-semibold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-300" />
                    Hitos Importantes en la Exploración Espacial
                  </h3>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigateMilestone('prev')}
                      className="h-8 w-8 text-gray-300 hover:text-white hover:bg-indigo-800/30"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigateMilestone('next')}
                      className="h-8 w-8 text-gray-300 hover:text-white hover:bg-indigo-800/30"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Detalle del hito seleccionado */}
                {selectedMilestone !== null && (
                  <div className="mb-6">
                    <div className="flex flex-col md:flex-row gap-4 bg-indigo-950/40 rounded-lg p-4">
                      <div className="md:w-1/3">
                        <div className="rounded-lg overflow-hidden h-[200px] bg-indigo-900/30">
                          <Image
                            src={spaceMilestones[selectedMilestone].image || ''}
                            alt={spaceMilestones[selectedMilestone].event}
                            className="w-full h-full object-cover"
                            width={400}
                            height={200}
                          />
                        </div>
                      </div>
                      <div className="md:w-2/3">
                        <div className="text-xs text-indigo-300 mb-1">
                          {new Date(spaceMilestones[selectedMilestone].date).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                        <h4 className="text-xl font-semibold text-white">
                          {spaceMilestones[selectedMilestone].event}
                        </h4>
                        <p className="text-gray-300 text-sm mt-2">
                          {spaceMilestones[selectedMilestone].description}
                        </p>
                        {spaceMilestones[selectedMilestone].astronauts && (
                          <div className="mt-3">
                            <h5 className="text-sm font-medium text-indigo-300">Astronautas:</h5>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {spaceMilestones[selectedMilestone].astronauts!.map((astronaut, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-indigo-900/50 text-white px-2 py-1 rounded"
                                >
                                  {astronaut}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Línea de tiempo horizontal */}
                <div
                  ref={timelineRef}
                  className="overflow-x-auto pb-3 hide-scrollbar"
                >
                  <div className="flex space-x-3 min-w-max">
                    {spaceMilestones.map((milestone, index) => (
                      <div
                        id={`milestone-${index}`}
                        key={index}
                        className={`
                          flex-none w-[150px] rounded-lg p-3 cursor-pointer transition-all duration-200
                          ${selectedMilestone === index
                            ? 'bg-indigo-700/60 border-indigo-500'
                            : 'bg-indigo-900/30 hover:bg-indigo-800/40 border-transparent'}
                          border
                        `}
                        onClick={() => setSelectedMilestone(index)}
                      >
                        <div className="text-xs font-medium text-indigo-300">
                          {milestone.date.split('-')[0]}
                        </div>
                        <div className="text-sm text-white mt-1">
                          {milestone.event}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nota al pie */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Info className="w-3 h-3" />
          <span>Datos históricos aproximados compilados de NASA, Roscosmos, ESA y CNSA.</span>
        </div>
      </div>
    </Card>
  );
}
