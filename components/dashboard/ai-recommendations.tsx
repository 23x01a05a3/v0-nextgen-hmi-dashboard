"use client"

import { motion } from "framer-motion"
import { Bot, Lightbulb, TrendingUp, Wrench, Zap, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useHmi } from "@/lib/hmi-context"

export function AIRecommendations() {
  const { aiRecommendations, executeMitigation } = useHmi()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20 glow-blue">
            <Bot className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground tracking-wider uppercase text-sm font-mono">Cognitive Diagnostics</h2>
            <p className="text-[10px] text-muted-foreground font-mono">SCADA AI Copilot • Reactive Insights</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-6 h-6 rounded-full border-2 border-primary/20 border-t-primary"
        />
      </div>

      {/* Recommendations */}
      <div className="divide-y divide-border/20">
        {aiRecommendations.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground font-mono">
            Analyzing telemetry logs...
          </div>
        ) : (
          aiRecommendations.map((rec, index) => (
            <RecommendationItem
              key={rec.id}
              recommendation={rec}
              index={index}
              onExecute={() => executeMitigation(rec.id)}
            />
          ))
        )}
      </div>
    </motion.div>
  )
}

function RecommendationItem({
  recommendation,
  index,
  onExecute,
}: {
  recommendation: any
  index: number
  onExecute: () => void
}) {
  const typeConfig = {
    optimization: {
      icon: TrendingUp,
      bg: "bg-green-500/10",
      iconColor: "text-green-500",
    },
    maintenance: {
      icon: Wrench,
      bg: "bg-yellow-500/10",
      iconColor: "text-yellow-500",
    },
    efficiency: {
      icon: Zap,
      bg: "bg-cyan-500/10",
      iconColor: "text-cyan-500",
    },
    alert: {
      icon: Lightbulb,
      bg: "bg-red-500/10",
      iconColor: "text-red-500",
    },
  }

  const impactColors = {
    high: "bg-red-500/20 text-red-500 border border-red-500/30",
    medium: "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30",
    low: "bg-green-500/20 text-green-500 border border-green-500/30",
  }

  const config = typeConfig[recommendation.type as "optimization" | "maintenance" | "efficiency" | "alert"] || typeConfig.efficiency
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(5, index) * 0.05 }}
      className="p-4 hover:bg-secondary/20 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-lg flex-shrink-0 border border-border/10", config.bg)}>
          <Icon className={cn("w-4 h-4", config.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="font-semibold text-foreground text-xs font-mono">{recommendation.title}</p>
            <span
              className={cn(
                "px-1.5 py-0.2 text-[9px] font-mono font-bold rounded capitalize",
                impactColors[recommendation.impact as "high" | "medium" | "low"]
              )}
            >
              {recommendation.impact}
            </span>
            {recommendation.confidence && (
              <span className="text-[10px] text-muted-foreground/60 font-mono">
                {recommendation.confidence}% conf
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {recommendation.description}
          </p>
          <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
            <div>
              {recommendation.savings && (
                <p className="text-[11px] text-green-400 font-bold font-mono">
                  Est. Savings: {recommendation.savings}
                </p>
              )}
              {recommendation.affectedSystem && (
                <p className="text-[9px] text-muted-foreground font-mono">
                  Node: {recommendation.affectedSystem}
                </p>
              )}
            </div>

            {recommendation.mitigationAction && (
              <button
                onClick={onExecute}
                className="px-2.5 py-1 text-[10px] font-mono font-bold rounded bg-primary/20 text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all uppercase tracking-wider flex items-center gap-1 shadow-lg glow-blue"
              >
                <span>Engage Mitigation</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

