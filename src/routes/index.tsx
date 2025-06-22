import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { createFileRoute } from '@tanstack/react-router'
import { ClockIcon, DownloadIcon, PlayIcon, SparklesIcon } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const [prompt, setPrompt] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    // Simulate video generation
    setTimeout(() => {
      setGeneratedVideo("/placeholder.svg?height=400&width=600")
      setIsGenerating(false)
    }, 3000)
  }

  const examplePrompts = [
    "A serene lake at sunset with mountains in the background",
    "A bustling city street at night with neon lights",
    "A cat playing with a ball of yarn in slow motion",
    "Ocean waves crashing against rocky cliffs",
    "A field of sunflowers swaying in the wind",
  ]

  const featuredVideos = [
    {
      id: 1,
      prompt: "A golden retriever running through a field of flowers",
      thumbnail: "/placeholder.svg?height=200&width=300",
      duration: "4s",
    },
    {
      id: 2,
      prompt: "Northern lights dancing over a snowy landscape",
      thumbnail: "/placeholder.svg?height=200&width=300",
      duration: "6s",
    },
    {
      id: 3,
      prompt: "A hummingbird hovering near a red flower",
      thumbnail: "/placeholder.svg?height=200&width=300",
      duration: "3s",
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-sm font-medium mb-6">
          <SparklesIcon className="w-4 h-4 mr-2" />
          AI-Powered Video Generation
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Create videos from text
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Transform your imagination into stunning videos with our advanced AI technology. Simply describe what you want
          to see, and watch it come to life.
        </p>
      </div>

      {/* Generation Interface */}
      <div className="max-w-4xl mx-auto mb-16">
        <Card className="p-6">
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Describe your video</label>
              <Textarea
                placeholder="A majestic eagle soaring through mountain peaks at golden hour..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Try these:</span>
              {examplePrompts.slice(0, 3).map((example, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80"
                  onClick={() => setPrompt(example)}
                >
                  {example}
                </Badge>
              ))}
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  Generate Video
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Video Display */}
        {generatedVideo && (
          <Card className="mt-6 p-6">
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <PlayIcon className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Generated Video Preview</p>
                  <p className="text-sm text-muted-foreground mt-1">"{prompt}"</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    4s
                  </span>
                  <span>1080p</span>
                </div>
                <Button variant="outline" size="sm">
                  <DownloadIcon className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Featured Videos */}
      <div className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Featured Creations</h2>
          <p className="text-muted-foreground">Discover amazing videos created by our community</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {featuredVideos.map((video) => (
            <Card key={video.id} className="group cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="aspect-video bg-muted rounded-t-lg relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayIcon className="w-12 h-12 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-xs">
                      {video.duration}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">{video.prompt}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <SparklesIcon className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold mb-2">AI-Powered</h3>
          <p className="text-sm text-muted-foreground">
            Advanced AI technology creates stunning videos from simple text descriptions
          </p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <ClockIcon className="w-6 h-6 text-pink-600" />
          </div>
          <h3 className="font-semibold mb-2">Lightning Fast</h3>
          <p className="text-sm text-muted-foreground">Generate high-quality videos in seconds, not hours</p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <DownloadIcon className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold mb-2">High Quality</h3>
          <p className="text-sm text-muted-foreground">Export your videos in multiple formats and resolutions</p>
        </div>
      </div>
    </div>
  )
}
