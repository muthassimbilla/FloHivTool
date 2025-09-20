"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, ArrowRight, Zap, Users, Building2, Sparkles } from "lucide-react"

interface PricingPlan {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  recommended?: boolean
  icon: React.ReactNode
  buttonText: string
  popular?: boolean
}

const pricingPlans: PricingPlan[] = [
  {
    name: "Starter",
    price: "$9",
    period: "/month",
    description: "Perfect for individuals getting started",
    features: [
      "Up to 1,000 requests per month",
      "Basic analytics dashboard",
      "Email support",
      "Standard API access",
      "Basic templates",
    ],
    icon: <Zap className="h-6 w-6" />,
    buttonText: "Start Free Trial",
  },
  {
    name: "Professional",
    price: "$29",
    period: "/month",
    description: "For growing businesses and teams",
    features: [
      "Up to 10,000 requests per month",
      "Advanced analytics & insights",
      "Priority email & chat support",
      "Full API access",
      "Premium templates",
      "Custom integrations",
      "Team collaboration tools",
    ],
    icon: <Users className="h-6 w-6" />,
    buttonText: "Upgrade to Pro",
    recommended: true,
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/month",
    description: "For large organizations with advanced needs",
    features: [
      "Unlimited requests",
      "Custom analytics dashboard",
      "24/7 phone & chat support",
      "Enterprise API access",
      "White-label solutions",
      "Advanced security features",
      "Dedicated account manager",
      "Custom SLA agreements",
    ],
    icon: <Building2 className="h-6 w-6" />,
    buttonText: "Contact Sales",
  },
]

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)

  const handlePurchase = async (plan: PricingPlan) => {
    const message = `🛒 New Purchase Request
    
Plan: ${plan.name}
Price: ${plan.price}${plan.period}
Features: ${plan.features.join(", ")}
    
Customer wants to purchase this plan. Please contact them for payment processing.`

    try {
      const response = await fetch("/api/telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          planName: plan.name,
          price: plan.price + plan.period,
        }),
      })

      if (response.ok) {
        alert("আপনার অর্ডার পাঠানো হয়েছে! আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।")
      } else {
        alert("কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।")
      }
    } catch (error) {
      console.error("Error sending to Telegram:", error)
      alert("কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary mb-6">
            <Sparkles className="h-4 w-4" />
            <span>New</span>
            <span className="text-muted-foreground">Introducing Advanced Features</span>
            <ArrowRight className="h-4 w-4" />
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">Plans and Pricing</h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Get started immediately for free. Upgrade for more features, usage and collaboration.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAnnual ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className={`text-sm ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>Annual</span>
            {isAnnual && (
              <Badge variant="secondary" className="ml-2">
                Save 20%
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.recommended ? "border-primary shadow-lg shadow-primary/20 scale-105" : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Recommended</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <div className="flex items-center justify-center mb-4">
                  <div
                    className={`p-3 rounded-full ${
                      plan.recommended ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {plan.icon}
                  </div>
                </div>

                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-muted-foreground">{plan.description}</CardDescription>

                <div className="flex items-baseline justify-center gap-1 mt-6">
                  <span className="text-4xl font-bold">
                    {isAnnual && plan.price !== "Custom"
                      ? `$${Math.round(Number.parseInt(plan.price.replace("$", "")) * 0.8)}`
                      : plan.price}
                  </span>
                  <span className="text-muted-foreground">{isAnnual ? "/year" : plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </CardContent>

              <CardFooter>
                <Button
                  onClick={() => handlePurchase(plan)}
                  className={`w-full ${
                    plan.recommended
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                >
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Enterprise Section */}
        <div className="mt-16 text-center">
          <Card className="max-w-4xl mx-auto bg-muted/30">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Need something custom?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                We offer custom solutions for enterprise clients with specific requirements. Contact our sales team to
                discuss your needs.
              </p>
              <Button variant="outline" size="lg">
                Contact Sales Team
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
