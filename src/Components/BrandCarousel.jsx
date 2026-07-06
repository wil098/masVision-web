import { useState, useEffect, useRef } from "react"

export const logos = [
  "https://gildieyewear.com/wp-content/uploads/GildiEyewearLogo.png",
  "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Ray-Ban_logo.svg/2880px-Ray-Ban_logo.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/e/e2/CK_Calvin_Klein_logo.svg",
]

const BrandCarousel = () => {
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(3)
  const total = logos.length
  const carouselRef = useRef(null)

  const extendedLogos = [...logos, ...logos]

  useEffect(() => {
    const updateVisible = () => {
      const width = window.innerWidth
      if (width < 640) setVisible(1)
      else if (width < 1024) setVisible(2)
      else setVisible(3)
    }

    updateVisible()
    window.addEventListener("resize", updateVisible)
    return () => window.removeEventListener("resize", updateVisible)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => prev + 1)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (current === total) {
      setTimeout(() => {
        if (carouselRef.current) {
          carouselRef.current.style.transition = "none"
        }
        setCurrent(0)
        setTimeout(() => {
          if (carouselRef.current) {
            carouselRef.current.style.transition = ""
          }
        }, 50)
      }, 700)
    }
  }, [current, total])

  return (
    <section className="w-full py-8 bg-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-center text-2xl font-bold mb-6">
          Marcas de Confianza
        </h2>
        <div className="overflow-hidden w-full max-w-4xl mx-auto">
          <div
            ref={carouselRef}
            className="flex transition-transform duration-700 ease-in-out"
            style={{
              width: `${(extendedLogos.length / visible) * 100}%`,
              transform: `translateX(-${
                (100 / extendedLogos.length) * current
              }%)`,
            }}
          >
            {extendedLogos.map((logo, idx) => (
              <div
                key={idx}
                style={{ width: `${100 / extendedLogos.length}%` }}
                className="flex justify-center items-center"
              >
                <img
                  src={logo}
                  alt={`Logo ${idx + 1}`}
                  className="h-16 object-contain grayscale hover:grayscale-0 transition-all"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default BrandCarousel