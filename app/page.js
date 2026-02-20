import { Button } from "@/components/ui/button";
import Image from "next/image";
import HeroSection from './dashboard/_components/HeroSection'

export default function Home() {
  return (<>
      <HeroSection />
      <div className='flex flex-col min-h-screen min-w-screen items-center justify-center'>
        <div className=' flex flex-col items-center justify-center'>
          <div className="flex flex-col items-center justify-center gap-3">
          <h1 className="text-2xl font-bold">Hi, I am Umang</h1>
          <h2>Web Developer</h2>
        </div>

        <Button className="mt-5">Subscribe</Button>
        </div>
      </div>
  </>
      
  );
}
