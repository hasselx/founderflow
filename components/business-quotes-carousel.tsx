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
    text: "5T Framework for Business Success:\n\n1. TAM (Total Addressable Market) – Most important factor in the success of a business.\n\n2. Team – Very important as you can't do everything yourself.\n\n3. Timing – Very important as it can help you get started.\n\n4. Traction – Month on month growth.\n\n5. Technology – Every business has to use technology to grow their business.",
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
    <div className="w-full space-y-3">
      <h3 className="text-lg font-semibold text-foreground">Business Insights & Wisdom</h3>
      <Carousel opts={{ loop: true }} className="w-full px-12">
        <CarouselContent>
          {quotes.map((quote, index) => (
            <CarouselItem key={index} className="basis-full">
              <Card className="p-6 h-full flex flex-col justify-between bg-muted/50 hover:bg-muted/70 transition-colors min-h-[300px]">
                <blockquote className="space-y-3">
                  <p className="text-sm italic text-foreground whitespace-pre-line">{quote.text}</p>
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
