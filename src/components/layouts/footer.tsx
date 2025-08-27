// src/components/Footer.tsx
import { FaFacebookF, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-10">
      <div className="container mx-auto grid grid-cols-12 gap-8">
        {/* Cột 1 */}
        <div className="col-span-5">
          <h2 className="text-xl font-bold mb-4">GenZStyle</h2>
          <p className="text-sm text-gray-400 mb-4">
            GenZStyle – cửa hàng giày thời trang dành cho giới trẻ. 
            Luôn cập nhật mẫu mới, đa dạng phong cách từ năng động đến sang trọng, 
            giúp bạn tự tin thể hiện cá tính trên từng bước chân.
          </p>
          <div className="flex space-x-4">
            <a
              href="#"
              className="p-2 rounded-full border border-gray-600 hover:bg-white hover:text-black transition"
            >
              <FaFacebookF />
            </a>
            <a
              href="#"
              className="p-2 rounded-full border border-gray-600 hover:bg-white hover:text-black transition"
            >
              <FaInstagram />
            </a>
          </div>
        </div>

        {/* Cột 2 */}
        <div className="col-span-5 flex flex-col items-center">
          <h3 className="text-lg mb-4">Subscribe for news latter</h3>
          <div className="flex w-full max-w-md">
            <input
              type="email"
              placeholder="Enter Email..."
              className="w-full px-4 py-2 text-black rounded-l-md focus:outline-none"
            />
            <button className="bg-white text-black px-4 rounded-r-md font-semibold hover:bg-gray-200">
              SUBSCRIBE
            </button>
          </div>
        </div>

        {/* Cột 3 */}
        <div className="col-span-2 text-right">
          <h3 className="text-lg mb-4">Quick Links</h3>
          <ul className="space-y-2 text-gray-400">
            <li>
              <a href="#" className="hover:text-white">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Shop
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Category
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Contact
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Privacy
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-10 border-t border-gray-700 pt-6 text-center text-gray-400 text-sm">
        www.GenzStyle.com © all right reserve
      </div>
    </footer>
  );
}