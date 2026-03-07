import { useTranslation } from "react-i18next";
import { FaMapMarkerAlt, FaClock, FaPhoneAlt } from "react-icons/fa";

export default function StoreLocation() {
  const { t } = useTranslation("map");

  return (
    <section className="w-full bg-white py-16">
      <div className="max-w-screen-xl mx-auto px-6">
        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-semibold mb-2 flex items-center justify-center gap-2">
            <FaMapMarkerAlt className="text-black" />
            {t("title")}
          </h2>
          <p className="text-gray-500">{t("address")}</p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Map */}
          <div className="w-full h-[380px] rounded-2xl overflow-hidden shadow-lg">
            <iframe
              title="Store Location"
              src="https://www.google.com/maps?q=828%20Sư%20Vạn%20Hạnh,%20Quận%2010,%20TP.HCM&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">
                {t("storeName")}
              </h3>
              <p className="text-gray-600">
                {t("description")}
              </p>
            </div>

            <div className="space-y-3 text-gray-700">
              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="mt-1 text-black" />
                <p>
                  <strong>{t("labels.address")}:</strong>{" "}
                  {t("address")}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <FaClock className="mt-1 text-black" />
                <p>
                  <strong>{t("labels.openingHours")}:</strong>{" "}
                  {t("openingHours")}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <FaPhoneAlt className="mt-1 text-black" />
                <p>
                  <strong>{t("labels.hotline")}:</strong>{" "}
                  {t("hotline")}
                </p>
              </div>
            </div>

            <a
              href="https://www.google.com/maps?q=828%20Sư%20Vạn%20Hạnh,%20Quận%2010,%20TP.HCM"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition"
            >
              <FaMapMarkerAlt />
              {t("viewOnMap")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
