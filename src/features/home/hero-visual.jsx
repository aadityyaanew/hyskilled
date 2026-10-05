import Image from "next/image";

export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-2xl animate-float-slow drop-shadow-2xl lg:scale-110 xl:scale-125 xl:-translate-x-6" aria-hidden>
      <Image
        src="/brand/herodesktop.svg"
        alt="Learn and grow with Hyskilled"
        width={1535}
        height={1025}
        priority
        className="h-auto w-full object-contain"
      />
    </div>
  );
}
