import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createFileRoute } from '@tanstack/react-router'
import { FilterIcon, PlayIcon, SearchIcon } from 'lucide-react'

export const Route = createFileRoute('/gallery')({
  component: GalleryPage,
})

function GalleryPage() {
  const videos = [
    {
      id: 1,
      prompt: "A majestic dragon flying over a medieval castle at sunset",
      thumbnail: "/placeholder.svg?height=200&width=300",
      duration: "8s",
      category: "Fantasy",
    },
    {
      id: 2,
      prompt: "Underwater coral reef with colorful fish swimming",
      thumbnail: "/placeholder.svg?height=200&width=300",
      duration: "6s",
      category: "Nature",
    },
    {
      id: 3,
      prompt: "Futuristic city with flying cars and neon lights",
      thumbnail: "/placeholder.svg?height=200&width=300",
      duration: "10s",
      category: "Sci-Fi",
    },
    {
      id: 4,
      prompt: "A peaceful zen garden with falling cherry blossoms",
      thumbnail: "/placeholder.svg?height=200&width=300",
      duration: "5s",
      category: "Nature",
    },
    {
      id: 5,
      prompt: "Space station orbiting Earth with astronauts working",
      thumbnail: "/placeholder.svg?height=200&width=300",
      duration: "12s",
      category: "Sci-Fi",
    },
    {
      id: 6,
      prompt: "Ancient library with floating books and magical light",
      thumbnail: "/placeholder.svg?height=200&width=300",
      duration: "7s",
      category: "Fantasy",
    },
  ]

  const categories = ["All", "Nature", "Fantasy", "Sci-Fi", "Abstract"]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Video Gallery</h1>
        <p className="text-muted-foreground mb-6">Explore thousands of AI-generated videos created by our community</p>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Search videos..." className="pl-10" />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <FilterIcon className="w-4 h-4" />
            Filter
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={category === "All" ? "default" : "secondary"}
              className="cursor-pointer hover:bg-primary/80"
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video) => (
          <Card
            key={video.id}
            className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          >
            <CardContent className="p-0">
              <div className="aspect-video bg-muted rounded-t-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <PlayIcon className="w-12 h-12 text-white" />
                </div>
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-xs">
                    {video.category}
                  </Badge>
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

      <div className="text-center mt-12">
        <Button variant="outline" size="lg">
          Load More Videos
        </Button>
      </div>
    </div>
  )
}
