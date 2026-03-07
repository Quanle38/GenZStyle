export default function PaymentSummary() {
  return (
    <div className="space-y-6">
      {/* PAYMENT FORM */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Payment
        </h3>

        <div className="space-y-4">
          <input
            className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm focus:border-black focus:ring-0"
            placeholder="Cardholder name"
          />

          <input
            className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm focus:border-black focus:ring-0"
            placeholder="Card number"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              className="rounded-md border border-gray-300 px-4 py-3 text-sm focus:border-black focus:ring-0"
              placeholder="MM / YY"
            />
            <input
              className="rounded-md border border-gray-300 px-4 py-3 text-sm focus:border-black focus:ring-0"
              placeholder="CVV"
            />
          </div>

          <button className="mt-4 w-full rounded-md bg-black py-3 text-sm font-medium text-white hover:opacity-90 transition">
            Pay now
          </button>
        </div>
      </div>

      {/* ORDER SUMMARY */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">
          Order summary
        </h4>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>2.500.000 ₫</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Shipping</span>
            <span>0 ₫</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Discount</span>
            <span>-200.000 ₫</span>
          </div>

          <div className="mt-3 border-t border-gray-200 pt-3 flex justify-between font-semibold text-gray-900">
            <span>Total</span>
            <span>2.300.000 ₫</span>
          </div>
        </div>
      </div>
    </div>
  );
}