"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

// Chart.jsの全機能を登録
Chart.register(...registerables)

interface LineChartProps {
  data: number[]
  labels?: string[]
  color?: string
}

export function LineChart({ data, labels, color = "rgb(59, 130, 246)" }: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // 既存のチャートを破棄
    if (chartRef.current) {
      chartRef.current.destroy()
    }

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // デフォルトのラベルを生成
    const defaultLabels = Array.from({ length: data.length }, (_, i) => `${i + 1}`)

    // チャートを作成
    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels || defaultLabels,
        datasets: [
          {
            data,
            borderColor: color,
            backgroundColor: color + "20",
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
          },
        },
        scales: {
          x: {
            display: false,
          },
          y: {
            display: false,
            beginAtZero: true,
          },
        },
        elements: {
          point: {
            radius: 0,
          },
        },
      },
    })

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
      }
    }
  }, [data, labels, color])

  return <canvas ref={canvasRef} />
}

interface BarChartProps {
  data: { name: string; value: number }[]
  color?: string
}

export function BarChart({ data, color = "rgb(59, 130, 246)" }: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // 既存のチャートを破棄
    if (chartRef.current) {
      chartRef.current.destroy()
    }

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // チャートを作成
    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map(item => item.name),
        datasets: [
          {
            data: data.map(item => item.value),
            backgroundColor: color,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    })

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
      }
    }
  }, [data, color])

  return <canvas ref={canvasRef} />
}

interface PieChartProps {
  data: { name: string; value: number }[]
  colors?: string[]
}

export function PieChart({ data, colors }: PieChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // 既存のチャートを破棄
    if (chartRef.current) {
      chartRef.current.destroy()
    }

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // デフォルトの色を生成
    const defaultColors = [
      "rgb(59, 130, 246)",
      "rgb(16, 185, 129)",
      "rgb(249, 115, 22)",
      "rgb(236, 72, 153)",
      "rgb(139, 92, 246)",
    ]

    // チャートを作成
    chartRef.current = new Chart(ctx, {
      type: "pie",
      data: {
        labels: data.map(item => item.name),
        datasets: [
          {
            data: data.map(item => item.value),
            backgroundColor: colors || defaultColors,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
          },
        },
      },
    })

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
      }
    }
  }, [data, colors])

  return <canvas ref={canvasRef} />
} 