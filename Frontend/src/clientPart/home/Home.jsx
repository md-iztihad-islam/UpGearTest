import NewArraivals from "./NewArraivals/NewArraivals";
import HotDeals from "./hotDeals/HotDeals";
import Discounted from "./discounted/Discounted";
import CarouselComponent from "@/components/clientPart/carousel/Carousel";
import EndSection from "@/components/clientPart/beforeFooter/EndSection";
import Subcategories from "./components/Subcategories";

function Home() {
    return (
        <div className="min-h-screen ">
            {/* Hero Carousel */}
            <section className="relative overflow-hidden">
                <CarouselComponent />
            </section>

            <section className="sm:w-hidden">
                <Subcategories />
            </section>

            {/* Featured Sections */}
            <main className="">
                <section id="new-arrivals">
                    <NewArraivals />
                </section>
                
                <section id="hot-deals" className="">
                    <HotDeals />
                </section>
                
                <section id="discounted">
                    <Discounted />
                </section>
            </main>

            {/* Call to Action Section */}
            <EndSection />
        </div>
    );
}

export default Home;