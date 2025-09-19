// src/components/Footer.tsx
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation("footer");

  return (
    <footer className="bg-black text-white py-10">
      <div className="w-full max-w-screen-xl mx-auto grid grid-cols-12 gap-8 px-8">
        {/* Cột 1 */}
        <div className="col-span-5">
          <h2 className="text-xl font-bold mb-4">{t("brandTitle")}</h2>
          <p className="text-sm text-gray-400 mb-4">
            {t("brandDescription")}
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
        <div className="col-span-4 flex flex-col items-center">
          <h3 className="text-lg mb-4">{t("subscribeTitle")}</h3>
          <div className="flex w-full max-w-md">
            <input
              type="email"
              placeholder={t("subscribePlaceholder")}
              className="w-full px-4 py-2 text-black rounded-l-md focus:outline-none"
            />
            <button className="bg-white text-black px-4 rounded-r-md font-semibold hover:bg-gray-200">
              {t("subscribeButton")}
            </button>
          </div>
        </div>

        {/* Cột 3 */}
        <div className="col-span-3 text-right">
          <h3 className="text-lg mb-4">{t("quickLinksTitle")}</h3>
          <ul className="space-y-2 text-gray-400">
            <li>
              <a href="#" className="hover:text-white">
                {t("quickLinksHome")}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                {t("quickLinksShop")}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                {t("quickLinksCategory")}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                {t("quickLinksContact")}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                {t("quickLinksPrivacy")}
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-10 border-t border-gray-700 pt-6 text-center text-gray-400 text-sm">
        {t("bottomText")}
      </div>
    </footer>
  );
}
