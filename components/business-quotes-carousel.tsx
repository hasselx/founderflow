"use client"

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Card } from "@/components/ui/card"

interface Quote {
  text: string
  author: string
}

const quotes: Quote[] = [
  {
    text: "Content is king, but distribution is God",
    author: "Mukesh Ambani",
  },
  {
    text: "Business success rests on the 5Ts: TAM sets the potential, Team drives the mission, Timing ignites the start, Traction fuels the growth, and Technology powers the future.",
    author: "Anupam Mittal",
  },
  {
    text: "Chase the vision, not the money; the money will end up following you.",
    author: "Tony Hsieh, Zappos CEO",
  },
  {
    text: "Ideas are easy. Implementation is hard.",
    author: "Guy Kawasaki, Entrepreneur",
  },
  {
    text: "The way to get started is to quit talking and start doing.",
    author: "Walt Disney",
  },
  {
    text: "Your most unhappy customers are your greatest source of learning.",
    author: "Bill Gates",
  },
]

export function BusinessQuotesCarousel() {
  return (
    <div className="w-full space-y-2">
      <h3 className="text-base font-semibold text-foreground">Business Insights & Wisdom</h3>
      <Carousel opts={{ loop: true }} className="w-full px-12">
        <CarouselContent>
          {quotes.map((quote, index) => (
            <CarouselItem key={index} className="basis-full">
              <Card className="p-4 h-full flex flex-col justify-between bg-muted/50 hover:bg-muted/70 transition-colors min-h-[200px]">
                <blockquote className="space-y-2">
                  <p className="text-xs italic text-foreground whitespace-pre-line">{quote.text}</p>
                  <cite className="text-xs text-muted-foreground font-medium not-italic">— {quote.author}</cite>
                </blockquote>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2" />
        <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2" />
      </Carousel>
    </div>
  )
}
