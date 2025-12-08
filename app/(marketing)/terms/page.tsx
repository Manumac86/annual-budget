import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const metadata = {
  title: "Terms of Service | Fintio",
  description:
    "Fintio Terms of Service - Read our terms and conditions for using the annual budget management platform.",
};

export default function TermsPage() {
  const currentMonth = new Date().getMonth();
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold tracking-tight">
            Terms of Service
          </h1>
          <p className="text-muted-foreground mt-2">
            Last updated: {months[currentMonth]} {new Date().getDate()},{" "}
            {new Date().getFullYear()}
          </p>
        </div>
      </header>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 prose prose-neutral dark:prose-invert">
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Agreement to Terms</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            By accessing or using Fintio ("Service", "Platform"), a product
            of Collybrix Aceleradora S.L. ("Collybrix", "we", "us", or "our"),
            you agree to be bound by these Terms of Service ("Terms"). If you
            disagree with any part of these terms, you do not have permission to
            access the Service.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Fintio is owned and operated by Collybrix Aceleradora S.L., a
            company registered in the European Union.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Use License</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Subject to your compliance with these Terms, we grant you a limited,
            non-exclusive, non-transferable, revocable license to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>
              Access and use the Service for your personal or internal business
              purposes
            </li>
            <li>Create, store, and manage your budget data</li>
            <li>
              Access our features and functionalities as made available to you
            </li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-4 font-semibold">
            You may not:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Modify, copy, or create derivative works of the Service</li>
            <li>Reverse engineer, decompile, or disassemble the Service</li>
            <li>Remove, alter, or obscure any proprietary notices</li>
            <li>Use the Service for any illegal or unauthorized purpose</li>
            <li>Interfere with or disrupt the Service or servers</li>
            <li>
              Attempt to gain unauthorized access to any portion of the Service
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">User Accounts</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            To use certain features of the Service, you must register for an
            account. When creating an account:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>
              You must provide accurate, current, and complete information
            </li>
            <li>You must maintain the security of your account credentials</li>
            <li>You are responsible for all activities under your account</li>
            <li>You must immediately notify us of any unauthorized access</li>
            <li>You must be at least 16 years old to create an account</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-4">
            We reserve the right to suspend or terminate accounts that violate
            these Terms or are inactive for extended periods.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">User Data and Privacy</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            You retain all rights to your budget data and financial information.
            By using our Service:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>
              You grant us the right to store and process your data to provide
              the Service
            </li>
            <li>You are responsible for the accuracy of data you input</li>
            <li>You can export or delete your data at any time</li>
            <li>
              We will handle your data according to our{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Service Availability</h2>
          <p className="text-muted-foreground leading-relaxed">
            We strive to maintain high availability but do not guarantee
            uninterrupted access. The Service may be temporarily unavailable due
            to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-4">
            <li>Scheduled maintenance and updates</li>
            <li>Technical difficulties or service outages</li>
            <li>Events beyond our reasonable control (force majeure)</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-4">
            We will make reasonable efforts to notify users of planned
            maintenance in advance.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
          <p className="text-muted-foreground leading-relaxed">
            The Service, including its original content, features, and
            functionality, is owned by Collybrix Aceleradora S.L. and is
            protected by international copyright, trademark, patent, trade
            secret, and other intellectual property laws. Fintio and all
            related trademarks and trade dress may not be used without prior
            written consent from Collybrix Aceleradora S.L.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Prohibited Activities</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            You agree not to engage in any of the following prohibited
            activities:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Violating any applicable laws or regulations</li>
            <li>Infringing on intellectual property rights</li>
            <li>Transmitting viruses, malware, or harmful code</li>
            <li>Collecting or harvesting user data without consent</li>
            <li>Impersonating another user or entity</li>
            <li>Interfering with security features of the Service</li>
            <li>Engaging in automated scraping or data collection</li>
            <li>Uploading false or misleading information</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Payment Terms</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            If applicable to paid features:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>All fees are in Euros (€) unless otherwise stated</li>
            <li>
              Subscription fees are billed in advance on a recurring basis
            </li>
            <li>Payment is due immediately upon purchase</li>
            <li>
              We may modify pricing with 30 days' notice to active subscribers
            </li>
            <li>Refunds are subject to our refund policy</li>
            <li>You are responsible for all applicable taxes</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">
            Cancellation and Termination
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            <strong>Your Rights:</strong>
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>
              You may cancel your account at any time through your account
              settings
            </li>
            <li>
              Cancellation takes effect at the end of the current billing period
            </li>
            <li>You can export your data before cancellation</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mb-4 mt-4">
            <strong>Our Rights:</strong>
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>
              We may suspend or terminate accounts that violate these Terms
            </li>
            <li>We may terminate the Service with 90 days' notice</li>
            <li>
              We may immediately terminate accounts involved in illegal
              activities
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Disclaimers</h2>
          <div className="bg-muted/50 border border-border rounded-lg p-6">
            <p className="text-muted-foreground leading-relaxed font-semibold mb-4">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
              WARRANTIES OF ANY KIND.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We disclaim all warranties, express or implied, including but not
              limited to implied warranties of merchantability, fitness for a
              particular purpose, and non-infringement. We do not warrant that:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-4">
              <li>The Service will meet your requirements or expectations</li>
              <li>
                The Service will be uninterrupted, timely, secure, or error-free
              </li>
              <li>
                The results obtained from the Service will be accurate or
                reliable
              </li>
              <li>Any errors in the Service will be corrected</li>
            </ul>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">
            Limitation of Liability
          </h2>
          <div className="bg-muted/50 border border-border rounded-lg p-6">
            <p className="text-muted-foreground leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, BUDGETFLOW SHALL NOT BE
              LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
              PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER
              INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE,
              GOODWILL, OR OTHER INTANGIBLE LOSSES.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Our total liability for any claims arising from or related to the
              Service shall not exceed the amount you paid us in the 12 months
              preceding the claim, or €100, whichever is greater.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Indemnification</h2>
          <p className="text-muted-foreground leading-relaxed">
            You agree to indemnify, defend, and hold harmless Fintio and its
            officers, directors, employees, and agents from any claims,
            liabilities, damages, losses, and expenses, including reasonable
            legal fees, arising out of or related to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-4">
            <li>Your use or misuse of the Service</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any rights of another party</li>
            <li>Your User Content or data</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
          <p className="text-muted-foreground leading-relaxed">
            These Terms shall be governed by and construed in accordance with
            the laws of the European Union and applicable member state laws,
            without regard to conflict of law principles. Any disputes arising
            from these Terms or the Service shall be subject to the exclusive
            jurisdiction of the courts in the EU member state where Fintio
            is registered.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Dispute Resolution</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            In the event of a dispute:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4">
            <li>Contact us first to resolve the issue informally</li>
            <li>
              If unresolved within 30 days, either party may initiate mediation
            </li>
            <li>
              As a consumer in the EU, you have the right to use the European
              Commission's Online Dispute Resolution platform
            </li>
          </ol>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right to modify these Terms at any time. If we make
            material changes, we will notify you by email or through a prominent
            notice on the Service at least 30 days before the changes take
            effect. Your continued use of the Service after changes become
            effective constitutes acceptance of the modified Terms.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Severability</h2>
          <p className="text-muted-foreground leading-relaxed">
            If any provision of these Terms is found to be unenforceable or
            invalid, that provision will be limited or eliminated to the minimum
            extent necessary, and the remaining provisions will remain in full
            force and effect.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Entire Agreement</h2>
          <p className="text-muted-foreground leading-relaxed">
            These Terms, together with our Privacy Policy and any other legal
            notices published by us on the Service, constitute the entire
            agreement between you and Fintio concerning the Service.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            If you have questions about these Terms, please contact us:
          </p>
          <div className="bg-card border border-border rounded-lg p-6 mt-4">
            <p className="text-muted-foreground">
              <strong>Company:</strong> Collybrix Aceleradora S.L.
            </p>
            <p className="text-muted-foreground mt-2">
              <strong>Tax ID (NIF):</strong> B22842181
            </p>
            <p className="text-muted-foreground mt-2">
              <strong>Address:</strong> Calle Condado de Treviño, 9. Piso 21,
              Puerta B, Madrid, Spain
            </p>
            <p className="text-muted-foreground mt-2">
              <strong>Email:</strong> contact@collybrix.com
            </p>
            <p className="text-muted-foreground mt-2">
              <strong>Support:</strong> contact@collybrix.com
            </p>
          </div>
        </section>

        <div className="border-t border-border pt-8 mt-12">
          <p className="text-sm text-muted-foreground">
            These Terms of Service are effective as of {months[currentMonth]}{" "}
            {new Date().getDate()}, {new Date().getFullYear()}. By using
            Fintio, you acknowledge that you have read, understood, and
            agree to be bound by these Terms.
          </p>
        </div>
      </article>
    </main>
  );
}
