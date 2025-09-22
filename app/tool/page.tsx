"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Smartphone, ArrowRight, Code, Settings, Shield, Star, Clock, Users } from "lucide-react"
import Link from "next/link"

const tools = [
  {
    name: "Flo Hiv Tool",
    features: [
      "Generate realistic iOS & Android user agents",
      "Support for Instagram & Facebook apps",
      "Advanced customization options",
      "Custom headers and parameters",
    ],
    href: "/tool/user-agent-generator",
    icon: Smartphone,
    category: "Mobile Development",
    status: "Active",
    color: "from-blue-500 to-indigo-600",
    users: "12.5K+",
    rating: 4.9,
    tags: ["iOS & Android", "Social Media", "Custom Headers"],
  },
  {
    name: "Duplicate Checker",
    features: [
      "Test and debug REST APIs easily",
      "Advanced request building tools",
      "Response analysis and validation",
      "Automated testing capabilities",
    ],
    href: "/tool/api-tester",
    icon: Code,
    category: "Development",
    status: "Coming Soon",
    color: "from-emerald-500 to-teal-600",
    users: "Coming Soon",
    rating: null,
    tags: ["REST APIs", "Authentication", "Bulk Testing"],
  },
  {
    name: "Address Generator",
    features: [
      "Generate framework configuration files",
      "Support for popular deployment platforms",
      "Development environment setup",
      "Docker and CI/CD configurations",
    ],
    href: "/tool/config-generator",
    icon: Settings,
    category: "DevOps",
    status: "Coming Soon",
    color: "from-purple-500 to-pink-600",
    users: "Coming Soon",
    rating: null,
    tags: ["Docker", "CI/CD", "Cloud Deploy"],
  },
]

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20" />
        <div className="absolute top-1/4 -left-64 w-96 h-96 bg-blue-200/30 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 -right-64 w-96 h-96 bg-indigo-200/30 dark:bg-indigo-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Tools Grid */}
      <section className="px-6 pb-20 pt-16 lg:pt-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((tool, index) => {
              const IconComponent = tool.icon
              const isActive = tool.status === "Active"

              return (
                <div
                  key={tool.name}
                  className="group cursor-pointer h-full"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Card className="h-full flex flex-col bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20 group overflow-hidden relative hover:-translate-y-2">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                    />

                    <CardHeader className="pb-6 relative">
                      <div className="flex items-start justify-between mb-6">
                        <div
                          className={`p-4 rounded-2xl bg-gradient-to-br ${tool.color} shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
                        >
                          <IconComponent className="w-7 h-7 text-white" />
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <Badge
                            variant={isActive ? "default" : "secondary"}
                            className={`${
                              isActive
                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700"
                                : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700"
                            } font-semibold px-3 py-1`}
                          >
                            {tool.status}
                          </Badge>
                          {tool.rating && (
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold text-slate-900 dark:text-white">{tool.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 mb-2">
                        {tool.name}
                      </CardTitle>

                      <div className="flex items-center gap-2 mb-4">
                        <Badge
                          variant="outline"
                          className="text-xs font-medium border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-400"
                        >
                          {tool.category}
                        </Badge>
                        {isActive && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <Users className="w-3 h-3" />
                            {tool.users}
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0 relative flex-1 flex flex-col justify-between">
                      <div className="mb-6">
                        <ul className="space-y-2">
                          {tool.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                              <span className="text-sm leading-relaxed">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {tool.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-700 font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {isActive ? (
                          <Link href={tool.href}>
                            <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white group-hover:scale-[1.02] transition-all duration-300 font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl">
                              <span className="flex items-center justify-center gap-2">
                                <Shield className="w-4 h-4" />
                                Launch Tool
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                              </span>
                            </Button>
                          </Link>
                        ) : (
                          <Button
                            disabled
                            className="w-full py-3 rounded-xl font-semibold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            Coming Soon
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>

          {/* Call to action */}
          <div className="text-center mt-20">
            <div className="max-w-2xl mx-auto p-8 rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Need a custom tool?</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Can't find what you're looking for? Let us know what tool would help your workflow.
              </p>
              <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                Request a Tool
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
