import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { createFileRoute, HeadContent } from '@tanstack/react-router'
import { ShieldIcon, SparklesIcon, UsersIcon, ZapIcon } from 'lucide-react'

export const Route = createFileRoute('/about')({
  head: () => ({
    meta: [{
      name: 'description',
      content: "About Campo Verde Homeowners Association"
    }, {title: "About Campo Verde Homeowners Association"}]
  }),
  component: AboutPage,
})

function AboutPage() {
  const features = [
    {
      icon: SparklesIcon,
      title: "Advanced AI Technology",
      description: "Powered by state-of-the-art diffusion models trained on millions of video clips",
    },
    {
      icon: ZapIcon,
      title: "Lightning Fast Generation",
      description: "Generate high-quality videos in seconds with our optimized inference pipeline",
    },
    {
      icon: ShieldIcon,
      title: "Safe & Responsible",
      description: "Built-in safety filters ensure all generated content meets community guidelines",
    },
    {
      icon: UsersIcon,
      title: "Community Driven",
      description: "Join thousands of creators sharing and discovering amazing AI-generated videos",
    },
  ]

  const stats = [
    { label: "Videos Generated", value: "2.5M+" },
    { label: "Active Users", value: "150K+" },
    { label: "Countries", value: "120+" },
    { label: "Avg. Generation Time", value: "3.2s" },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <HeadContent/>
      {/* Hero Section */}
      <div className="text-center mb-16">
        <Badge className="mb-4" variant="secondary">
          About Sora
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold mb-6">The Future of Video Creation</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Sora represents a breakthrough in AI-powered video generation, enabling anyone to create stunning,
          professional-quality videos from simple text descriptions. Our mission is to democratize video creation and
          unleash human creativity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
            <div className="text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">What Makes Sora Special</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-6">
              <CardContent className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Technology Section */}
      <div className="bg-muted/30 rounded-2xl p-8 md:p-12 mb-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Cutting-Edge Technology</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Sora is built on advanced transformer architecture and diffusion models, trained on a diverse dataset of
            videos and images. Our AI understands physics, lighting, and motion to create realistic and coherent video
            sequences.
          </p>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div>
              <h3 className="font-semibold mb-2">Transformer Architecture</h3>
              <p className="text-sm text-muted-foreground">
                Advanced attention mechanisms for understanding complex scene relationships
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Diffusion Models</h3>
              <p className="text-sm text-muted-foreground">
                State-of-the-art generative models for high-quality video synthesis
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Physics Simulation</h3>
              <p className="text-sm text-muted-foreground">
                Built-in understanding of real-world physics and motion dynamics
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-6">Built by Innovators</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Our team consists of world-class researchers and engineers from leading AI labs, united by the vision of
          making advanced video generation accessible to everyone.
        </p>
      </div>
    </div>
  )
}
