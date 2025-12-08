import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Fintio",
  description:
    "Fintio Privacy Policy - Learn how we collect, use, and protect your data in compliance with GDPR and EU regulations.",
};
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
export default function PrivacyPage() {
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
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground mt-2">
            Last updated: {months[currentMonth]} {new Date().getDate()},{" "}
            {new Date().getFullYear()}
          </p>
        </div>
      </header>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 prose prose-neutral dark:prose-invert">
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Fintio, a product of Collybrix Aceleradora S.L. ("Collybrix",
            "we", "our", or "us"), is committed to protecting your privacy. This
            Privacy Policy explains how we collect, use, disclose, and safeguard
            your information when you use our annual budget management
            application. This policy complies with the General Data Protection
            Regulation (GDPR) and other applicable EU data protection laws.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Fintio is owned and operated by Collybrix Aceleradora S.L., a
            company registered in the European Union.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">
            Information We Collect
          </h2>

          <h3 className="text-xl font-semibold mb-3 mt-6">
            Personal Information
          </h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We collect information that you provide directly to us, including:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Account information (name, email address, password)</li>
            <li>Profile information (country, currency preferences)</li>
            <li>
              Financial data (budget information, transactions, categories)
            </li>
            <li>Communication data (support requests, feedback)</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">
            Automatically Collected Information
          </h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            When you use our service, we automatically collect:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Device information (browser type, operating system)</li>
            <li>Usage data (features accessed, time spent)</li>
            <li>Log data (IP address, access times, error logs)</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">
            How We Use Your Information
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We use the collected information for the following purposes:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Provide, maintain, and improve our services</li>
            <li>Process your transactions and manage your account</li>
            <li>Send you technical notices and support messages</li>
            <li>Respond to your requests and provide customer support</li>
            <li>Analyze usage patterns to enhance user experience</li>
            <li>
              Detect, prevent, and address technical issues and security threats
            </li>
            <li>Comply with legal obligations and enforce our terms</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">
            Legal Basis for Processing (GDPR)
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Under GDPR, we process your personal data based on:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>
              <strong>Contract Performance:</strong> Processing necessary to
              provide our services
            </li>
            <li>
              <strong>Consent:</strong> Where you have given explicit consent
            </li>
            <li>
              <strong>Legitimate Interests:</strong> For service improvement and
              security
            </li>
            <li>
              <strong>Legal Obligation:</strong> To comply with applicable laws
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">
            Data Storage and Security
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We implement industry-standard security measures to protect your
            data:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>AES-256 encryption for data at rest</li>
            <li>TLS 1.3 encryption for data in transit</li>
            <li>Secure authentication via Clerk (OAuth providers)</li>
            <li>Regular security audits and updates</li>
            <li>Access controls and monitoring</li>
            <li>EU-based data storage (MongoDB Atlas)</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-4">
            Your financial data is stored in secure databases hosted within the
            European Union, ensuring compliance with EU data protection
            standards.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">
            Data Sharing and Disclosure
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We do not sell your personal information. We may share your data
            with:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>
              <strong>Service Providers:</strong> Third-party vendors who help
              us operate our service (e.g., Clerk for authentication, MongoDB
              for data storage)
            </li>
            <li>
              <strong>Legal Requirements:</strong> When required by law or to
              protect our rights
            </li>
            <li>
              <strong>Business Transfers:</strong> In connection with a merger,
              acquisition, or sale of assets
            </li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-4">
            All third-party service providers are GDPR-compliant and bound by
            data processing agreements.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">
            Your Rights Under GDPR
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            As a user in the EU, you have the following rights:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>
              <strong>Right to Access:</strong> Request a copy of your personal
              data
            </li>
            <li>
              <strong>Right to Rectification:</strong> Correct inaccurate or
              incomplete data
            </li>
            <li>
              <strong>Right to Erasure:</strong> Request deletion of your data
              ("right to be forgotten")
            </li>
            <li>
              <strong>Right to Restriction:</strong> Limit how we use your data
            </li>
            <li>
              <strong>Right to Data Portability:</strong> Receive your data in a
              structured format
            </li>
            <li>
              <strong>Right to Object:</strong> Object to certain data
              processing activities
            </li>
            <li>
              <strong>Right to Withdraw Consent:</strong> Withdraw consent at
              any time
            </li>
            <li>
              <strong>Right to Lodge a Complaint:</strong> File a complaint with
              your local data protection authority
            </li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-4">
            To exercise these rights, please contact us at
            privacy@fintio.app
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
          <p className="text-muted-foreground leading-relaxed">
            We retain your personal data only for as long as necessary to
            provide our services and comply with legal obligations. When you
            delete your account, we will delete or anonymize your personal data
            within 30 days, except where we are required to retain it by law.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We use cookies and similar technologies to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Maintain your session and authentication</li>
            <li>Remember your preferences</li>
            <li>Analyze site usage and performance</li>
            <li>Provide personalized features</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-4">
            You can control cookies through your browser settings. Note that
            disabling cookies may affect service functionality.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">
            International Data Transfers
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Your data is primarily stored and processed within the European
            Union. If we transfer data outside the EU, we ensure appropriate
            safeguards are in place, such as Standard Contractual Clauses (SCCs)
            approved by the European Commission.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
          <p className="text-muted-foreground leading-relaxed">
            Our service is not intended for users under 16 years of age. We do
            not knowingly collect personal information from children. If you
            believe we have collected data from a child, please contact us
            immediately.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">
            Changes to This Policy
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify
            you of significant changes by email or through a prominent notice on
            our service. Your continued use after changes indicates acceptance
            of the updated policy.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            If you have questions about this Privacy Policy or wish to exercise
            your rights, please contact us:
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
              <strong>Data Protection Officer:</strong> contact@collybrix.com
            </p>
          </div>
        </section>

        <div className="border-t border-border pt-8 mt-12">
          <p className="text-sm text-muted-foreground">
            These Terms of Service are effective as of {months[currentMonth]}{" "}
            {new Date().getDate()}, {new Date().getFullYear()}. By using
            Fintio, you acknowledge that you have read, understood, and
            agree to be bound by these policy.
          </p>
        </div>
      </article>
    </main>
  );
}
