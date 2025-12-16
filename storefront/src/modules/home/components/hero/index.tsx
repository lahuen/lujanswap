import { Heading } from "@medusajs/ui"
import Image from "next/image"

const Hero = () => {
  return (
    <div className="h-[75vh] w-full border-b border-ui-border-base relative bg-ui-bg-subtle">
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center small:p-32 gap-6">
        <span>
          <Heading
            level="h1"
            className="text-3xl leading-10 text-ui-fg-base font-normal"
          >
            LUJAN SWAP
          </Heading>
          <Heading
            level="h2"
            className="text-3xl leading-10 text-ui-fg-subtle font-normal"
          >
            Es una plataforma de intercambio y comercio local de productos y servicios.
          </Heading>
        </span>

        <div className="relative w-full max-w-[600px] aspect-[16/9] rounded-xl overflow-hidden shadow-md my-4">
          <Image
            src="/intercambio_latino.png"
            alt="Intercambio de frutas y ropa en comunidad"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  )
}

export default Hero
