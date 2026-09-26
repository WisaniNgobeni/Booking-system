import { PolicyPage } from "../../lib/policy-page";
import { pageMetadata } from "../../lib/seo";
export const metadata = pageMetadata({
    title: "Refund and cancellation policy",
    description: "Understand Smallbean subscription cancellations and how appointment cancellations and refunds are handled by each business.",
    path: "/refund-and-cancellation",
});
export default function RefundPage() {
    return <PolicyPage eyebrow="Payments and cancellations" title="Refund & Cancellation Policy" intro="This policy applies to Smallbean subscriptions and distinguishes them from services or bookings offered by businesses through the platform." sections={[
        { title: "1. Subscription cancellation", paragraphs: ["A business with a paid Smallbean subscription can manage its billing and cancellation through the billing-management option available in its account. The payment provider's billing portal may allow cancellation at the end of the current billing period, subject to the terms presented there.", "Cancelling a subscription does not normally reverse charges already incurred or grant a refund for time already used, unless required by law or expressly stated in the purchase flow."] },
        { title: "2. Refund requests and failed payments", paragraphs: ["If you believe a Smallbean subscription charge was made in error, duplicated, unauthorised or otherwise requires review, submit a written request through the available Smallbean support/contact channel. Include the account email address, transaction or subscription reference, amount, date and reason for the request.", "Refunds are considered case by case in light of the purchase terms, available information, applicable law and the payment provider's processes. If approved, a refund is returned through the applicable provider to the original payment method where supported. Failed payments may result in plan restrictions, suspension or cancellation after any applicable payment-provider process or notice."] },
        { title: "3. Business bookings and customer cancellations", paragraphs: ["A booking made through Smallbean is an arrangement between the customer and the relevant business. That business is responsible for its services, cancellation policy, deposits, charges and booking-related refunds. Smallbean does not determine those terms.", "Where the business has enabled customer cancellation, a customer can use the secure booking-management link provided for the appointment. A business may set a cancellation deadline or disable customer cancellation. Customers should contact the business directly for service concerns, booking changes, deposits or refunds."] },
        { title: "4. Account closure", paragraphs: ["A business may stop using Smallbean at any time. Before closing an account, it should manage outstanding bookings and retain records it needs, subject to applicable law. This policy does not limit rights that cannot be excluded under South African law."] },
    ]} />;
}
