"use client"

import { motion } from "framer-motion"
import { Bot, Lightbulb, TrendingUp, Wrench, Zap, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface AIRecommendation {
  id: string
  type: "optimization" | "maintenance" | "efficiency" | "alert"
  title: string
  description: string
  impact: "high" | "medium" | "low"
  savings?: string
}

const recommendations: AIRecommendation[] = [
  {
    id: "1",
    type: "optimization",
    title: "Optimize Cooling Cycle",
    description: "AI detected inefficient cooling patterns in Unit 2. Adjusting timing could reduce energy by 15%.",
    impact: "high",
    savings: "$2,400/month",
  },
  {
    id: "2",
    type: "maintenance",
    title: "Predictive Maintenance Alert",
    description: "Motor M7 showing early signs of bearing wear. Schedule maintenance within 14 days.",
    impact: "high",
  },
  {
    id: "3",
    type: "efficiency",
    title: "Load Balancing Opportunity",
    description: "Redistribute workload across production lines to improve throughput by 8%.",
    impact: "medium",
    savings: "$1,200/month",
  },
  {
    id: "4",
    type: "alert",
    title: "Anomaly Detection",
    description: "Unusual vibration pattern detected in Conveyor A3. Monitor closely.",
    impact: "low",
  },
]

export function AIRecommendations() {
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
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">AI Recommendations</h2>
            <p className="text-xs text-muted-foreground">Powered by Machine Learning</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary"
        />
      </div>

      {/* Recommendations */}
      <div className="divide-y divide-border/30">
        {recommendations.map((rec, index) => (
          <RecommendationItem key={rec.id} recommendation={rec} index={index} />
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border/50 bg-secondary/30">
        <button className="w-full flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
          View All AI Insights
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

function RecommendationItem({
  recommendation,
  index,
}: {
  recommendation: AIRecommendation
  index: number
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
      bg: "bg-blue-500/10",
      iconColor: "text-blue-500",
    },
  }

  const impactColors = {
    high: "bg-red-500/20 text-red-500",
    medium: "bg-yellow-500/20 text-yellow-500",
    low: "bg-green-500/20 text-green-500",
  }

  const config = typeConfig[recommendation.type]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-4 hover:bg-secondary/30 transition-colors cursor-pointer group"
    >
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-lg flex-shrink-0", config.bg)}>
          <Icon className={cn("w-5 h-5", config.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-foreground text-sm">{recommendation.title}</p>
            <span
              className={cn(
                "px-1.5 py-0.5 text-[10px] font-bold rounded capitalize",
                impactColors[recommendation.impact]
              )}
            >
              {recommendation.impact}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {recommendation.description}
          </p>
          {recommendation.savings && (
            <p className="text-xs text-green-500 font-medium mt-2">
              Potential savings: {recommendation.savings}
            </p>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.div>
  )
}
