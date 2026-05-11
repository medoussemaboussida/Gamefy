import VirtualTour from "./vitrine/sections/VirtualTour";
import Header from "../components/Header";
import Footer from "../components/Footer";

const VirtualTourPage = () => {
    return (
        <>
            <Header />
            <main className="flex-grow">
                <VirtualTour />
            </main>
            <Footer />
        </>
    );
};

export default VirtualTourPage;
