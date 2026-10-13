import NewArraivals from "./NewArraivals/NewArraivals";
import HotDeals from "./hotDeals/HotDeals";
import Discounted from "./discounted/Discounted";
import CarouselComponent from "@/components/clientPart/carousel/Carousel";
import SubCategorySlider from "./subCategories/SubCategorySlider";
import TrustFeatures from "@/components/clientPart/beforeFooter/TrustFeatures";

function Home() {
    return (
        <div className="min-h-screen ">
            {/* Hero Carousel */}
            <section className="relative overflow-hidden">
                <CarouselComponent />
            </section>

            {/* Sub-category slider — square image tiles */}
            <SubCategorySlider />

            {/* Product sections — horizontal scrollers, up to 8 products each */}
            <main className="">
                <section id="new-arrivals">
                    <NewArraivals />
                </section>

                <section id="hot-deals">
                    <HotDeals />
                </section>

                <section id="discounted">
                    <Discounted />
                </section>
            </main>

            {/* Call to Action Section */}
            <TrustFeatures />
        </div>
    );
}

export default Home;
