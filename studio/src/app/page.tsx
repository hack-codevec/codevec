"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import ParticleSystem from "@/components/ui/particle-system"
import InteractiveDemo from "@/components/ui/interactive-demo"
import {
  ArrowRight,
  Github,
  MessageSquare,
  Code,
  Zap,
  Users,
  BookOpen,
  Star,
  GitBranch,
  Brain,
  Rocket,
  ChevronDown,
  Play,
  Sparkles,
  TrendingUp,
  Clock,
  Target,
} from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"

export default function HomePage() {
  const router = useRouter()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [visibleSections, setVisibleSections] = useState(new Set())
  const [typedText, setTypedText] = useState("")
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({})
  const heroRef = useRef<HTMLElement>(null)

  const fullText = "Chat with any GitHub repository using AI"

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]))
          }
        })
      },
      { threshold: 0.1 },
    )

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1))
        i++
      } else {
        clearInterval(timer)
      }
    }, 100)

    return () => clearInterval(timer)
  }, [])

  const navigateToLogin = () => {
    router.push("/login")
  }

  const scrollToSection = (sectionId: string) => {
    sectionRefs.current[sectionId]?.scrollIntoView({
      behavior: "smooth",
    })
  }

  const features = [
    {
      icon: <Github className="h-8 w-8" />,
      title: "GitHub Integration",
      description: "Connect to any public repository instantly",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI-Powered Analysis",
      description: "Deep understanding of code structure and logic",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Lightning Fast",
      description: "Get answers in seconds, not hours",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: <Code className="h-8 w-8" />,
      title: "Multi-Language",
      description: "Support for all major programming languages",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Smart Documentation",
      description: "Auto-generate comprehensive documentation",
      color: "from-indigo-500 to-purple-500",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Team Collaboration",
      description: "Perfect for onboarding and knowledge sharing",
      color: "from-pink-500 to-rose-500",
    },
  ]

  const stats = [
    { number: "10K+", label: "Repositories Analyzed", icon: <GitBranch className="h-6 w-6" /> },
    { number: "50K+", label: "Questions Answered", icon: <MessageSquare className="h-6 w-6" /> },
    { number: "99.9%", label: "Uptime", icon: <TrendingUp className="h-6 w-6" /> },
    { number: "<2s", label: "Average Response", icon: <Clock className="h-6 w-6" /> },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden select-none">
      <ParticleSystem />

   
 
      {/* Cursor Glow Effect */}
      <div
        className="fixed w-96 h-96 pointer-events-none z-0 opacity-20"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
          background: `radial-gradient(circle, var(--accent) 0%, transparent 70%)`,
          filter: "blur(40px)",
        }}
        />

      {/* Hero Section */}
      <section
        ref={(el) => {
          sectionRefs.current["hero"] = el
          heroRef.current = el
        }}
        id="hero"
        className="relative min-h-screen flex flex-col items-center justify-center section-padding hero-gradient"
        >
        <div className="absolute top-4 right-4 z-20">
          <ThemeToggle />
        </div>
        
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="text-center max-w-6xl px-4 z-10 relative">
          <div className="mb-8">
            <span className="inline-flex items-center px-6 py-3 rounded-full glass-morphism text-accent text-sm font-medium">
              <Sparkles className="h-4 w-4 mr-2" />🏆 Hackathon Winner • Open Source
            </span>
          </div>

          <h1 className="hero-title text-7xl md:text-9xl font-black mb-8 leading-none">
            Code<span className="gradient-text">Vec</span>
          </h1>

          <div className="text-2xl md:text-4xl text-muted-foreground mb-4 h-16 flex items-center justify-center">
            <span className="typing-animation font-mono">{typedText}</span>
          </div>

          <p className="text-xl md:text-2xl text-muted-foreground/80 leading-relaxed mb-12 max-w-4xl mx-auto">
            Understand any codebase instantly. Generate documentation. Onboard faster.
            <br />
            <span className="text-accent font-semibold">No assumptions. Just pure code intelligence.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button
              onClick={navigateToLogin}
              size="lg"
              className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-white px-12 py-6 text-xl font-bold rounded-full group transform hover:scale-105 transition-all duration-300"
            >
              <Play className="mr-3 h-6 w-6" />
              Start Exploring
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="px-12 py-6 text-xl font-bold rounded-full glass-morphism hover:bg-accent/10 group bg-transparent"
              onClick={() => window.open("https://github.com/hack-codevec/codevec.git", "_blank")}
            >
              <Github className="mr-3 h-6 w-6" />
              View Source
              <Star className="ml-3 h-5 w-5 group-hover:fill-current transition-all" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`text-center glass-morphism p-6 rounded-2xl interactive-card ${
                  visibleSections.has("hero") ? "animate-scale-in" : "opacity-0"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-accent mb-2 flex justify-center">{stat.icon}</div>
                <div className="text-3xl font-bold mb-1">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer animate-bounce"
          onClick={() => scrollToSection("demo")}
        >
          <ChevronDown className="h-8 w-8 text-accent" />
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section
        ref={(el) => {
          sectionRefs.current["demo"] = el
        }}
        id="demo"
        className="section-padding bg-gradient-to-b from-background to-muted/20"
      >
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-16 ${visibleSections.has("demo") ? "animate-scale-in" : "opacity-0"}`}>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              See the <span className="gradient-text">Magic</span>
            </h2>
            <p className="text-2xl text-muted-foreground max-w-3xl mx-auto">
              Watch CodeVec analyze real repositories and provide intelligent insights
            </p>
          </div>

          <div className={`${visibleSections.has("demo") ? "animate-slide-in-left" : "opacity-0"}`}>
            <InteractiveDemo />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section
        ref={(el) => {
          sectionRefs.current["features"] = el
        }}
        id="features"
        className="section-padding"
      >
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-20 ${visibleSections.has("features") ? "animate-scale-in" : "opacity-0"}`}>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Powerful <span className="gradient-text">Features</span>
            </h2>
            <p className="text-2xl text-muted-foreground">Everything you need to master any codebase</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`interactive-card glass-morphism border-0 group overflow-hidden ${
                  visibleSections.has("features") ? "animate-scale-in" : "opacity-0"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-8 relative">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  ></div>

                  <div
                    className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${feature.color} text-white rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    {feature.icon}
                  </div>

                  <h3 className="text-2xl font-bold mb-4 group-hover:text-accent transition-colors">{feature.title}</h3>

                  <p className="text-muted-foreground text-lg leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        ref={(el) => {
          sectionRefs.current["code"] = el
        }}
        id="code"
        className="section-padding bg-gradient-to-b from-muted/20 to-background"
      >
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 ${visibleSections.has("code") ? "animate-scale-in" : "opacity-0"}`}>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Simple <span className="gradient-text">Process</span>
            </h2>
            <p className="text-2xl text-muted-foreground">Get started in just two easy steps</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className={`${visibleSections.has("code") ? "animate-slide-in-left" : "opacity-0"}`}>
              <Card className="glass-morphism p-8 interactive-card">
                <div className="space-y-6">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-accent to-primary rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                      1
                    </div>
                    <h3 className="text-2xl font-bold">Paste Repository URL</h3>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 border-2 border-dashed border-accent/30">
                    <div className="flex items-center space-x-3">
                      <Github className="h-5 w-5 text-accent" />
                      <input
                        type="text"
                        placeholder="https://github.com/facebook/react"
                        className="flex-1 bg-transparent border-none outline-none text-foreground placeholder-muted-foreground"
                        disabled
                      />
                      <Button size="sm" className="bg-accent hover:bg-accent/90">
                        Analyze
                      </Button>
                    </div>
                  </div>

                  <p className="text-muted-foreground">
                    Simply paste any public GitHub repository URL and we'll analyze it for you
                  </p>
                </div>
              </Card>
            </div>

            <div className={`${visibleSections.has("code") ? "animate-slide-in-right" : "opacity-0"}`}>
              <Card className="glass-morphism p-8 interactive-card">
                <div className="space-y-6">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                      2
                    </div>
                    <h3 className="text-2xl font-bold">Start Chatting</h3>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="h-4 w-4 text-accent" />
                      </div>
                      <div className="bg-accent/10 rounded-lg p-3 flex-1">
                        <p className="text-sm">How does the useState hook work?</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Brain className="h-4 w-4 text-primary" />
                      </div>
                      <div className="bg-primary/10 rounded-lg p-3 flex-1">
                        <p className="text-sm">The useState hook creates a state variable...</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-muted-foreground">
                    Ask questions about the codebase and get intelligent, contextual answers
                  </p>
                </div>
              </Card>
            </div>
          </div>

          <div className={`text-center mt-16 ${visibleSections.has("code") ? "animate-scale-in" : "opacity-0"}`}>
            <div className="inline-flex items-center space-x-8 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full px-8 py-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-accent" />
                <span className="font-medium">No Setup Required</span>
              </div>
              <div className="w-1 h-6 bg-border"></div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="font-medium">Instant Analysis</span>
              </div>
              <div className="w-1 h-6 bg-border"></div>
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-accent" />
                <span className="font-medium">Accurate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        ref={(el) => {
          sectionRefs.current["cta"] = el
        }}
        id="cta"
        className="section-padding relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-primary/10 to-accent/10"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className={`${visibleSections.has("cta") ? "animate-scale-in" : "opacity-0"}`}>
            <h2 className="text-5xl md:text-7xl font-bold mb-8">
              Ready to <span className="gradient-text">Revolutionize</span>
              <br />
              Your Workflow?
            </h2>

            <p className="text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Join thousands of developers who are already using CodeVec to understand code faster
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                onClick={navigateToLogin}
                size="lg"
                className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-white px-12 py-6 text-xl font-bold rounded-full group animate-glow transform hover:scale-105 transition-all duration-300"
              >
                <Rocket className="mr-3 h-6 w-6" />
                Launch CodeVec
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="px-12 py-6 text-xl font-bold rounded-full glass-morphism group bg-transparent"
                onClick={() => scrollToSection("hero")}
              >
                <Target className="mr-3 h-6 w-6" />
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/10 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h3 className="text-3xl font-bold mb-4">
              Code<span className="gradient-text">Vec</span>
            </h3>
            <p className="text-muted-foreground mb-8 text-lg">The future of code understanding is here</p>

            <div className="flex justify-center space-x-8">
              <a href="https://github.com/hack-codevec/codevec.git" target="_blank">

              <Button variant="ghost" size="lg" className="group">
                <Github className="h-5 w-5 mr-2 group-hover:text-accent transition-colors" />
                GitHub
              </Button>
              </a>
              <a href="https://github.com/hack-codevec/codevec.git" target="_blank">
              <Button variant="ghost" size="lg" className="group">
                <GitBranch className="h-5 w-5 mr-2 group-hover:text-accent transition-colors" />
                Contribute
              </Button>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
