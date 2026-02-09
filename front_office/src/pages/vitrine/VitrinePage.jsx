import Hero from "./sections/Hero";
import Partners from "./sections/Partners";
import TournamentAndRooms from "./sections/TournamentAndRooms";
import Coaches from "./sections/Coaches";
import BlogSection from "./sections/BlogSection";
import Newsletter from "./sections/Newsletter";

const VitrinePage = () => {
    return (
        <div>
            <Hero />
            <TournamentAndRooms />
            <Coaches />
            <BlogSection />
            <Newsletter />
        </div>
    );
};

export default VitrinePage;
