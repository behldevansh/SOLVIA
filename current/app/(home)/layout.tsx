import Footer from "@/components/Footer";
import Navbar from "./_components/navbar";

const HomeLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  return ( 
    <div className="min-h-full dark:bg-[#1F1F1F]">
      <Navbar />
      <main className="min-h-full pt-40 ">
        {children}
      </main>
      <Footer />
    </div>
   );
}
 
export default HomeLayout;