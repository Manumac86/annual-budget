"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  BarChart3,
  Calendar,
  PieChart,
  TrendingUp,
  Zap,
  Shield,
  Clock,
  CreditCard,
  Target,
  Lock,
  Globe,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import {
  BookOpen,
  Settings,
  Repeat2,
  FileText,
  User,
} from "@/components/shared/icon-components";
import { AnimatedElement } from "@/components/shared/animated-element";
import { GradientOrb } from "@/components/shared/gradient-orb";
import Image from "next/image";

export default function Home() {
  const { userId } = useAuth();

  // If user is signed in, redirect to dashboard
  if (userId) {
    redirect("/dashboard");
  }
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: Repeat2,
      title: "Recurring",
      subtitle: "Automated",
      description: "Manage recurring transactions automatically",
    },
    {
      icon: Calendar,
      title: "Calendar",
      subtitle: "Planning",
      description: "Monthly calendar view for transaction planning",
    },
    {
      icon: BarChart3,
      title: "Dashboard",
      subtitle: "Overview",
      description: "Annual summary with comprehensive insights",
    },
    {
      icon: User,
      title: "Account",
      subtitle: "Profile",
      description: "Complete account and profile management",
    },
    {
      icon: PieChart,
      title: "50/30/20",
      subtitle: "Budgeting",
      description: "Apply the 50/30/20 budgeting rule",
    },
    {
      icon: BarChart3,
      title: "Breakdown",
      subtitle: "Analytics",
      description: "Detailed expense category breakdown",
    },
    {
      icon: Target,
      title: "Savings Planner",
      subtitle: "Goals",
      description: "Plan and track your savings goals",
    },
    {
      icon: TrendingUp,
      title: "Net Worth",
      subtitle: "Wealth",
      description: "Track your complete net worth over time",
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Header Navigation */}
      <header className="fixed top-0 w-full z-50 border-b border-border/40 backdrop-blur-md bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <AnimatedElement variant="slideRight">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-secondary to-primary/60 flex items-center justify-center">
                <Image
                  src="/logo_bflow.png"
                  alt="logo"
                  width={192}
                  height={192}
                  priority
                  className="rounded-lg"
                />
              </div>
              <span className="font-semibold text-lg">BudgetFlow</span>
            </div>
          </AnimatedElement>
          <AnimatedElement variant="slideLeft" delay={100}>
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="#features"
                className="hover:text-primary transition-colors"
              >
                Features
              </Link>
              <Link
                href="#security"
                className="hover:text-primary transition-colors"
              >
                Security
              </Link>
              <Link
                href="/sign-up"
                className="hover:text-primary transition-colors"
              >
                <Button className="gap-2 bg-primary hover:bg-primary/90">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </nav>
          </AnimatedElement>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <GradientOrb className="top-10 left-0 w-96 h-96 from-primary/15 to-transparent" />
        <GradientOrb className="bottom-0 right-0 w-96 h-96 from-accent/15 to-transparent" />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedElement variant="fadeUp">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-sm font-medium">
                    <Zap className="w-4 h-4" />
                    Smart Financial Management
                  </div>
                  <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-balance">
                    Master Your Annual
                    <span className="block text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">
                      Budget Like Never Before
                    </span>
                  </h1>
                </div>
                <p className="text-xl text-muted-foreground text-balance">
                  Comprehensive annual budgeting with EU compliance, smart
                  analytics, and real-time expense tracking. Take control of
                  your finances with intelligent insights.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Button
                    size="lg"
                    className="gap-2 bg-primary hover:bg-primary/90"
                  >
                    Start Free Trial <ArrowRight className="w-5 h-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 hover:bg-secondary bg-transparent"
                  >
                    Watch Demo <Globe className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </AnimatedElement>

            <AnimatedElement variant="slideLeft" delay={200}>
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-accent/20 rounded-2xl blur-3xl" />
                <div className="relative bg-card border border-border rounded-2xl p-8 backdrop-blur-sm">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
                      <span className="text-sm font-medium">
                        Monthly Budget
                      </span>
                      <span className="text-2xl font-bold text-primary">
                        €5,000
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        {
                          label: "Essential",
                          value: "50%",
                          color: "from-primary",
                        },
                        {
                          label: "Personal",
                          value: "30%",
                          color: "from-accent",
                        },
                        {
                          label: "Savings",
                          value: "20%",
                          color: "from-secondary",
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="p-3 bg-secondary/50 rounded-lg text-center"
                        >
                          <div
                            className={`h-1 bg-linear-to-r ${item.color} rounded-full mb-2`}
                          />
                          <p className="text-xs text-muted-foreground">
                            {item.label}
                          </p>
                          <p className="font-bold text-primary">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Spent</span>
                        <span className="font-semibold">€2,450</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full w-1/2 bg-linear-to-r from-primary to-accent rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedElement>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section
        id="features"
        className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-border/40"
      >
        <GradientOrb className="top-1/3 -left-48 w-96 h-96 from-accent/10 to-transparent" />

        <div className="max-w-7xl mx-auto relative z-10">
          <AnimatedElement>
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                Powerful Features
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need for comprehensive annual budget management,
                all in one platform
              </p>
            </div>
          </AnimatedElement>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <AnimatedElement key={idx} delay={idx * 50} variant="fadeUp">
                  <Card className="h-full p-6 hover:border-primary/50 hover:bg-card/50 transition-all duration-300 group cursor-pointer">
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-lg bg-linear-to-br from-primary/20 to-accent/10 flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/20 transition-colors">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                          {feature.subtitle}
                        </p>
                        <h3 className="text-lg font-semibold mt-1">
                          {feature.title}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </Card>
                </AnimatedElement>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <GradientOrb className="bottom-1/4 right-0 w-96 h-96 from-primary/15 to-transparent" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedElement>
              <div className="space-y-6">
                <h2 className="text-4xl font-bold tracking-tight">
                  Why Choose BudgetFlow?
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      title: "EU Compliant & Secure",
                      desc: "GDPR-compliant with enterprise-grade encryption",
                    },
                    {
                      title: "Real-time Analytics",
                      desc: "Instant insights into your spending patterns",
                    },
                    {
                      title: "Multi-currency Support",
                      desc: "Manage budgets in any global currency",
                    },
                    {
                      title: "Automated Tracking",
                      desc: "Sync with recurring transactions automatically",
                    },
                  ].map((item, idx) => (
                    <AnimatedElement
                      key={idx}
                      delay={idx * 100}
                      variant="slideRight"
                    >
                      <div className="flex gap-4 items-start">
                        <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-1" />
                        <div>
                          <h4 className="font-semibold">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    </AnimatedElement>
                  ))}
                </div>
              </div>
            </AnimatedElement>

            <AnimatedElement variant="slideLeft" delay={200}>
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-accent/20 rounded-2xl blur-3xl" />
                <Card className="relative p-8 bg-card/80 backdrop-blur-sm border-primary/20">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg">
                      <Shield className="w-8 h-8 text-primary" />
                      <div>
                        <p className="font-semibold text-sm">
                          Bank-Level Security
                        </p>
                        <p className="text-xs text-muted-foreground">
                          256-bit encryption
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-accent/10 rounded-lg">
                      <Lock className="w-8 h-8 text-accent" />
                      <div>
                        <p className="font-semibold text-sm">GDPR Compliant</p>
                        <p className="text-xs text-muted-foreground">
                          EU regulations
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
                      <Globe className="w-8 h-8 text-secondary-foreground" />
                      <div>
                        <p className="font-semibold text-sm">Global Access</p>
                        <p className="text-xs text-muted-foreground">
                          Available worldwide
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </AnimatedElement>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section
        id="security"
        className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-border/40"
      >
        <div className="max-w-4xl mx-auto relative z-10">
          <AnimatedElement>
            <div className="text-center mb-12 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Lock className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">
                  Security & Compliance
                </span>
              </div>
              <h2 className="text-4xl font-bold tracking-tight">
                Your Data, Protected
              </h2>
              <p className="text-muted-foreground text-lg">
                We take security and compliance seriously. BudgetFlow meets all
                EU regulations and international standards.
              </p>
            </div>
          </AnimatedElement>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {[
              {
                icon: Shield,
                title: "GDPR Compliant",
                items: ["Data protection", "User rights", "Privacy policy"],
              },
              {
                icon: Lock,
                title: "End-to-End Encryption",
                items: ["AES-256", "TLS 1.3", "Secure storage"],
              },
              {
                icon: Clock,
                title: "Regular Audits",
                items: ["Security testing", "Compliance checks", "Updates"],
              },
            ].map((section, idx) => {
              const Icon = section.icon;
              return (
                <AnimatedElement key={idx} delay={idx * 100} variant="fadeUp">
                  <Card className="p-6 text-center hover:border-primary/50 transition-colors">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-3">{section.title}</h3>
                    <ul className="space-y-2">
                      {section.items.map((item) => (
                        <li
                          key={item}
                          className="text-sm text-muted-foreground"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </AnimatedElement>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-border/40">
        <GradientOrb className="top-0 left-1/2 -translate-x-1/2 w-96 h-96 from-primary/20 to-accent/10" />

        <div className="max-w-4xl mx-auto relative z-10">
          <AnimatedElement>
            <div className="text-center space-y-6 py-12">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                Ready to Take Control?
              </h2>
              <p className="text-xl text-muted-foreground">
                Start your free trial today. No credit card required.
              </p>
              <div className="flex flex-wrap gap-4 justify-center pt-4">
                <Link
                  href="/sign-up"
                  className="hover:text-primary transition-colors"
                >
                  <Button
                    size="lg"
                    className="gap-2 bg-primary hover:bg-primary/90 px-8"
                  >
                    Get Started Now <ChevronRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link
                  href="https://calendar.app.google/LZzkgQqTUzXhgakn6"
                  className="hover:text-primary transition-colors"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-8 hover:bg-secondary bg-transparent"
                  >
                    Schedule Demo
                  </Button>
                </Link>
              </div>
            </div>
          </AnimatedElement>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="font-semibold">BudgetFlow</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Smart budgeting for everyone
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/privacy" className="hover:text-foreground transition">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground transition">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-sm text-muted-foreground">
                GDPR Compliant • EU Based
              </p>
            </div>
          </div>
          <div className="border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
            <p>
              © 2025 - Created by{" "}
              <Link href="https://collybrix.com">Collybrix</Link>. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
